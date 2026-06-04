from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional
import os, logging
from pathlib import Path
from database import get_pool, init_db, close_pool
from auth import hash_password, verify_password, create_access_token, decode_token

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="OLLCOLLAB API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ── Startup / Shutdown ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("DB ready")

@app.on_event("shutdown")
async def shutdown():
    await close_pool()


# ── Auth dependency ───────────────────────────────────────────────────────────

async def current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE id = $1::uuid", payload["sub"])
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(row)


async def optional_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if not creds:
        return None
    payload = decode_token(creds.credentials)
    if not payload:
        return None
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE id = $1::uuid", payload["sub"])
    return dict(row) if row else None


# ── Helpers ───────────────────────────────────────────────────────────────────

async def create_notification(user_id, type_: str, icon: str, text: str):
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO notifications(user_id, type, icon, text) VALUES($1::uuid,$2,$3,$4)",
                user_id, type_, icon, text,
            )
    except Exception as e:
        logger.warning(f"Notification failed: {e}")


# ── Pydantic Models ───────────────────────────────────────────────────────────

class CheckEmail(BaseModel):
    email: str

class RegisterIn(BaseModel):
    email: str
    password: str
    account_type: str  # "creator" | "brand"

class LoginIn(BaseModel):
    email: str
    password: str

class CreatorProfileIn(BaseModel):
    full_name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    categories: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    instagram_url: Optional[str] = None
    followers_count: Optional[int] = None
    years_experience: Optional[int] = None
    avatar_url: Optional[str] = None

class BrandProfileIn(BaseModel):
    brand_name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    gst_number: Optional[str] = None
    logo_data: Optional[str] = None

class CreatorOnboardIn(BaseModel):
    full_name: str
    gender: str
    age: int
    area: Optional[str] = ""
    city: str
    country: str
    categories: List[str]
    instagram_url: str
    followers_count: int
    years_experience: Optional[int] = 0

class BrandOnboardIn(BaseModel):
    brand_name: str
    brand_category: str
    gst_number: str
    brand_bio: Optional[str] = ""
    logo_data: Optional[str] = ""

class OpportunityIn(BaseModel):
    title: str
    pitch: str
    description: Optional[str] = ""
    payout: int
    creators_needed: int
    deadline: str
    category: str
    cover_url: Optional[str] = ""
    requirements: Optional[List[str]] = []
    languages: Optional[List[str]] = []

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    pitch: Optional[str] = None
    description: Optional[str] = None
    payout: Optional[int] = None
    creators_needed: Optional[int] = None
    deadline: Optional[str] = None
    category: Optional[str] = None
    requirements: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    status: Optional[str] = None

class ApplyIn(BaseModel):
    opportunity_id: str
    note: Optional[str] = ""

class ApplicationStatusIn(BaseModel):
    status: str  # applied | shortlisted | accepted | rejected

class MessageIn(BaseModel):
    text: str

class OpenThreadIn(BaseModel):
    other_user_id: str


# ─────────────────────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.post("/auth/check-email")
async def check_email(body: CheckEmail):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, account_type FROM users WHERE email=$1", body.email.lower().strip())
    return {"exists": row is not None, "account_type": row["account_type"] if row else None}


@api_router.post("/auth/register")
async def register(body: RegisterIn):
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM users WHERE email=$1", body.email.lower().strip())
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        pw_hash = hash_password(body.password)
        user = await conn.fetchrow(
            "INSERT INTO users(email,password_hash,account_type) VALUES($1,$2,$3) RETURNING *",
            body.email.lower().strip(), pw_hash, body.account_type,
        )
        # Create empty profile
        if body.account_type == "creator":
            await conn.execute("INSERT INTO creator_profiles(user_id) VALUES($1::uuid)", user["id"])
        else:
            await conn.execute("INSERT INTO brand_profiles(user_id) VALUES($1::uuid)", user["id"])
    token = create_access_token(str(user["id"]), body.account_type)
    return {"token": token, "account_type": body.account_type, "onboarding_complete": False}


@api_router.post("/auth/login")
async def login(body: LoginIn):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT * FROM users WHERE email=$1", body.email.lower().strip())
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["id"]), user["account_type"])
    return {
        "token": token,
        "account_type": user["account_type"],
        "onboarding_complete": user["onboarding_complete"],
    }


@api_router.get("/auth/me")
async def me(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        if user["account_type"] == "creator":
            profile = await conn.fetchrow("SELECT * FROM creator_profiles WHERE user_id=$1::uuid", user["id"])
        else:
            profile = await conn.fetchrow("SELECT * FROM brand_profiles WHERE user_id=$1::uuid", user["id"])
    return {
        "id": str(user["id"]),
        "email": user["email"],
        "account_type": user["account_type"],
        "onboarding_complete": user["onboarding_complete"],
        "profile": dict(profile) if profile else {},
    }


# ─────────────────────────────────────────────────────────────────────────────
# ONBOARDING ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.post("/onboarding/creator")
async def onboard_creator(body: CreatorOnboardIn, user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Not a creator account")
    location = ", ".join(filter(None, [body.area, body.city, body.country]))
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO creator_profiles(user_id,full_name,gender,age,location,categories,languages,instagram_url,followers_count,years_experience)
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT(user_id) DO UPDATE SET
              full_name=$2,gender=$3,age=$4,location=$5,categories=$6,languages=$7,
              instagram_url=$8,followers_count=$9,years_experience=$10,updated_at=NOW()
        """, user["id"], body.full_name, body.gender, body.age, location,
            body.categories, [], body.instagram_url, body.followers_count, body.years_experience)
        await conn.execute("UPDATE users SET onboarding_complete=TRUE WHERE id=$1::uuid", user["id"])
    return {"success": True}


@api_router.post("/onboarding/brand")
async def onboard_brand(body: BrandOnboardIn, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Not a brand account")
    pool = await get_pool()
    async with pool.acquire() as conn:
        logo = body.logo_data or ""
        if len(logo) > 500000:  # cap at ~500KB base64
            logo = ""
        await conn.execute("""
            INSERT INTO brand_profiles(user_id,brand_name,category,gst_number,bio,logo_data)
            VALUES($1::uuid,$2,$3,$4,$5,$6)
            ON CONFLICT(user_id) DO UPDATE SET
              brand_name=$2,category=$3,gst_number=$4,bio=$5,logo_data=$6,updated_at=NOW()
        """, user["id"], body.brand_name, body.brand_category, body.gst_number, body.brand_bio, logo)
        await conn.execute("UPDATE users SET onboarding_complete=TRUE WHERE id=$1::uuid", user["id"])
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# PROFILE ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.get("/profile/creator")
async def get_creator_profile(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM creator_profiles WHERE user_id=$1::uuid", user["id"])
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    d = dict(row)
    d["user_id"] = str(d["user_id"])
    d["id"] = str(d["id"])
    return d


@api_router.put("/profile/creator")
async def update_creator_profile(body: CreatorProfileIn, user=Depends(current_user)):
    pool = await get_pool()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return {"success": True}
    cols = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates))
    vals = list(updates.values())
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE creator_profiles SET {cols}, updated_at=NOW() WHERE user_id=$1::uuid",
            user["id"], *vals,
        )
    return {"success": True}


@api_router.get("/profile/brand")
async def get_brand_profile(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM brand_profiles WHERE user_id=$1::uuid", user["id"])
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    d = dict(row)
    d["user_id"] = str(d["user_id"])
    d["id"] = str(d["id"])
    return d


@api_router.put("/profile/brand")
async def update_brand_profile(body: BrandProfileIn, user=Depends(current_user)):
    pool = await get_pool()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return {"success": True}
    cols = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates))
    vals = list(updates.values())
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE brand_profiles SET {cols}, updated_at=NOW() WHERE user_id=$1::uuid",
            user["id"], *vals,
        )
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# OPPORTUNITIES ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def _opp_row(row):
    d = dict(row)
    d["id"] = str(d["id"])
    d["brand_id"] = str(d["brand_id"])
    d["requirements"] = list(d.get("requirements") or [])
    d["languages"] = list(d.get("languages") or [])
    return d


@api_router.get("/opportunities")
async def list_opportunities(
    category: Optional[str] = None,
    search: Optional[str] = None,
    verified: Optional[bool] = None,
    min_payout: Optional[int] = None,
    language: Optional[str] = None,
    user=Depends(optional_user),
):
    pool = await get_pool()
    filters = ["status='active'"]
    params = []
    i = 1
    if category:
        filters.append(f"category=${i}"); params.append(category); i += 1
    if verified is not None:
        filters.append(f"verified=${i}"); params.append(verified); i += 1
    if min_payout is not None:
        filters.append(f"payout>=${i}"); params.append(min_payout); i += 1
    if language:
        filters.append(f"${i}=ANY(languages)"); params.append(language); i += 1
    if search:
        filters.append(f"(title ILIKE ${i} OR brand_name ILIKE ${i})")
        params.append(f"%{search}%"); i += 1
    where = " AND ".join(filters)
    async with pool.acquire() as conn:
        rows = await conn.fetch(f"SELECT * FROM opportunities WHERE {where} ORDER BY created_at DESC", *params)
    return [_opp_row(r) for r in rows]


@api_router.get("/opportunities/my-posts")
async def my_posts(user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM opportunities WHERE brand_id=$1::uuid ORDER BY created_at DESC", user["id"])
    return [_opp_row(r) for r in rows]


@api_router.get("/opportunities/{opp_id}")
async def get_opportunity(opp_id: str, user=Depends(optional_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM opportunities WHERE id=$1::uuid", opp_id)
    if not row:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _opp_row(row)


@api_router.post("/opportunities")
async def create_opportunity(body: OpportunityIn, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        brand = await conn.fetchrow("SELECT * FROM brand_profiles WHERE user_id=$1::uuid", user["id"])
        brand_name = brand["brand_name"] if brand else "Unknown Brand"
        brand_cat = brand["category"] if brand else ""
        verified = brand["verified"] if brand else False
        cover = body.cover_url or "https://images.unsplash.com/photo-1558655146-d09347e92766?w=940&q=85"
        row = await conn.fetchrow("""
            INSERT INTO opportunities(brand_id,brand_name,brand_category,title,pitch,description,
              payout,creators_needed,deadline,category,cover_url,requirements,languages,verified)
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            RETURNING *
        """, user["id"], brand_name, brand_cat, body.title, body.pitch, body.description,
            body.payout, body.creators_needed, body.deadline, body.category,
            cover, body.requirements, body.languages, verified)
    return _opp_row(row)


@api_router.put("/opportunities/{opp_id}")
async def update_opportunity(opp_id: str, body: OpportunityUpdate, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        opp = await conn.fetchrow("SELECT brand_id FROM opportunities WHERE id=$1::uuid", opp_id)
        if not opp or str(opp["brand_id"]) != str(user["id"]):
            raise HTTPException(status_code=403, detail="Not your opportunity")
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            return {"success": True}
        cols = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates))
        await conn.execute(
            f"UPDATE opportunities SET {cols} WHERE id=$1::uuid",
            opp_id, *list(updates.values()),
        )
    return {"success": True}


@api_router.delete("/opportunities/{opp_id}")
async def delete_opportunity(opp_id: str, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        opp = await conn.fetchrow("SELECT brand_id FROM opportunities WHERE id=$1::uuid", opp_id)
        if not opp or str(opp["brand_id"]) != str(user["id"]):
            raise HTTPException(status_code=403, detail="Not your opportunity")
        await conn.execute("DELETE FROM opportunities WHERE id=$1::uuid", opp_id)
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# APPLICATIONS ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def _app_row(row):
    d = dict(row)
    d["id"] = str(d["id"])
    d["opportunity_id"] = str(d["opportunity_id"])
    d["creator_id"] = str(d["creator_id"])
    d["brand_id"] = str(d["brand_id"]) if d.get("brand_id") else None
    d["applied_at"] = d["applied_at"].isoformat() if d.get("applied_at") else ""
    return d


@api_router.post("/applications")
async def apply(body: ApplyIn, user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        opp = await conn.fetchrow("SELECT * FROM opportunities WHERE id=$1::uuid", body.opportunity_id)
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        try:
            app_row = await conn.fetchrow("""
                INSERT INTO applications(opportunity_id,creator_id,brand_id,brand_name,opportunity_title,note)
                VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5,$6) RETURNING *
            """, body.opportunity_id, user["id"], opp["brand_id"],
                opp["brand_name"], opp["title"], body.note)
            await conn.execute(
                "UPDATE opportunities SET applicants_count=applicants_count+1 WHERE id=$1::uuid",
                body.opportunity_id,
            )
        except Exception:
            raise HTTPException(status_code=409, detail="Already applied")
    # Notify brand
    await create_notification(opp["brand_id"], "apply", "Users",
        f"New application received for '{opp['title']}'")
    return _app_row(app_row)


@api_router.get("/applications/mine")
async def my_applications(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM applications WHERE creator_id=$1::uuid ORDER BY applied_at DESC",
            user["id"],
        )
    return [_app_row(r) for r in rows]


@api_router.get("/applications/opportunity/{opp_id}")
async def apps_for_opportunity(opp_id: str, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT a.*, cp.full_name, cp.handle, cp.avatar_url, cp.followers_count,
                   cp.categories, cp.languages, cp.location, cp.instagram_url
            FROM applications a
            LEFT JOIN creator_profiles cp ON cp.user_id = a.creator_id
            WHERE a.opportunity_id=$1::uuid
            ORDER BY a.applied_at DESC
        """, opp_id)
    result = []
    for r in rows:
        d = _app_row(r)
        d["creator_name"] = r["full_name"] or "Creator"
        d["creator_handle"] = r["handle"] or ""
        d["creator_avatar"] = r["avatar_url"] or ""
        d["creator_followers"] = r["followers_count"] or 0
        d["creator_categories"] = list(r["categories"] or [])
        d["creator_languages"] = list(r["languages"] or [])
        d["creator_location"] = r["location"] or ""
        result.append(d)
    return result


@api_router.patch("/applications/{app_id}")
async def update_application(app_id: str, body: ApplicationStatusIn, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        app_row = await conn.fetchrow("SELECT * FROM applications WHERE id=$1::uuid", app_id)
        if not app_row:
            raise HTTPException(status_code=404, detail="Application not found")
        if str(app_row["brand_id"]) != str(user["id"]):
            raise HTTPException(status_code=403, detail="Not your listing")
        await conn.execute("UPDATE applications SET status=$1 WHERE id=$2::uuid", body.status, app_id)
    status_text = {"accepted": "accepted 🎉", "rejected": "rejected", "shortlisted": "shortlisted ⭐"}.get(body.status, body.status)
    await create_notification(app_row["creator_id"], "status", "Briefcase",
        f"{app_row['brand_name']} {status_text} your application for '{app_row['opportunity_title']}'")
    return {"success": True}


@api_router.delete("/applications/{app_id}")
async def withdraw_application(app_id: str, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        app_row = await conn.fetchrow("SELECT * FROM applications WHERE id=$1::uuid", app_id)
        if not app_row or str(app_row["creator_id"]) != str(user["id"]):
            raise HTTPException(status_code=403, detail="Not your application")
        await conn.execute("DELETE FROM applications WHERE id=$1::uuid", app_id)
        await conn.execute(
            "UPDATE opportunities SET applicants_count=GREATEST(0,applicants_count-1) WHERE id=$1::uuid",
            app_row["opportunity_id"],
        )
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# MESSAGES / THREADS ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def _thread_row(row, user_id_str):
    d = dict(row)
    d["id"] = str(d["id"])
    d["creator_id"] = str(d["creator_id"]) if d.get("creator_id") else None
    d["brand_id"] = str(d["brand_id"]) if d.get("brand_id") else None
    d["updated_at"] = d["updated_at"].isoformat() if d.get("updated_at") else ""
    return d

def _msg_row(row):
    d = dict(row)
    d["id"] = str(d["id"])
    d["thread_id"] = str(d["thread_id"])
    d["sender_id"] = str(d["sender_id"]) if d.get("sender_id") else None
    d["sent_at"] = d["sent_at"].isoformat() if d.get("sent_at") else ""
    return d


@api_router.get("/threads")
async def list_threads(user=Depends(current_user)):
    pool = await get_pool()
    col = "creator_id" if user["account_type"] == "creator" else "brand_id"
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"SELECT * FROM threads WHERE {col}=$1::uuid ORDER BY updated_at DESC",
            user["id"],
        )
    return [_thread_row(r, str(user["id"])) for r in rows]


@api_router.post("/threads/open")
async def open_thread(body: OpenThreadIn, user=Depends(current_user)):
    """Open or get existing thread between current user and another user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        other = await conn.fetchrow("SELECT * FROM users WHERE id=$1::uuid", body.other_user_id)
        if not other:
            raise HTTPException(status_code=404, detail="User not found")
        # Determine creator/brand assignment
        if user["account_type"] == "creator":
            creator_id, brand_id = user["id"], other["id"]
        else:
            creator_id, brand_id = other["id"], user["id"]
        # Get creator/brand names
        creator_prof = await conn.fetchrow("SELECT full_name FROM creator_profiles WHERE user_id=$1::uuid", creator_id)
        brand_prof = await conn.fetchrow("SELECT brand_name FROM brand_profiles WHERE user_id=$1::uuid", brand_id)
        creator_name = creator_prof["full_name"] if creator_prof else "Creator"
        brand_name = brand_prof["brand_name"] if brand_prof else "Brand"
        # Upsert thread
        row = await conn.fetchrow("""
            INSERT INTO threads(creator_id,brand_id,creator_name,brand_name)
            VALUES($1::uuid,$2::uuid,$3,$4)
            ON CONFLICT(creator_id,brand_id) DO UPDATE SET updated_at=NOW()
            RETURNING *
        """, creator_id, brand_id, creator_name, brand_name)
    return _thread_row(row, str(user["id"]))


@api_router.get("/threads/{thread_id}")
async def get_thread(thread_id: str, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM threads WHERE id=$1::uuid", thread_id)
    if not row:
        raise HTTPException(status_code=404, detail="Thread not found")
    return _thread_row(row, str(user["id"]))


@api_router.get("/threads/{thread_id}/messages")
async def get_messages(thread_id: str, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM messages WHERE thread_id=$1::uuid ORDER BY sent_at ASC",
            thread_id,
        )
    return [_msg_row(r) for r in rows]


@api_router.post("/threads/{thread_id}/messages")
async def send_message(thread_id: str, body: MessageIn, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        thread = await conn.fetchrow("SELECT * FROM threads WHERE id=$1::uuid", thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        from_role = user["account_type"]
        msg = await conn.fetchrow("""
            INSERT INTO messages(thread_id,sender_id,from_role,text)
            VALUES($1::uuid,$2::uuid,$3,$4) RETURNING *
        """, thread_id, user["id"], from_role, body.text)
        await conn.execute("""
            UPDATE threads SET last_message=$1, updated_at=NOW() WHERE id=$2::uuid
        """, body.text[:100], thread_id)
    # Notify the other party
    recipient_id = thread["brand_id"] if from_role == "creator" else thread["creator_id"]
    sender_name = thread["creator_name"] if from_role == "creator" else thread["brand_name"]
    await create_notification(recipient_id, "message", "MessageCircle",
        f"New message from {sender_name}: {body.text[:60]}")
    return _msg_row(msg)


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def _notif_row(row):
    d = dict(row)
    d["id"] = str(d["id"])
    d["user_id"] = str(d["user_id"])
    d["created_at"] = d["created_at"].isoformat() if d.get("created_at") else ""
    return d


@api_router.get("/notifications")
async def list_notifications(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM notifications WHERE user_id=$1::uuid ORDER BY created_at DESC LIMIT 50",
            user["id"],
        )
    return [_notif_row(r) for r in rows]


@api_router.patch("/notifications/{notif_id}/read")
async def mark_read(notif_id: str, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE notifications SET is_read=TRUE WHERE id=$1::uuid AND user_id=$2::uuid",
            notif_id, user["id"],
        )
    return {"success": True}


@api_router.patch("/notifications/read-all")
async def mark_all_read(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE notifications SET is_read=TRUE WHERE user_id=$1::uuid",
            user["id"],
        )
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "OLLCOLLAB API v2"}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import os, logging, json, base64
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

class CheckPhoneIn(BaseModel):
    phone: str

class SendOtpIn(BaseModel):
    phone: str

class VerifyOtpIn(BaseModel):
    phone: str
    otp: str
    account_type: str  # "creator" | "brand"

class CreatorProfileIn(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    categories: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    website_url: Optional[str] = None
    followers_count: Optional[int] = None
    collaborations_count: Optional[int] = None
    years_experience: Optional[int] = None
    avatar_url: Optional[str] = None
    worked_with: Optional[Any] = None  # JSON array of brand objects
    is_public: Optional[bool] = None

class BrandProfileIn(BaseModel):
    brand_name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    custom_category: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    gst_number: Optional[str] = None
    official_email: Optional[str] = None
    logo_data: Optional[str] = None

class CreatorOnboardIn(BaseModel):
    full_name: str
    email: Optional[str] = ""
    gender: str
    age: int
    city: str
    state: Optional[str] = ""
    country: str
    categories: List[str]
    instagram_url: str
    followers_count: int

class BrandOnboardIn(BaseModel):
    brand_name: str
    brand_category: str
    gst_number: Optional[str] = ""
    official_email: Optional[str] = ""
    brand_bio: Optional[str] = ""
    logo_data: Optional[str] = ""

class OpportunityIn(BaseModel):
    title: str
    pitch: str
    description: Optional[str] = ""
    payout: int = 0
    payout_min: Optional[int] = 0
    payout_max: Optional[int] = 0
    creators_needed: int
    deadline: str
    category: str
    cover_url: Optional[str] = ""
    requirements: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    followers_min: Optional[int] = 0
    followers_max: Optional[int] = 0
    age_min: Optional[int] = 0
    age_max: Optional[int] = 0

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    pitch: Optional[str] = None
    description: Optional[str] = None
    payout: Optional[int] = None
    payout_min: Optional[int] = None
    payout_max: Optional[int] = None
    creators_needed: Optional[int] = None
    deadline: Optional[str] = None
    category: Optional[str] = None
    cover_url: Optional[str] = None
    requirements: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    status: Optional[str] = None
    followers_min: Optional[int] = None
    followers_max: Optional[int] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None

class ReelIn(BaseModel):
    brand: str
    title: str
    instagram_url: str

    thumbnail: Optional[str] = ""
    sort_order: Optional[int] = 0

class SavedCreatorIn(BaseModel):
    creator_id: str

class ReelUpdate(BaseModel):
    brand: Optional[str] = None
    title: Optional[str] = None
    instagram_url: Optional[str] = None
    thumbnail: Optional[str] = None
    sort_order: Optional[int] = None

class ApplyIn(BaseModel):
    opportunity_id: str
    note: Optional[str] = ""
    counter_amount: Optional[int] = None

class AudienceInsightsIn(BaseModel):
    gender_male: Optional[float] = 0
    gender_female: Optional[float] = 0
    gender_other: Optional[float] = 0
    age_13_17: Optional[float] = 0
    age_18_24: Optional[float] = 0
    age_25_34: Optional[float] = 0
    age_35_44: Optional[float] = 0
    age_45_plus: Optional[float] = 0
    top_countries: Optional[List[Any]] = []
    top_cities: Optional[List[Any]] = []
    top_states: Optional[List[Any]] = []
    source_platforms: Optional[List[str]] = []

class AudienceInsightsImageIn(BaseModel):
    image_data: str
    platform: Optional[str] = "Instagram"

class CustomServiceItem(BaseModel):
    name: str
    price: Optional[int] = None

class CreatorPricingIn(BaseModel):
    currency: Optional[str] = "INR"
    negotiable: Optional[bool] = False
    ig_reel: Optional[int] = None
    ig_post: Optional[int] = None
    ig_story: Optional[int] = None
    reel_story_package: Optional[int] = None
    ugc_video: Optional[int] = None
    event_appearance: Optional[int] = None
    custom_services: Optional[List[dict]] = []

class ApplicationStatusIn(BaseModel):
    status: str  # applied | shortlisted | accepted | rejected

class MessageIn(BaseModel):
    text: str

class OpenThreadIn(BaseModel):
    other_user_id: str


# ─────────────────────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.post("/auth/check-phone")
async def check_phone(body: CheckPhoneIn):
    phone = body.phone.strip().replace(" ", "").replace("-", "")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, account_type FROM users WHERE phone_number=$1", phone)
    return {"exists": row is not None, "account_type": row["account_type"] if row else None}


@api_router.post("/auth/send-otp")
async def send_otp(body: SendOtpIn):
    # Dummy OTP — in production, integrate with SMS gateway (Twilio, MSG91, etc.)
    phone = body.phone.strip().replace(" ", "").replace("-", "")
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")
    logger.info(f"[DUMMY OTP] Would send OTP to {phone}")
    return {"success": True, "message": "OTP sent (demo mode — any 6-digit code works)"}


@api_router.post("/auth/verify-otp")
async def verify_otp(body: VerifyOtpIn):
    phone = body.phone.strip().replace(" ", "").replace("-", "")
    otp = body.otp.strip()
    # Dummy validation — accept any 6-digit numeric code
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(status_code=400, detail="OTP must be exactly 6 digits")
    if body.account_type not in ("creator", "brand"):
        raise HTTPException(status_code=400, detail="account_type must be 'creator' or 'brand'")
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT * FROM users WHERE phone_number=$1", phone)
        if user:
            # Existing user — log in
            token = create_access_token(str(user["id"]), user["account_type"])
            return {
                "token": token,
                "account_type": user["account_type"],
                "onboarding_complete": user["onboarding_complete"],
            }
        # New user — create account
        user = await conn.fetchrow(
            "INSERT INTO users(phone_number, account_type) VALUES($1,$2) RETURNING *",
            phone, body.account_type,
        )
        if body.account_type == "creator":
            await conn.execute("INSERT INTO creator_profiles(user_id) VALUES($1::uuid)", user["id"])
        else:
            await conn.execute("INSERT INTO brand_profiles(user_id) VALUES($1::uuid)", user["id"])
    token = create_access_token(str(user["id"]), body.account_type)
    return {"token": token, "account_type": body.account_type, "onboarding_complete": False}


def _serialize_profile(profile: dict) -> dict:
    """Convert asyncpg record fields to JSON-safe types."""
    d = dict(profile)
    for k, v in d.items():
        if hasattr(v, 'isoformat'):
            d[k] = v.isoformat()
    if "id" in d:
        d["id"] = str(d["id"])
    if "user_id" in d:
        d["user_id"] = str(d["user_id"])
    if "categories" in d:
        d["categories"] = list(d["categories"] or [])
    if "languages" in d:
        d["languages"] = list(d["languages"] or [])
    if "worked_with" in d:
        ww = d["worked_with"]
        if isinstance(ww, str):
            try:
                d["worked_with"] = json.loads(ww)
            except Exception:
                d["worked_with"] = []
        elif ww is None:
            d["worked_with"] = []
    return d


def _serialize_ai(row) -> Optional[dict]:
    """Serialize audience_insights row to JSON-safe dict."""
    if not row:
        return None
    d = dict(row)
    d["id"] = str(d["id"])
    d["creator_id"] = str(d["creator_id"])
    for col in ["top_countries", "top_cities", "top_states"]:
        v = d.get(col)
        if isinstance(v, str):
            try: d[col] = json.loads(v)
            except Exception: d[col] = []
        elif v is None:
            d[col] = []
    if "source_platforms" in d:
        d["source_platforms"] = list(d.get("source_platforms") or [])
    for col in ["last_uploaded_at", "last_verified_at", "updated_at"]:
        if col in d and hasattr(d.get(col), "isoformat"):
            d[col] = d[col].isoformat()
    for col in ["gender_male", "gender_female", "gender_other",
                "age_13_17", "age_18_24", "age_25_34", "age_35_44", "age_45_plus"]:
        if col in d and d[col] is not None:
            d[col] = float(d[col])
        else:
            d[col] = 0.0
    return d


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
        "email": user["email"] or "",
        "phone_number": user["phone_number"] or "",
        "account_type": user["account_type"],
        "onboarding_complete": user["onboarding_complete"],
        "profile": _serialize_profile(dict(profile)) if profile else {},
    }


# ─────────────────────────────────────────────────────────────────────────────
# ONBOARDING ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.post("/onboarding/creator")
async def onboard_creator(body: CreatorOnboardIn, user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Not a creator account")
    location = ", ".join(filter(None, [body.city, body.state, body.country]))
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO creator_profiles(user_id,full_name,email,gender,age,location,state,categories,languages,instagram_url,followers_count)
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            ON CONFLICT(user_id) DO UPDATE SET
              full_name=$2,email=$3,gender=$4,age=$5,location=$6,state=$7,categories=$8,languages=$9,
              instagram_url=$10,followers_count=$11,updated_at=NOW()
        """, user["id"], body.full_name, body.email or "", body.gender, body.age, location,
            body.state or "", body.categories, [], body.instagram_url, body.followers_count)
        await conn.execute("UPDATE users SET onboarding_complete=TRUE WHERE id=$1::uuid", user["id"])
    return {"success": True}


@api_router.post("/onboarding/brand")
async def onboard_brand(body: BrandOnboardIn, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Not a brand account")
    pool = await get_pool()
    async with pool.acquire() as conn:
        logo = body.logo_data or ""
        if len(logo) > 500000:
            logo = ""
        await conn.execute("""
            INSERT INTO brand_profiles(user_id,brand_name,category,gst_number,official_email,bio,logo_data)
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7)
            ON CONFLICT(user_id) DO UPDATE SET
              brand_name=$2,category=$3,gst_number=$4,official_email=$5,bio=$6,logo_data=$7,updated_at=NOW()
        """, user["id"], body.brand_name, body.brand_category,
            body.gst_number or "", body.official_email or "", body.brand_bio, logo)
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
    return _serialize_profile(dict(row))


@api_router.put("/profile/creator")
async def update_creator_profile(body: CreatorProfileIn, user=Depends(current_user)):
    pool = await get_pool()
    raw = body.model_dump()
    updates = {}
    for k, v in raw.items():
        if v is None:
            continue
        if k == "worked_with":
            updates[k] = json.dumps(v) if not isinstance(v, str) else v
        elif k == "handle":
            updates[k] = v.lstrip("@") if isinstance(v, str) else v
        else:
            updates[k] = v
    if not updates:
        return {"success": True}
    cols = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates))
    vals = list(updates.values())
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE creator_profiles SET {cols}, updated_at=NOW() WHERE user_id=$1::uuid",
            user["id"], *vals,
        )
        if "full_name" in updates and updates["full_name"]:
            await conn.execute(
                "UPDATE threads SET creator_name=$1 WHERE creator_id=$2::uuid",
                updates["full_name"], user["id"]
            )
    return {"success": True}


@api_router.get("/profile/brand")
async def get_brand_profile(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM brand_profiles WHERE user_id=$1::uuid", user["id"])
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _serialize_profile(dict(row))


@api_router.put("/profile/brand")
async def update_brand_profile(body: BrandProfileIn, user=Depends(current_user)):
    pool = await get_pool()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "logo_data" in updates and len(updates["logo_data"]) > 500000:
        del updates["logo_data"]
    if not updates:
        return {"success": True}
    cols = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates))
    vals = list(updates.values())
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE brand_profiles SET {cols}, updated_at=NOW() WHERE user_id=$1::uuid",
            user["id"], *vals,
        )
        # Keep opportunities in sync with brand name / category changes
        if "brand_name" in updates or "category" in updates:
            brand = await conn.fetchrow(
                "SELECT brand_name, category FROM brand_profiles WHERE user_id=$1::uuid",
                user["id"]
            )
            if brand and brand["brand_name"]:
                await conn.execute(
                    "UPDATE opportunities SET brand_name=$1, brand_category=$2 WHERE brand_id=$3::uuid",
                    brand["brand_name"], brand["category"] or "", user["id"]
                )
                await conn.execute(
                    "UPDATE threads SET brand_name=$1 WHERE brand_id=$2::uuid",
                    brand["brand_name"], user["id"]
                )
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# SAVED CREATORS ROUTES (Brand feature)
# ─────────────────────────────────────────────────────────────────────────────

@api_router.get("/saved-creators")
async def list_saved_creators(user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT sc.creator_id, sc.saved_at,
                   cp.full_name, cp.handle, cp.avatar_url, cp.followers_count,
                   cp.categories, cp.location, cp.bio, cp.collaborations_count
            FROM saved_creators sc
            LEFT JOIN creator_profiles cp ON cp.user_id = sc.creator_id
            WHERE sc.brand_id = $1::uuid
            ORDER BY sc.saved_at DESC
        """, user["id"])
    return [{
        "creator_id": str(r["creator_id"]),
        "name": r["full_name"] or "Creator",
        "handle": r["handle"] or "",
        "avatar": r["avatar_url"] or "",
        "followers": r["followers_count"] or 0,
        "categories": list(r["categories"] or []),
        "location": r["location"] or "",
        "bio": r["bio"] or "",
        "collaborations": r["collaborations_count"] or 0,
        "saved_at": r["saved_at"].isoformat() if r["saved_at"] else "",
    } for r in rows]


@api_router.post("/saved-creators")
async def save_creator(body: SavedCreatorIn, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO saved_creators(brand_id, creator_id)
            VALUES($1::uuid, $2::uuid)
            ON CONFLICT DO NOTHING
        """, user["id"], body.creator_id)
    return {"success": True}


@api_router.delete("/saved-creators/{creator_id}")
async def unsave_creator(creator_id: str, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            DELETE FROM saved_creators
            WHERE brand_id=$1::uuid AND creator_id=$2::uuid
        """, user["id"], creator_id)
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC CREATOR / BRAND PROFILE ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.get("/creators")
async def list_creators(
    search: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    min_followers: Optional[int] = None,
    location: Optional[str] = None,
    gender: Optional[str] = None,
    sort_by: Optional[str] = "followers",
    user=Depends(optional_user),
):
    """Public: list/search creators for the Brand Discover screen."""
    pool = await get_pool()
    conditions = []
    params = []
    i = 1
    if search:
        conditions.append(f"(cp.full_name ILIKE ${i} OR cp.handle ILIKE ${i})")
        params.append(f"%{search}%"); i += 1
    if category and category != "All":
        conditions.append(f"${i}=ANY(cp.categories)")
        params.append(category); i += 1
    if language:
        conditions.append(f"${i}=ANY(cp.languages)")
        params.append(language); i += 1
    if min_followers:
        conditions.append(f"cp.followers_count >= ${i}")
        params.append(min_followers); i += 1
    if location:
        conditions.append(f"cp.location ILIKE ${i}")
        params.append(f"%{location}%"); i += 1
    if gender and gender != "Any":
        conditions.append(f"LOWER(cp.gender) = LOWER(${i})")
        params.append(gender); i += 1

    order_map = {
        "followers": "cp.followers_count DESC NULLS LAST",
        "recent": "cp.updated_at DESC NULLS LAST",
        "collaborations": "cp.collaborations_count DESC NULLS LAST",
        "name": "cp.full_name ASC",
    }
    order = order_map.get(sort_by, "cp.followers_count DESC NULLS LAST")
    conditions.insert(0, "u.onboarding_complete = TRUE")
    conditions.insert(0, "u.account_type = 'creator'")
    conditions.insert(0, "cp.is_public IS NOT FALSE")
    where = "WHERE " + " AND ".join(conditions)

    async with pool.acquire() as conn:
        rows = await conn.fetch(f"""
            SELECT cp.*, u.id as uid
            FROM creator_profiles cp
            JOIN users u ON u.id = cp.user_id
            {where}
            ORDER BY {order}
            LIMIT 200
        """, *params)

    result = []
    for r in rows:
        d = _serialize_profile(dict(r))
        d["creator_user_id"] = str(r["uid"])
        result.append(d)
    return result


@api_router.get("/creators/handle/{handle}")
async def get_creator_by_handle(handle: str, user=Depends(optional_user)):
    """Public: get a creator profile by their handle."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        cp = await conn.fetchrow(
            "SELECT * FROM creator_profiles WHERE LOWER(LTRIM(handle, '@'))=LOWER(LTRIM($1, '@'))", handle
        )
        if not cp:
            raise HTTPException(status_code=404, detail="Creator not found")
        creator_user_id = str(cp["user_id"])
        reels = await conn.fetch(
            "SELECT * FROM creator_reels WHERE creator_id=$1::uuid ORDER BY sort_order, created_at DESC",
            creator_user_id,
        )
        ai = await conn.fetchrow(
            "SELECT * FROM audience_insights WHERE creator_id=$1::uuid", creator_user_id
        )
        pr = await conn.fetchrow(
            "SELECT * FROM creator_pricing WHERE creator_id=$1::uuid", creator_user_id
        )
    profile = _serialize_profile(dict(cp))
    profile["creator_user_id"] = creator_user_id
    profile["is_public"] = cp.get("is_public", True)
    profile["audience_insights"] = _serialize_ai(ai) if ai else None
    profile["pricing"] = _serialize_pricing(dict(pr)) if pr else None
    profile["reels"] = [_reel_row(r) for r in reels]
    return profile


@api_router.get("/creators/{creator_user_id}")
async def get_creator_public(creator_user_id: str, user=Depends(optional_user)):
    """Public: get a creator profile by their user_id (for brand view)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        cp = await conn.fetchrow(
            "SELECT * FROM creator_profiles WHERE user_id=$1::uuid", creator_user_id
        )
        reels = await conn.fetch(
            "SELECT * FROM creator_reels WHERE creator_id=$1::uuid ORDER BY sort_order, created_at DESC",
            creator_user_id,
        )
        ai = await conn.fetchrow(
            "SELECT * FROM audience_insights WHERE creator_id=$1::uuid", creator_user_id
        )
        pr = await conn.fetchrow(
            "SELECT * FROM creator_pricing WHERE creator_id=$1::uuid", creator_user_id
        )
    if not cp:
        raise HTTPException(status_code=404, detail="Creator not found")
    profile = _serialize_profile(dict(cp))
    profile["is_public"] = cp.get("is_public", True)
    profile["audience_insights"] = _serialize_ai(dict(ai)) if ai else None
    profile["pricing"] = _serialize_pricing(dict(pr)) if pr else None
    profile["reels"] = [
        {
            "id": str(r["id"]),
            "brand": r["brand"],
            "title": r["title"],
            "instagram_url": r["instagram_url"],
            "thumbnail": r["thumbnail"],
        }
        for r in reels
    ]
    return profile


@api_router.get("/brands/{brand_user_id}")
async def get_brand_public(brand_user_id: str, user=Depends(optional_user)):
    """Public: get a brand profile by their user_id (for creator view)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        bp = await conn.fetchrow(
            "SELECT * FROM brand_profiles WHERE user_id=$1::uuid", brand_user_id
        )
    if not bp:
        raise HTTPException(status_code=404, detail="Brand not found")
    return _serialize_profile(dict(bp))


# ─────────────────────────────────────────────────────────────────────────────
# OPPORTUNITIES ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def _opp_row(row):
    d = dict(row)
    d["id"] = str(d["id"])
    d["brand_id"] = str(d["brand_id"])
    d["requirements"] = list(d.get("requirements") or [])
    d["languages"] = list(d.get("languages") or [])
    d["payout_min"] = d.get("payout_min") or 0
    d["payout_max"] = d.get("payout_max") or 0
    d["followers_min"] = d.get("followers_min") or 0
    d["followers_max"] = d.get("followers_max") or 0
    d["age_min"] = d.get("age_min") or 0
    d["age_max"] = d.get("age_max") or 0
    if "created_at" in d and hasattr(d["created_at"], "isoformat"):
        d["created_at"] = d["created_at"].isoformat()
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
    if category and category != "All":
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
        rows = await conn.fetch(f"""
            SELECT o.*, COALESCE(bp.logo_data, '') AS brand_logo
            FROM opportunities o
            LEFT JOIN brand_profiles bp ON bp.user_id = o.brand_id
            WHERE {where} ORDER BY o.created_at DESC
        """, *params)
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
        row = await conn.fetchrow("""
            SELECT o.*,
                   bp.logo_data    AS brand_logo,
                   bp.bio          AS brand_bio,
                   bp.instagram_url AS brand_instagram,
                   bp.website_url   AS brand_website
            FROM opportunities o
            LEFT JOIN brand_profiles bp ON bp.user_id = o.brand_id
            WHERE o.id=$1::uuid
        """, opp_id)
    if not row:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    result = _opp_row(row)
    result["brand_logo"]      = row["brand_logo"]      or ""
    result["brand_bio"]       = row["brand_bio"]       or ""
    result["brand_instagram"] = row["brand_instagram"] or ""
    result["brand_website"]   = row["brand_website"]   or ""
    return result


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
        payout_val = body.payout or body.payout_max or body.payout_min or 0
        row = await conn.fetchrow("""
            INSERT INTO opportunities(brand_id,brand_name,brand_category,title,pitch,description,
              payout,payout_min,payout_max,followers_min,followers_max,
              creators_needed,deadline,category,cover_url,requirements,languages,
              age_min,age_max,verified)
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
            RETURNING *
        """, user["id"], brand_name, brand_cat, body.title, body.pitch, body.description,
            payout_val, body.payout_min or 0, body.payout_max or 0,
            body.followers_min or 0, body.followers_max or 0,
            body.creators_needed, body.deadline, body.category,
            cover, body.requirements, body.languages,
            body.age_min or 0, body.age_max or 0, verified)
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
                INSERT INTO applications(opportunity_id,creator_id,brand_id,brand_name,opportunity_title,note,counter_amount)
                VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7) RETURNING *
            """, body.opportunity_id, user["id"], opp["brand_id"],
                opp["brand_name"], opp["title"], body.note, body.counter_amount)
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
        rows = await conn.fetch("""
            SELECT a.*, COALESCE(bp.logo_data, '') AS brand_logo
            FROM applications a
            LEFT JOIN brand_profiles bp ON bp.user_id = a.brand_id
            WHERE a.creator_id=$1::uuid ORDER BY a.applied_at DESC
        """, user["id"])
    return [_app_row(r) for r in rows]


@api_router.get("/applications/opportunity/{opp_id}")
async def apps_for_opportunity(opp_id: str, user=Depends(current_user)):
    if user["account_type"] != "brand":
        raise HTTPException(status_code=403, detail="Brands only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT a.*, cp.full_name, cp.handle, cp.avatar_url, cp.followers_count,
                   cp.categories, cp.languages, cp.location, cp.instagram_url, cp.bio,
                   cp.collaborations_count, cp.worked_with
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
        d["creator_bio"] = r["bio"] or ""
        d["creator_collaborations"] = r["collaborations_count"] or 0
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
    status_text = {
        "accepted": "accepted 🎉",
        "rejected": "did not select",
        "shortlisted": "shortlisted ⭐",
    }.get(body.status, body.status)
    brand_name = app_row["brand_name"] or "A brand"
    opp_title = app_row["opportunity_title"] or "your application"
    await create_notification(
        app_row["creator_id"], "status", "Briefcase",
        f"{brand_name} has {status_text} you for '{opp_title}'"
    )
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
    # Prefer live profile names over cached thread names
    if d.get("creator_display_name"):
        d["creator_name"] = d["creator_display_name"]
    if d.get("brand_display_name"):
        d["brand_name"] = d["brand_display_name"]
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
            f"""
            SELECT t.*,
                COALESCE(cp.full_name, t.creator_name) AS creator_display_name,
                cp.avatar_url AS creator_avatar_url,
                COALESCE(bp.brand_name, t.brand_name) AS brand_display_name,
                bp.logo_data AS brand_logo_data
            FROM threads t
            LEFT JOIN creator_profiles cp ON cp.user_id = t.creator_id
            LEFT JOIN brand_profiles bp ON bp.user_id = t.brand_id
            WHERE t.{col}=$1::uuid ORDER BY t.updated_at DESC
            """,
            user["id"],
        )
    return [_thread_row(r, str(user["id"])) for r in rows]


@api_router.get("/unread-counts")
async def unread_counts(user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        unread_col = "unread_creator" if user["account_type"] == "creator" else "unread_brand"
        thread_col = "creator_id" if user["account_type"] == "creator" else "brand_id"
        msgs = await conn.fetchval(
            f"SELECT COALESCE(SUM({unread_col}), 0) FROM threads WHERE {thread_col}=$1::uuid",
            user["id"],
        )
        notifs = await conn.fetchval(
            "SELECT COUNT(*) FROM notifications WHERE user_id=$1::uuid AND is_read=FALSE",
            user["id"],
        )
    return {"messages": int(msgs or 0), "notifications": int(notifs or 0)}


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
        # Mark messages as read for current user
        thread = await conn.fetchrow("SELECT * FROM threads WHERE id=$1::uuid", thread_id)
        if thread:
            if user["account_type"] == "creator" and str(thread["creator_id"]) == str(user["id"]):
                await conn.execute("UPDATE threads SET unread_creator=0 WHERE id=$1::uuid", thread_id)
            elif user["account_type"] == "brand" and str(thread["brand_id"]) == str(user["id"]):
                await conn.execute("UPDATE threads SET unread_brand=0 WHERE id=$1::uuid", thread_id)
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
        # Update thread's last message + increment unread for other party
        if from_role == "creator":
            await conn.execute("""
                UPDATE threads SET last_message=$1, updated_at=NOW(),
                unread_brand=unread_brand+1 WHERE id=$2::uuid
            """, body.text[:100], thread_id)
        else:
            await conn.execute("""
                UPDATE threads SET last_message=$1, updated_at=NOW(),
                unread_creator=unread_creator+1 WHERE id=$2::uuid
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
# REELS ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def _reel_row(row):
    d = dict(row)
    d["id"] = str(d["id"])
    d["creator_id"] = str(d["creator_id"])
    if "created_at" in d and hasattr(d["created_at"], "isoformat"):
        d["created_at"] = d["created_at"].isoformat()
    return d


@api_router.get("/reels")
async def list_reels(user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM creator_reels WHERE creator_id=$1::uuid ORDER BY sort_order, created_at DESC",
            user["id"],
        )
    return [_reel_row(r) for r in rows]


@api_router.post("/reels")
async def create_reel(body: ReelIn, user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    thumb = body.thumbnail or ""
    if len(thumb) > 5000000:
        thumb = ""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO creator_reels(creator_id, brand, title, instagram_url, thumbnail, sort_order)
               VALUES($1::uuid,$2,$3,$4,$5,$6) RETURNING *""",
            user["id"], body.brand, body.title, body.instagram_url, thumb, body.sort_order,
        )
    return _reel_row(row)


@api_router.put("/reels/{reel_id}")
async def update_reel(reel_id: str, body: ReelUpdate, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        reel = await conn.fetchrow("SELECT creator_id FROM creator_reels WHERE id=$1::uuid", reel_id)
        if not reel or str(reel["creator_id"]) != str(user["id"]):
            raise HTTPException(status_code=403, detail="Not your reel")
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            return {"success": True}
        if "thumbnail" in updates and len(updates["thumbnail"]) > 5000000:
            updates["thumbnail"] = ""
        cols = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates))
        await conn.execute(
            f"UPDATE creator_reels SET {cols} WHERE id=$1::uuid",
            reel_id, *list(updates.values()),
        )
    return {"success": True}


@api_router.delete("/reels/{reel_id}")
async def delete_reel(reel_id: str, user=Depends(current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        reel = await conn.fetchrow("SELECT creator_id FROM creator_reels WHERE id=$1::uuid", reel_id)
        if not reel or str(reel["creator_id"]) != str(user["id"]):
            raise HTTPException(status_code=403, detail="Not your reel")
        await conn.execute("DELETE FROM creator_reels WHERE id=$1::uuid", reel_id)
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# AUDIENCE INSIGHTS
# ─────────────────────────────────────────────────────────────────────────────

@api_router.get("/audience-insights")
async def get_audience_insights(user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM audience_insights WHERE creator_id=$1::uuid", user["id"]
        )
    if not row:
        return {}
    return _serialize_ai(dict(row))


@api_router.put("/audience-insights")
async def update_audience_insights(body: AudienceInsightsIn, user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO audience_insights(
                creator_id, gender_male, gender_female, gender_other,
                age_13_17, age_18_24, age_25_34, age_35_44, age_45_plus,
                top_countries, top_cities, top_states, source_platforms,
                last_uploaded_at, updated_at
            )
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,
                   $10::jsonb,$11::jsonb,$12::jsonb,$13,NOW(),NOW())
            ON CONFLICT(creator_id) DO UPDATE SET
                gender_male=$2, gender_female=$3, gender_other=$4,
                age_13_17=$5, age_18_24=$6, age_25_34=$7, age_35_44=$8, age_45_plus=$9,
                top_countries=$10::jsonb, top_cities=$11::jsonb, top_states=$12::jsonb,
                source_platforms=$13, last_uploaded_at=NOW(), updated_at=NOW()
        """,
            user["id"],
            body.gender_male or 0, body.gender_female or 0, body.gender_other or 0,
            body.age_13_17 or 0, body.age_18_24 or 0, body.age_25_34 or 0,
            body.age_35_44 or 0, body.age_45_plus or 0,
            json.dumps(body.top_countries or []),
            json.dumps(body.top_cities or []),
            json.dumps(body.top_states or []),
            body.source_platforms or [],
        )
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORIES
# ─────────────────────────────────────────────────────────────────────────────

@api_router.post("/audience-insights/extract")
async def extract_audience_insights_from_image(body: AudienceInsightsImageIn, user=Depends(current_user)):
    """Extract audience insights from an analytics screenshot using OpenAI Vision."""
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI extraction requires an OPENAI_API_KEY secret. Add it in your project secrets, or enter data manually."
        )
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)
        img_data = body.image_data
        if "," in img_data:
            img_data = img_data.split(",", 1)[1]
        prompt = (
            "You are analyzing a social media analytics screenshot. "
            "Extract ALL audience demographic data visible and return ONLY a valid JSON object with these exact fields "
            "(use 0.0 for unknown numbers, empty arrays [] for unknown lists):\n"
            "{\n"
            "  \"gender_male\": <float percentage e.g. 62.5>,\n"
            "  \"gender_female\": <float percentage>,\n"
            "  \"gender_other\": <float percentage>,\n"
            "  \"age_13_17\": <float percentage>,\n"
            "  \"age_18_24\": <float percentage>,\n"
            "  \"age_25_34\": <float percentage>,\n"
            "  \"age_35_44\": <float percentage>,\n"
            "  \"age_45_plus\": <float percentage>,\n"
            "  \"top_cities\": [\"City1\", \"City2\"],\n"
            "  \"top_states\": [\"State1\", \"State2\"],\n"
            "  \"top_countries\": [\"Country1\", \"Country2\"],\n"
            f"  \"source_platforms\": [\"{body.platform}\"]\n"
            "}\n"
            "Return only the JSON, no markdown, no explanation."
        )
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/jpeg;base64,{img_data}",
                        "detail": "high"
                    }}
                ]
            }],
            max_tokens=600,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            parts = raw.split("```")
            raw = parts[1] if len(parts) > 1 else parts[0]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        safe = {
            "gender_male":  float(result.get("gender_male", 0)),
            "gender_female": float(result.get("gender_female", 0)),
            "gender_other": float(result.get("gender_other", 0)),
            "age_13_17":    float(result.get("age_13_17", 0)),
            "age_18_24":    float(result.get("age_18_24", 0)),
            "age_25_34":    float(result.get("age_25_34", 0)),
            "age_35_44":    float(result.get("age_35_44", 0)),
            "age_45_plus":  float(result.get("age_45_plus", 0)),
            "top_cities":   list(result.get("top_cities", [])),
            "top_states":   list(result.get("top_states", [])),
            "top_countries": list(result.get("top_countries", [])),
            "source_platforms": list(result.get("source_platforms", [body.platform])),
        }
        return {"success": True, "data": safe}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Could not parse AI response. Try a clearer screenshot.")
    except Exception as e:
        logger.error(f"Audience insights extraction error: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)[:150]}")


@api_router.get("/categories")
async def list_categories():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT name FROM categories ORDER BY sort_order, name")
        return [r["name"] for r in rows]


# ─────────────────────────────────────────────────────────────────────────────
# CREATOR PRICING
# ─────────────────────────────────────────────────────────────────────────────

def _serialize_pricing(row: dict) -> dict:
    import json as _json
    cs = row.get("custom_services", [])
    if isinstance(cs, str):
        try: cs = _json.loads(cs)
        except Exception: cs = []
    return {
        "currency": row.get("currency", "INR"),
        "negotiable": row.get("negotiable", False),
        "ig_reel": row.get("ig_reel"),
        "ig_post": row.get("ig_post"),
        "ig_story": row.get("ig_story"),
        "reel_story_package": row.get("reel_story_package"),
        "ugc_video": row.get("ugc_video"),
        "event_appearance": row.get("event_appearance"),
        "custom_services": cs if isinstance(cs, list) else [],
        "updated_at": row.get("updated_at").isoformat() if row.get("updated_at") else None,
    }


@api_router.get("/creator-pricing")
async def get_creator_pricing(user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM creator_pricing WHERE creator_id=$1::uuid", user["id"]
        )
    if not row:
        return {}
    return _serialize_pricing(dict(row))


@api_router.put("/creator-pricing")
async def update_creator_pricing(body: CreatorPricingIn, user=Depends(current_user)):
    if user["account_type"] != "creator":
        raise HTTPException(status_code=403, detail="Creators only")
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO creator_pricing(
                creator_id, currency, negotiable,
                ig_reel, ig_post, ig_story, reel_story_package,
                ugc_video, event_appearance, custom_services, updated_at
            )
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,NOW())
            ON CONFLICT(creator_id) DO UPDATE SET
                currency=$2, negotiable=$3,
                ig_reel=$4, ig_post=$5, ig_story=$6, reel_story_package=$7,
                ugc_video=$8, event_appearance=$9,
                custom_services=$10::jsonb, updated_at=NOW()
        """,
            user["id"],
            body.currency or "INR",
            body.negotiable or False,
            body.ig_reel,
            body.ig_post,
            body.ig_story,
            body.reel_story_package,
            body.ugc_video,
            body.event_appearance,
            json.dumps(body.custom_services or []),
        )
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "OLLCOLLAB API v3"}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve React frontend in production ────────────────────────────────────────
# Try multiple candidate paths so it works in dev and in the production container
_candidates = [
    ROOT_DIR / "build",                           # copied here by build command
    ROOT_DIR.parent / "frontend" / "build",       # dev workspace layout
    Path("/home/runner/workspace") / "frontend" / "build",
    Path("/app") / "frontend" / "build",
]
FRONTEND_BUILD = next((p for p in _candidates if p.exists()), None)

logger.info(f"Frontend build search paths: {[str(p) for p in _candidates]}")
logger.info(f"Frontend build found at: {FRONTEND_BUILD}")

if FRONTEND_BUILD and FRONTEND_BUILD.exists():
    # CRA outputs /static, Vite outputs /assets — mount whichever exists
    _static_dir = FRONTEND_BUILD / "static"
    _assets_dir = FRONTEND_BUILD / "assets"
    if _static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/")
    async def serve_root():
        index = FRONTEND_BUILD / "index.html"
        return FileResponse(str(index))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index = FRONTEND_BUILD / "index.html"
        return FileResponse(str(index))
else:
    @app.get("/")
    async def serve_root_fallback():
        return {"status": "backend running", "frontend": "not found", "searched": [str(p) for p in _candidates]}

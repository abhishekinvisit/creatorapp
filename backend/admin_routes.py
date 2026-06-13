from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone
import os, json, logging

from database import get_pool
from auth import hash_password, verify_password, create_access_token
from jose import JWTError, jwt

logger = logging.getLogger(__name__)

admin_router = APIRouter(prefix="/api/admin")
security = HTTPBearer(auto_error=False)

ADMIN_SECRET = os.environ.get("ADMIN_JWT_SECRET", "admin-secret-change-in-prod")
ALGORITHM = "HS256"


# ── Admin JWT ────────────────────────────────────────────────────────────────

def create_admin_token(admin_id: str, role: str) -> str:
    from datetime import timedelta
    payload = {
        "sub": admin_id,
        "role": role,
        "type": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, ADMIN_SECRET, algorithm=ALGORITHM)


def decode_admin_token(token: str):
    try:
        payload = jwt.decode(token, ADMIN_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "admin":
            return None
        return payload
    except JWTError:
        return None


async def current_admin(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if not creds:
        raise HTTPException(status_code=401, detail="Admin auth required")
    payload = decode_admin_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM admins WHERE id=$1::uuid", payload["sub"])
    if not row:
        raise HTTPException(status_code=401, detail="Admin not found")
    return dict(row)


async def super_admin_only(admin=Depends(current_admin)):
    if admin["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin only")
    return admin


async def log_action(admin_id: str, admin_name: str, action: str, target_id: str = None, target_type: str = None, details: dict = None):
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO admin_logs (admin_id, admin_name, action, target_id, target_type, details)
                   VALUES ($1::uuid, $2, $3, $4, $5, $6)""",
                admin_id, admin_name, action, target_id, target_type,
                json.dumps(details or {})
            )
    except Exception as e:
        logger.warning(f"Failed to log admin action: {e}")


# ── Pydantic Models ───────────────────────────────────────────────────────────

class AdminLoginIn(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str

class AdminCreateIn(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str
    role: str = "admin"

class SuspendUserIn(BaseModel):
    is_suspended: bool
    reason: Optional[str] = None

class VerifyUserIn(BaseModel):
    note: Optional[str] = None

class BlogIn(BaseModel):
    title: str
    slug: str
    content: Optional[str] = ""
    cover_image: Optional[str] = ""
    short_description: Optional[str] = ""
    category: Optional[str] = ""
    author: Optional[str] = ""
    tags: Optional[List[str]] = []
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""
    seo_keywords: Optional[str] = ""
    canonical_url: Optional[str] = ""
    status: Optional[str] = "draft"

class BlogUpdateIn(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    short_description: Optional[str] = None
    category: Optional[str] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    status: Optional[str] = None


# ── Auth ─────────────────────────────────────────────────────────────────────

@admin_router.post("/auth/login")
async def admin_login(body: AdminLoginIn):
    pool = await get_pool()
    async with pool.acquire() as conn:
        if body.phone:
            row = await conn.fetchrow("SELECT * FROM admins WHERE phone=$1", body.phone)
        elif body.email:
            row = await conn.fetchrow("SELECT * FROM admins WHERE email=$1", body.email)
        else:
            raise HTTPException(status_code=400, detail="Phone or email required")
        if not row or not verify_password(body.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    admin = dict(row)
    token = create_admin_token(str(admin["id"]), admin["role"])
    return {"token": token, "admin": {k: str(v) if k == "id" else v for k, v in admin.items() if k != "password_hash"}}


@admin_router.get("/auth/me")
async def admin_me(admin=Depends(current_admin)):
    return {k: str(v) if k == "id" else v for k, v in admin.items() if k != "password_hash"}


@admin_router.post("/auth/create-admin")
async def create_admin(body: AdminCreateIn, admin=Depends(super_admin_only)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM admins WHERE phone=$1 OR email=$2",
            body.phone, body.email
        )
        if existing:
            raise HTTPException(status_code=409, detail="Admin already exists")
        pw_hash = hash_password(body.password)
        row = await conn.fetchrow(
            """INSERT INTO admins (name, phone, email, password_hash, role)
               VALUES ($1,$2,$3,$4,$5) RETURNING *""",
            body.name, body.phone, body.email, pw_hash, body.role
        )
    await log_action(str(admin["id"]), admin["name"], "created_admin", str(row["id"]), "admin")
    return {k: str(v) if k == "id" else v for k, v in dict(row).items() if k != "password_hash"}


# ── Dashboard Stats ──────────────────────────────────────────────────────────

@admin_router.get("/dashboard/stats")
async def dashboard_stats(admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        total_users = await conn.fetchval("SELECT COUNT(*) FROM users")
        total_creators = await conn.fetchval("SELECT COUNT(*) FROM users WHERE account_type='creator'")
        total_brands = await conn.fetchval("SELECT COUNT(*) FROM users WHERE account_type='brand'")

        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        new_today = await conn.fetchval("SELECT COUNT(*) FROM users WHERE created_at >= $1", today_start)

        week_start = datetime.now(timezone.utc)
        from datetime import timedelta
        week_start = week_start - timedelta(days=7)
        new_week = await conn.fetchval("SELECT COUNT(*) FROM users WHERE created_at >= $1", week_start)

        month_start = datetime.now(timezone.utc) - timedelta(days=30)
        new_month = await conn.fetchval("SELECT COUNT(*) FROM users WHERE created_at >= $1", month_start)

        suspended = await conn.fetchval("SELECT COUNT(*) FROM users WHERE is_suspended=TRUE")
        verified_creators = await conn.fetchval("SELECT COUNT(*) FROM creator_profiles WHERE is_verified=TRUE")
        verified_brands = await conn.fetchval("SELECT COUNT(*) FROM brand_profiles WHERE is_verified=TRUE")

        total_opportunities = await conn.fetchval("SELECT COUNT(*) FROM opportunities")
        total_applications = await conn.fetchval("SELECT COUNT(*) FROM applications")
        total_messages = await conn.fetchval("SELECT COUNT(*) FROM messages")
        total_threads = await conn.fetchval("SELECT COUNT(*) FROM threads")
        total_blogs = await conn.fetchval("SELECT COUNT(*) FROM blogs")
        published_blogs = await conn.fetchval("SELECT COUNT(*) FROM blogs WHERE status='published'")

        growth_rows = await conn.fetch(
            """SELECT DATE(created_at) as day, COUNT(*) as count
               FROM users WHERE created_at >= $1
               GROUP BY DATE(created_at) ORDER BY day ASC""",
            month_start
        )

        top_creators = await conn.fetch(
            """SELECT u.id, cp.full_name, cp.handle, cp.avatar_url,
                      cp.followers_count, cp.is_verified
               FROM users u JOIN creator_profiles cp ON cp.user_id=u.id
               ORDER BY cp.followers_count DESC LIMIT 5"""
        )
        top_brands = await conn.fetch(
            """SELECT u.id, bp.brand_name, bp.handle, bp.logo_data,
                      bp.is_verified, COUNT(o.id) as opp_count
               FROM users u JOIN brand_profiles bp ON bp.user_id=u.id
               LEFT JOIN opportunities o ON o.brand_id=u.id
               GROUP BY u.id, bp.brand_name, bp.handle, bp.logo_data, bp.is_verified
               ORDER BY opp_count DESC LIMIT 5"""
        )

    return {
        "users": {
            "total": total_users,
            "creators": total_creators,
            "brands": total_brands,
            "new_today": new_today,
            "new_week": new_week,
            "new_month": new_month,
            "suspended": suspended,
        },
        "verification": {
            "verified_creators": verified_creators,
            "verified_brands": verified_brands,
        },
        "content": {
            "total_opportunities": total_opportunities,
            "total_applications": total_applications,
            "total_messages": total_messages,
            "total_threads": total_threads,
            "total_blogs": total_blogs,
            "published_blogs": published_blogs,
        },
        "growth": [{"day": str(r["day"]), "count": r["count"]} for r in growth_rows],
        "top_creators": [
            {"id": str(r["id"]), "name": r["full_name"], "handle": r["handle"],
             "avatar": r["avatar_url"], "followers": r["followers_count"], "verified": r["is_verified"]}
            for r in top_creators
        ],
        "top_brands": [
            {"id": str(r["id"]), "name": r["brand_name"], "handle": r["handle"],
             "logo": r["logo_data"], "verified": r["is_verified"], "opportunities": r["opp_count"]}
            for r in top_brands
        ],
    }


# ── User Management ──────────────────────────────────────────────────────────

@admin_router.get("/users")
async def list_users(
    q: Optional[str] = None,
    account_type: Optional[str] = None,
    is_verified: Optional[bool] = None,
    is_suspended: Optional[bool] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    admin=Depends(current_admin)
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions = []
        params = []
        idx = 1

        if q:
            conditions.append(
                f"""(u.phone_number ILIKE ${idx} OR u.email ILIKE ${idx}
                    OR cp.full_name ILIKE ${idx} OR cp.handle ILIKE ${idx}
                    OR bp.brand_name ILIKE ${idx} OR bp.handle ILIKE ${idx}
                    OR CAST(u.id AS TEXT) ILIKE ${idx})"""
            )
            params.append(f"%{q}%")
            idx += 1

        if account_type:
            conditions.append(f"u.account_type=${idx}")
            params.append(account_type)
            idx += 1

        if is_suspended is not None:
            conditions.append(f"u.is_suspended=${idx}")
            params.append(is_suspended)
            idx += 1

        if is_verified is not None:
            conditions.append(
                f"(cp.is_verified=${idx} OR bp.is_verified=${idx})"
            )
            params.append(is_verified)
            idx += 1

        where = "WHERE " + " AND ".join(conditions) if conditions else ""

        rows = await conn.fetch(
            f"""SELECT u.id, u.phone_number, u.email, u.account_type,
                       u.onboarding_complete, u.is_suspended, u.created_at,
                       COALESCE(cp.full_name, bp.brand_name, '') as display_name,
                       COALESCE(cp.handle, bp.handle, '') as handle,
                       COALESCE(cp.avatar_url, bp.logo_data, '') as avatar,
                       COALESCE(cp.followers_count, 0) as followers_count,
                       COALESCE(cp.is_verified, FALSE) as creator_verified,
                       COALESCE(bp.is_verified, FALSE) as brand_verified,
                       COALESCE(cp.categories, '{{}}') as categories
                FROM users u
                LEFT JOIN creator_profiles cp ON cp.user_id=u.id
                LEFT JOIN brand_profiles bp ON bp.user_id=u.id
                {where}
                ORDER BY u.created_at DESC
                LIMIT ${idx} OFFSET ${idx+1}""",
            *params, limit, offset
        )

        total = await conn.fetchval(
            f"""SELECT COUNT(*) FROM users u
                LEFT JOIN creator_profiles cp ON cp.user_id=u.id
                LEFT JOIN brand_profiles bp ON bp.user_id=u.id
                {where}""",
            *params
        )

    def fmt(r):
        d = dict(r)
        d["id"] = str(d["id"])
        d["created_at"] = str(d["created_at"])
        d["is_verified"] = d["creator_verified"] or d["brand_verified"]
        return d

    return {"users": [fmt(r) for r in rows], "total": total}


@admin_router.get("/users/{user_id}")
async def get_user(user_id: str, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT * FROM users WHERE id=$1::uuid", user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        cp = await conn.fetchrow("SELECT * FROM creator_profiles WHERE user_id=$1::uuid", user_id)
        bp = await conn.fetchrow("SELECT * FROM brand_profiles WHERE user_id=$1::uuid", user_id)
        apps = await conn.fetchval("SELECT COUNT(*) FROM applications WHERE creator_id=$1::uuid", user_id)
        msgs = await conn.fetchval("SELECT COUNT(*) FROM messages WHERE sender_id=$1::uuid", user_id)
        opps = await conn.fetchval("SELECT COUNT(*) FROM opportunities WHERE brand_id=$1::uuid", user_id)
        logs = await conn.fetch(
            "SELECT * FROM admin_logs WHERE target_id=$1 ORDER BY timestamp DESC LIMIT 10", user_id
        )

    def to_dict(r):
        if r is None:
            return None
        d = {}
        for k, v in dict(r).items():
            if hasattr(v, '__str__') and not isinstance(v, (str, int, float, bool, type(None))):
                d[k] = str(v)
            else:
                d[k] = v
        return d

    return {
        "user": to_dict(user),
        "creator_profile": to_dict(cp),
        "brand_profile": to_dict(bp),
        "stats": {"applications": apps, "messages": msgs, "opportunities": opps},
        "activity_logs": [to_dict(l) for l in logs],
    }


@admin_router.patch("/users/{user_id}/suspend")
async def suspend_user(user_id: str, body: SuspendUserIn, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE id=$1::uuid", user_id)
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        await conn.execute(
            "UPDATE users SET is_suspended=$1 WHERE id=$2::uuid",
            body.is_suspended, user_id
        )
    action = "suspended_user" if body.is_suspended else "unsuspended_user"
    await log_action(str(admin["id"]), admin["name"], action, user_id, "user",
                     {"reason": body.reason, "phone": row["phone_number"]})
    return {"success": True}


@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(super_admin_only)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT phone_number, account_type FROM users WHERE id=$1::uuid", user_id)
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        await conn.execute("DELETE FROM users WHERE id=$1::uuid", user_id)
    await log_action(str(admin["id"]), admin["name"], "deleted_user", user_id, "user",
                     {"phone": row["phone_number"], "type": row["account_type"]})
    return {"success": True}


# ── Verification ─────────────────────────────────────────────────────────────

@admin_router.post("/users/{user_id}/verify")
async def verify_user(user_id: str, body: VerifyUserIn, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT account_type FROM users WHERE id=$1::uuid", user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user["account_type"] == "creator":
            await conn.execute(
                "UPDATE creator_profiles SET is_verified=TRUE WHERE user_id=$1::uuid", user_id
            )
        else:
            await conn.execute(
                "UPDATE brand_profiles SET is_verified=TRUE WHERE user_id=$1::uuid", user_id
            )
        await conn.execute(
            """INSERT INTO verification_requests (user_id, verified_by, status, note)
               VALUES ($1::uuid, $2::uuid, 'approved', $3)
               ON CONFLICT DO NOTHING""",
            user_id, str(admin["id"]), body.note or ""
        )
    await log_action(str(admin["id"]), admin["name"], "verified_user", user_id, "user",
                     {"note": body.note, "account_type": user["account_type"]})
    return {"success": True}


@admin_router.delete("/users/{user_id}/verify")
async def remove_verification(user_id: str, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT account_type FROM users WHERE id=$1::uuid", user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user["account_type"] == "creator":
            await conn.execute(
                "UPDATE creator_profiles SET is_verified=FALSE WHERE user_id=$1::uuid", user_id
            )
        else:
            await conn.execute(
                "UPDATE brand_profiles SET is_verified=FALSE WHERE user_id=$1::uuid", user_id
            )
    await log_action(str(admin["id"]), admin["name"], "removed_verification", user_id, "user",
                     {"account_type": user["account_type"]})
    return {"success": True}


@admin_router.get("/verification")
async def list_verifications(admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT vr.*, u.account_type, u.phone_number,
                      COALESCE(cp.full_name, bp.brand_name,'') as display_name,
                      COALESCE(cp.handle, bp.handle,'') as handle,
                      COALESCE(cp.is_verified, bp.is_verified, FALSE) as is_verified,
                      a.name as verified_by_name
               FROM verification_requests vr
               JOIN users u ON u.id=vr.user_id
               LEFT JOIN creator_profiles cp ON cp.user_id=u.id
               LEFT JOIN brand_profiles bp ON bp.user_id=u.id
               LEFT JOIN admins a ON a.id=vr.verified_by
               ORDER BY vr.created_at DESC LIMIT 100"""
        )
    def fmt(r):
        d = dict(r)
        for k in ("id", "user_id", "verified_by"):
            if d.get(k):
                d[k] = str(d[k])
        d["created_at"] = str(d["created_at"])
        return d
    return {"verifications": [fmt(r) for r in rows]}


# ── Blogs ─────────────────────────────────────────────────────────────────────

@admin_router.get("/blogs")
async def list_blogs(
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    admin=Depends(current_admin)
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions, params, idx = [], [], 1
        if status:
            conditions.append(f"status=${idx}"); params.append(status); idx += 1
        if q:
            conditions.append(f"(title ILIKE ${idx} OR slug ILIKE ${idx})"); params.append(f"%{q}%"); idx += 1
        where = "WHERE " + " AND ".join(conditions) if conditions else ""
        rows = await conn.fetch(
            f"SELECT * FROM blogs {where} ORDER BY created_at DESC LIMIT ${idx} OFFSET ${idx+1}",
            *params, limit, offset
        )
        total = await conn.fetchval(f"SELECT COUNT(*) FROM blogs {where}", *params)
    def fmt(r):
        d = dict(r)
        for k in ("id", "published_at", "created_at", "updated_at"):
            if d.get(k):
                d[k] = str(d[k])
        return d
    return {"blogs": [fmt(r) for r in rows], "total": total}


@admin_router.get("/blogs/{blog_id}")
async def get_blog(blog_id: str, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM blogs WHERE id=$1::uuid", blog_id)
        if not row:
            raise HTTPException(status_code=404, detail="Blog not found")
    d = dict(row)
    for k in ("id", "published_at", "created_at", "updated_at"):
        if d.get(k):
            d[k] = str(d[k])
    return d


@admin_router.post("/blogs")
async def create_blog(body: BlogIn, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM blogs WHERE slug=$1", body.slug)
        if existing:
            raise HTTPException(status_code=409, detail="Slug already exists")
        published_at = datetime.now(timezone.utc) if body.status == "published" else None
        row = await conn.fetchrow(
            """INSERT INTO blogs (title, slug, content, cover_image, short_description, category,
               author, tags, seo_title, seo_description, seo_keywords, canonical_url, status, published_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *""",
            body.title, body.slug, body.content, body.cover_image, body.short_description,
            body.category, body.author, body.tags, body.seo_title, body.seo_description,
            body.seo_keywords, body.canonical_url, body.status, published_at
        )
    await log_action(str(admin["id"]), admin["name"], "created_blog", str(row["id"]), "blog",
                     {"title": body.title, "slug": body.slug})
    d = dict(row)
    for k in ("id", "published_at", "created_at", "updated_at"):
        if d.get(k):
            d[k] = str(d[k])
    return d


@admin_router.put("/blogs/{blog_id}")
async def update_blog(blog_id: str, body: BlogUpdateIn, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM blogs WHERE id=$1::uuid", blog_id)
        if not row:
            raise HTTPException(status_code=404, detail="Blog not found")
        updates = {}
        for field in ["title","slug","content","cover_image","short_description","category",
                      "author","tags","seo_title","seo_description","seo_keywords","canonical_url","status"]:
            val = getattr(body, field)
            if val is not None:
                updates[field] = val
        if "status" in updates and updates["status"] == "published" and not row["published_at"]:
            updates["published_at"] = datetime.now(timezone.utc)
        updates["updated_at"] = datetime.now(timezone.utc)
        set_clause = ", ".join(f"{k}=${i+2}" for i, k in enumerate(updates.keys()))
        vals = list(updates.values())
        await conn.execute(
            f"UPDATE blogs SET {set_clause} WHERE id=$1::uuid",
            blog_id, *vals
        )
        updated = await conn.fetchrow("SELECT * FROM blogs WHERE id=$1::uuid", blog_id)
    await log_action(str(admin["id"]), admin["name"], "updated_blog", blog_id, "blog",
                     {"title": updates.get("title", row["title"])})
    d = dict(updated)
    for k in ("id", "published_at", "created_at", "updated_at"):
        if d.get(k):
            d[k] = str(d[k])
    return d


@admin_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, admin=Depends(current_admin)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT title FROM blogs WHERE id=$1::uuid", blog_id)
        if not row:
            raise HTTPException(status_code=404, detail="Blog not found")
        await conn.execute("DELETE FROM blogs WHERE id=$1::uuid", blog_id)
    await log_action(str(admin["id"]), admin["name"], "deleted_blog", blog_id, "blog",
                     {"title": row["title"]})
    return {"success": True}


# ── Analytics ────────────────────────────────────────────────────────────────

@admin_router.get("/analytics")
async def get_analytics(admin=Depends(current_admin)):
    from datetime import timedelta
    pool = await get_pool()
    async with pool.acquire() as conn:
        now = datetime.now(timezone.utc)
        month_ago = now - timedelta(days=30)

        daily_registrations = await conn.fetch(
            """SELECT DATE(created_at) as day,
                      SUM(CASE WHEN account_type='creator' THEN 1 ELSE 0 END) as creators,
                      SUM(CASE WHEN account_type='brand' THEN 1 ELSE 0 END) as brands,
                      COUNT(*) as total
               FROM users WHERE created_at >= $1
               GROUP BY DATE(created_at) ORDER BY day ASC""", month_ago
        )

        collab_stats = await conn.fetchrow(
            """SELECT COUNT(*) as total,
                      SUM(CASE WHEN status='applied' THEN 1 ELSE 0 END) as pending,
                      SUM(CASE WHEN status='accepted' THEN 1 ELSE 0 END) as accepted,
                      SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected
               FROM applications"""
        )

        msg_daily = await conn.fetch(
            """SELECT DATE(sent_at) as day, COUNT(*) as count
               FROM messages WHERE sent_at >= $1
               GROUP BY DATE(sent_at) ORDER BY day ASC""", month_ago
        )

        top_categories = await conn.fetch(
            """SELECT unnest(categories) as category, COUNT(*) as count
               FROM creator_profiles GROUP BY category ORDER BY count DESC LIMIT 10"""
        )

        opp_by_category = await conn.fetch(
            """SELECT category, COUNT(*) as count FROM opportunities
               GROUP BY category ORDER BY count DESC LIMIT 10"""
        )

        avg_followers = await conn.fetchval(
            "SELECT AVG(followers_count) FROM creator_profiles WHERE followers_count > 0"
        )

    return {
        "daily_registrations": [
            {"day": str(r["day"]), "creators": r["creators"], "brands": r["brands"], "total": r["total"]}
            for r in daily_registrations
        ],
        "collaborations": dict(collab_stats) if collab_stats else {},
        "daily_messages": [{"day": str(r["day"]), "count": r["count"]} for r in msg_daily],
        "top_creator_categories": [{"category": r["category"], "count": r["count"]} for r in top_categories],
        "opportunities_by_category": [{"category": r["category"], "count": r["count"]} for r in opp_by_category],
        "avg_creator_followers": float(avg_followers) if avg_followers else 0,
    }


# ── Admin Logs ───────────────────────────────────────────────────────────────

@admin_router.get("/logs")
async def get_admin_logs(
    limit: int = Query(100, le=500),
    offset: int = 0,
    admin=Depends(current_admin)
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT $1 OFFSET $2",
            limit, offset
        )
        total = await conn.fetchval("SELECT COUNT(*) FROM admin_logs")
    def fmt(r):
        d = dict(r)
        d["id"] = str(d["id"])
        if d.get("admin_id"): d["admin_id"] = str(d["admin_id"])
        d["timestamp"] = str(d["timestamp"])
        if isinstance(d.get("details"), str):
            try: d["details"] = json.loads(d["details"])
            except: pass
        return d
    return {"logs": [fmt(r) for r in rows], "total": total}


# ── Admins List ──────────────────────────────────────────────────────────────

@admin_router.get("/admins")
async def list_admins(admin=Depends(super_admin_only)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id,name,phone,email,role,created_at FROM admins ORDER BY created_at DESC")
    def fmt(r):
        d = dict(r)
        d["id"] = str(d["id"])
        d["created_at"] = str(d["created_at"])
        return d
    return {"admins": [fmt(r) for r in rows]}

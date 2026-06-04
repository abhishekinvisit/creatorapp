import asyncpg
import os
import logging

logger = logging.getLogger(__name__)

_pool = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.environ["DATABASE_URL"],
            min_size=2,
            max_size=10,
            statement_cache_size=0,  # required for PgBouncer compatibility
        )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


SCHEMA = """
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) DEFAULT '',
    handle VARCHAR(100) DEFAULT '',
    bio TEXT DEFAULT '',
    location VARCHAR(255) DEFAULT '',
    gender VARCHAR(50) DEFAULT '',
    age INTEGER DEFAULT 0,
    categories TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    instagram_url VARCHAR(500) DEFAULT '',
    followers_count INTEGER DEFAULT 0,
    years_experience INTEGER DEFAULT 0,
    avatar_url TEXT DEFAULT '',
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    collaborations_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    brand_name VARCHAR(255) DEFAULT '',
    handle VARCHAR(100) DEFAULT '',
    bio TEXT DEFAULT '',
    category VARCHAR(100) DEFAULT '',
    gst_number VARCHAR(30) DEFAULT '',
    logo_data TEXT DEFAULT '',
    verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) DEFAULT '',
    brand_category VARCHAR(100) DEFAULT '',
    title VARCHAR(500) DEFAULT '',
    pitch TEXT DEFAULT '',
    description TEXT DEFAULT '',
    payout INTEGER DEFAULT 0,
    creators_needed INTEGER DEFAULT 1,
    deadline VARCHAR(100) DEFAULT '',
    category VARCHAR(100) DEFAULT '',
    cover_url TEXT DEFAULT '',
    requirements TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    applicants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES users(id),
    brand_name VARCHAR(255) DEFAULT '',
    opportunity_title VARCHAR(500) DEFAULT '',
    status VARCHAR(50) DEFAULT 'applied',
    note TEXT DEFAULT '',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, creator_id)
);

CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id),
    brand_id UUID REFERENCES users(id),
    brand_name VARCHAR(255) DEFAULT '',
    creator_name VARCHAR(255) DEFAULT '',
    last_message TEXT DEFAULT '',
    unread_creator INTEGER DEFAULT 0,
    unread_brand INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creator_id, brand_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    from_role VARCHAR(20) DEFAULT 'creator',
    text TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'info',
    icon VARCHAR(50) DEFAULT 'Bell',
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_brand_id ON opportunities(brand_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_applications_creator_id ON applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
"""


async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(SCHEMA)
    logger.info("Database schema initialised")

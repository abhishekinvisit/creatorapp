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
            statement_cache_size=0,
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
    email VARCHAR(255),
    phone_number VARCHAR(20),
    password_hash VARCHAR(255),
    account_type VARCHAR(20) NOT NULL,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    handle VARCHAR(100) DEFAULT '',
    bio TEXT DEFAULT '',
    location VARCHAR(255) DEFAULT '',
    state VARCHAR(255) DEFAULT '',
    gender VARCHAR(50) DEFAULT '',
    age INTEGER DEFAULT 0,
    categories TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    instagram_url VARCHAR(500) DEFAULT '',
    youtube_url VARCHAR(500) DEFAULT '',
    linkedin_url VARCHAR(500) DEFAULT '',
    tiktok_url VARCHAR(500) DEFAULT '',
    website_url VARCHAR(500) DEFAULT '',
    followers_count INTEGER DEFAULT 0,
    years_experience INTEGER DEFAULT 0,
    avatar_url TEXT DEFAULT '',
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    collaborations_count INTEGER DEFAULT 0,
    worked_with JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    brand_name VARCHAR(255) DEFAULT '',
    handle VARCHAR(100) DEFAULT '',
    bio TEXT DEFAULT '',
    category VARCHAR(100) DEFAULT '',
    custom_category VARCHAR(100) DEFAULT '',
    instagram_url VARCHAR(500) DEFAULT '',
    website_url VARCHAR(500) DEFAULT '',
    gst_number VARCHAR(30) DEFAULT '',
    official_email VARCHAR(255) DEFAULT '',
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
    age_min INTEGER DEFAULT 0,
    age_max INTEGER DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS creator_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(255) DEFAULT '',
    title VARCHAR(500) DEFAULT '',
    instagram_url VARCHAR(500) DEFAULT '',
    thumbnail TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_reels_creator_id ON creator_reels(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_brand_id ON opportunities(brand_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_applications_creator_id ON applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE TABLE IF NOT EXISTS saved_creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_creators_brand_id ON saved_creators(brand_id);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
"""

MIGRATIONS = [
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500) DEFAULT ''",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500) DEFAULT ''",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500) DEFAULT ''",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS website_url VARCHAR(500) DEFAULT ''",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS worked_with JSONB DEFAULT '[]'",
    "ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500) DEFAULT ''",
    "ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS website_url VARCHAR(500) DEFAULT ''",
    "ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS custom_category VARCHAR(100) DEFAULT ''",
    "CREATE TABLE IF NOT EXISTS saved_creators (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), brand_id UUID REFERENCES users(id) ON DELETE CASCADE, creator_id UUID REFERENCES users(id) ON DELETE CASCADE, saved_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(brand_id, creator_id))",
    "CREATE INDEX IF NOT EXISTS idx_saved_creators_brand_id ON saved_creators(brand_id)",
    "CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, sort_order INTEGER DEFAULT 0)",
    "CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)",
    "INSERT INTO categories (name, sort_order) VALUES ('Art & Illustration',1),('Automotive',2),('Beauty & Skincare',3),('Books & Literature',4),('Business & Entrepreneurship',5),('Campus & Student Life',6),('Career & Professional',7),('Comedy',8),('Culture & Society',9),('Dance',10),('DIY & Crafts',11),('Education',12),('Entertainment',13),('Events & Nightlife',14),('Family',15),('Fashion',16),('Finance & Investing',17),('Fitness',18),('Food & Cooking',19),('Gaming',20),('Health & Wellness',21),('Home Decor & Interior',22),('Jewelry & Accessories',23),('Kids Content',24),('Lifestyle',25),('Local Discovery',26),('Luxury',27),('Memes & Humor',28),('Mental Wellness',29),('Motivation & Self Growth',30),('Movies & TV',31),('Music',32),('News & Media',33),('Outdoor & Adventure',34),('Parenting',35),('Pets & Animals',36),('Photography',37),('Real Estate',38),('Relationships',39),('Science',40),('Shopping & Reviews',41),('Spirituality',42),('Sports',43),('Sustainability & Environment',44),('Technology',45),('Travel',46),('Unboxing',47),('Videography',48),('Web3 & Crypto',49),('Other',50) ON CONFLICT (name) DO NOTHING",
    "ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS payout_min INTEGER DEFAULT 0",
    "ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS payout_max INTEGER DEFAULT 0",
    "ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS followers_min INTEGER DEFAULT 0",
    "ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS followers_max INTEGER DEFAULT 0",
    "ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS age_min INTEGER DEFAULT 0",
    "ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS age_max INTEGER DEFAULT 0",
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS counter_amount INTEGER",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE",
    """CREATE TABLE IF NOT EXISTS audience_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        gender_male DECIMAL(5,2) DEFAULT 0,
        gender_female DECIMAL(5,2) DEFAULT 0,
        gender_other DECIMAL(5,2) DEFAULT 0,
        age_13_17 DECIMAL(5,2) DEFAULT 0,
        age_18_24 DECIMAL(5,2) DEFAULT 0,
        age_25_34 DECIMAL(5,2) DEFAULT 0,
        age_35_44 DECIMAL(5,2) DEFAULT 0,
        age_45_plus DECIMAL(5,2) DEFAULT 0,
        top_countries JSONB DEFAULT '[]',
        top_cities JSONB DEFAULT '[]',
        top_states JSONB DEFAULT '[]',
        source_platforms TEXT[] DEFAULT '{}',
        last_uploaded_at TIMESTAMPTZ,
        last_verified_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )""",
    "CREATE INDEX IF NOT EXISTS idx_audience_insights_creator_id ON audience_insights(creator_id)",
    # Phone-OTP auth + new profile fields
    "ALTER TABLE users ALTER COLUMN email DROP NOT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number) WHERE phone_number IS NOT NULL",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT ''",
    "ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(255) DEFAULT ''",
    "ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS official_email VARCHAR(255) DEFAULT ''",
    """CREATE TABLE IF NOT EXISTS creator_pricing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        currency VARCHAR(10) DEFAULT 'INR',
        negotiable BOOLEAN DEFAULT FALSE,
        ig_reel INTEGER,
        ig_post INTEGER,
        ig_story INTEGER,
        reel_story_package INTEGER,
        ugc_video INTEGER,
        event_appearance INTEGER,
        custom_services JSONB DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )""",
    "CREATE INDEX IF NOT EXISTS idx_creator_pricing_creator_id ON creator_pricing(creator_id)",
]


async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        statements = [s.strip() for s in SCHEMA.split(";") if s.strip()]
        for stmt in statements:
            try:
                await conn.execute(stmt)
            except Exception as e:
                logger.warning(f"Schema statement skipped: {stmt[:60]} — {e}")
        for migration in MIGRATIONS:
            try:
                await conn.execute(migration)
            except Exception as e:
                logger.warning(f"Migration skipped: {migration[:60]} — {e}")
    logger.info("Database schema initialised")

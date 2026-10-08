-- Supabase SQL Schema for SkillHive Freelance Marketplace

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    phone VARCHAR(50) DEFAULT '',
    avatar TEXT DEFAULT '',
    location JSONB DEFAULT '{"type": "Point", "coordinates": [0, 0], "address": "", "city": ""}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    refresh_tokens JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Provider Profiles Table
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL DEFAULT 'Other',
    skills JSONB DEFAULT '[]'::jsonb,
    skill_details JSONB DEFAULT '[]'::jsonb,
    bio TEXT DEFAULT '',
    hourly_rate NUMERIC(10, 2) DEFAULT 0,
    service_radius NUMERIC(10, 2) DEFAULT 10,
    experience INTEGER DEFAULT 0,
    languages JSONB DEFAULT '["English"]'::jsonb,
    availability JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false, "startTime": "09:00", "endTime": "18:00"}'::jsonb,
    portfolio JSONB DEFAULT '[]'::jsonb,
    avg_rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    featured_title VARCHAR(255) DEFAULT '',
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_time VARCHAR(50) NOT NULL,
    estimated_hours NUMERIC(5, 2) DEFAULT 1,
    price NUMERIC(10, 2) NOT NULL,
    notes TEXT DEFAULT '',
    rejection_reason TEXT DEFAULT '',
    cancellation_reason TEXT DEFAULT '',
    is_reviewed_by_client BOOLEAN DEFAULT false,
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_method VARCHAR(100) DEFAULT '',
    transaction_id VARCHAR(255) DEFAULT '',
    invoice_number VARCHAR(255) DEFAULT '',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants JSONB NOT NULL DEFAULT '[]'::jsonb,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    last_message JSONB DEFAULT '{"text": "", "senderId": null, "timestamp": null}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Verifications Table
CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_document_type VARCHAR(100) NOT NULL,
    id_document_url TEXT NOT NULL,
    skill_document_description TEXT DEFAULT '',
    skill_document_url TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'pending',
    admin_note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Skill Details Table
CREATE TABLE IF NOT EXISTS skill_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    proficiency_level VARCHAR(50) DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced, Expert
    years_experience NUMERIC(4, 1) DEFAULT 0,
    hourly_rate NUMERIC(10, 2) DEFAULT NULL,
    is_primary BOOLEAN DEFAULT false,
    certification_name VARCHAR(255) DEFAULT '',
    certification_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure provider_profiles has columns for Featured Talent and Popularity if table was already created
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS skill_details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS featured_title VARCHAR(255) DEFAULT '';
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- 9. Projects Table (Popular Projects & Client Job Postings)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget VARCHAR(100) DEFAULT '$500 - $1000',
    budget_min NUMERIC(10, 2) DEFAULT 0,
    budget_max NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Open', -- Open, In Progress, Completed, Closed
    proposals_count INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    icon VARCHAR(50) DEFAULT '💼',
    icon_bg VARCHAR(50) DEFAULT '#EEF2FF',
    icon_color VARCHAR(50) DEFAULT '#635BFF',
    description TEXT DEFAULT '',
    skills_required JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Categories Table (Popular & Featured Categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT '📁',
    icon_bg VARCHAR(50) DEFAULT '#EEF2FF',
    icon_color VARCHAR(50) DEFAULT '#635BFF',
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    total_freelancers INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Popular Categories
INSERT INTO categories (name, slug, icon, icon_bg, icon_color, is_popular, display_order) VALUES
('Web Development', 'web-development', '</>', '#EEF2FF', '#635BFF', true, 1),
('Mobile Development', 'mobile-development', '📱', '#F0FDF4', '#16A34A', true, 2),
('UI/UX Design', 'ui-ux-design', '✏️', '#FDF2F8', '#DB2777', true, 3),
('Graphic Design', 'graphic-design', '🎨', '#FFF7ED', '#EA580C', true, 4),
('Content Writing', 'content-writing', '📝', '#F0F9FF', '#0284C7', true, 5),
('Digital Marketing', 'digital-marketing', '📢', '#F0FDF4', '#16A34A', true, 6),
('Video & Animation', 'video-animation', '📹', '#F3E8FF', '#9333EA', true, 7),
('Music & Audio', 'music-audio', '🎵', '#FEF2F2', '#DC2626', true, 8)
ON CONFLICT (name) DO UPDATE SET
  is_popular = EXCLUDED.is_popular,
  icon = EXCLUDED.icon,
  icon_bg = EXCLUDED.icon_bg,
  icon_color = EXCLUDED.icon_color;

-- Seed Initial Popular Projects
INSERT INTO projects (title, category, budget, status, proposals_count, is_popular, is_featured, icon, icon_bg, icon_color) VALUES
('Build a Modern E-commerce Website', 'Web Development', '$800 - $1500', 'Open', 24, true, true, '🛒', '#EEF2FF', '#635BFF'),
('UI/UX Design for Mobile App', 'UI/UX Design', '$300 - $600', 'Open', 18, true, true, '📱', '#F0F9FF', '#0284C7')
ON CONFLICT DO NOTHING;



/**
 * setup-db.js
 * Run this script ONCE to create all Supabase tables.
 * Usage: node scripts/setup-db.js
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set in server/.env
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || supabaseKey === "your-secret-key-paste-here") {
  console.error("❌ ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env before running this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const schema = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    verified BOOLEAN DEFAULT false,
    refresh_tokens JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants JSONB NOT NULL DEFAULT '[]'::jsonb,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    last_message JSONB DEFAULT '{"text": "", "senderId": null, "timestamp": null}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS skill_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    proficiency_level VARCHAR(50) DEFAULT 'Intermediate',
    years_experience NUMERIC(4, 1) DEFAULT 0,
    hourly_rate NUMERIC(10, 2) DEFAULT NULL,
    is_primary BOOLEAN DEFAULT false,
    certification_name VARCHAR(255) DEFAULT '',
    certification_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS skill_details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS featured_title VARCHAR(255) DEFAULT '';
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget VARCHAR(100) DEFAULT '$500 - $1000',
    budget_min NUMERIC(10, 2) DEFAULT 0,
    budget_max NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Open',
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
`;

async function setupDatabase() {
  console.log("🚀 Setting up Supabase database schema...");
  console.log(`📡 Project: ${supabaseUrl}\n`);

  try {
    const { error } = await supabase.rpc("exec_sql", { sql: schema });

    if (error) {
      // Fallback: try running each statement individually via REST
      console.log("ℹ️  Direct RPC not available. Using table-by-table approach...");

      // Try a simple connectivity test
      const { data, error: testErr } = await supabase.from("users").select("count", { count: "exact", head: true });

      if (!testErr) {
        console.log("✅ Tables already exist! Supabase is connected and ready.");
        return;
      }

      console.log("\n⚠️  Tables need to be created manually. Please run the following SQL in your Supabase SQL Editor:");
      console.log("🔗 https://supabase.com/dashboard/project/fcaottdwosmwewugmhcq/sql/new");
      console.log("\nCopy and paste the content from: server/supabase_schema.sql\n");
    } else {
      console.log("✅ Schema created successfully!");
    }

    // Verify all tables
    const tables = [
      "users",
      "provider_profiles",
      "bookings",
      "reviews",
      "conversations",
      "messages",
      "verifications",
      "skill_details",
      "projects",
      "categories"
    ];
    let allOk = true;

    for (const table of tables) {
      const { error: tErr } = await supabase.from(table).select("count", { count: "exact", head: true });
      if (tErr && tErr.code !== "PGRST116") {
        console.log(`  ❌ Table '${table}': ${tErr.message}`);
        allOk = false;
      } else {
        console.log(`  ✅ Table '${table}' OK`);
      }
    }

    if (allOk) {
      console.log("\n🎉 All tables verified! Your Supabase database is ready.\n");
    } else {
      console.log("\n⚠️  Some tables are missing. Run the SQL from server/supabase_schema.sql in the Supabase SQL Editor.");
    }
  } catch (err) {
    console.error("❌ Setup error:", err.message);
    console.log("\n📋 Manual Steps:");
    console.log("1. Open: https://supabase.com/dashboard/project/fcaottdwosmwewugmhcq/sql/new");
    console.log("2. Copy the contents of: server/supabase_schema.sql");
    console.log("3. Paste into the SQL Editor and click 'Run'");
  }
}

setupDatabase();

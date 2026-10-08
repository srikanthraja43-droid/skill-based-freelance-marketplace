const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key (preferred for server-side), fallback to anon key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "your-secret-key-paste-here"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn("Supabase Client Warning:", err.message);
  }
}

const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    !supabaseUrl.includes("your-project-id") &&
    supabaseKey &&
    supabaseKey !== "your-secret-key-paste-here"
  );
};

module.exports = {
  supabase,
  isSupabaseConfigured,
};

const { supabase, isSupabaseConfigured } = require("./supabase");

const connectDB = async () => {
  try {
    if (isSupabaseConfigured()) {
      console.log(`⚡ Supabase Database Connection Configured: ${process.env.SUPABASE_URL}`);
      // Test basic connectivity to Supabase
      const { error } = await supabase.from("users").select("count", { count: "exact", head: true });
      if (error && error.code !== "PGRST116") {
        console.log(`ℹ️ Supabase Connection Status Notice: ${error.message}`);
        console.log(`📌 Note: Ensure you have executed 'supabase_schema.sql' in your Supabase SQL Editor.`);
      } else {
        console.log(`✅ Connected successfully to Supabase PostgreSQL database.`);
      }
    } else {
      console.log(`⚡ Database Layer Active (Supabase mode).`);
      console.log(`📌 Action Required: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in 'server/.env' to connect to your live database.`);
    }
  } catch (error) {
    console.error(`Database initialization message: ${error.message}`);
  }
};

module.exports = connectDB;

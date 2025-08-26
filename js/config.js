/**
 * Database Configuration for Sun Shine Club
 * 
 * To enable real-time database integration:
 * 1. Follow the setup guide in DATABASE_SETUP.md
 * 2. Replace the placeholder values below with your actual Supabase credentials
 * 3. Save this file
 */

// 🔧 CONFIGURATION - Replace with your Supabase credentials
const DATABASE_CONFIG = {
  // Set to true to enable database integration
  ENABLE_DATABASE: true, // ← ENABLED NOW
  
  // Your Supabase project URL (from your screenshot)
  SUPABASE_URL: 'https://shfvqvkgngajblnmxmdp.supabase.co',
  
  // Your Supabase SERVICE_ROLE key (needed for admin operations)
  // ⚠️ IMPORTANT: You need the service_role key, not the anon key!
  // Get it from: Supabase Dashboard → Settings → API → service_role (secret)
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZnZxdmtnbmdhamJsbm14bWRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE1MzA0MCwiZXhwIjoyMDcxNzI5MDQwfQ.2DThzH_hlNeHHf4lIX5lPKEpwfs_9jX05FK-t3QiHC8',
  
  // Optional: Enable real-time features
  ENABLE_REALTIME: true,
  
  // Optional: Debug mode for development
  DEBUG_MODE: true
};

// 🚀 Initialize database with configuration
if (window.db && DATABASE_CONFIG.ENABLE_DATABASE) {
  // Update database manager with your credentials
  window.db.supabaseUrl = DATABASE_CONFIG.SUPABASE_URL;
  window.db.supabaseKey = DATABASE_CONFIG.SUPABASE_SERVICE_KEY; // Use service key for admin operations
  window.db.apiUrl = `${DATABASE_CONFIG.SUPABASE_URL}/rest/v1`;
  window.db.realtimeUrl = `${DATABASE_CONFIG.SUPABASE_URL}/realtime/v1`;
  
  window.db.headers = {
    'apikey': DATABASE_CONFIG.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${DATABASE_CONFIG.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };
  
  if (DATABASE_CONFIG.DEBUG_MODE) {
    console.log('🗄️ Database configured successfully');
    console.log('📡 Real-time features:', DATABASE_CONFIG.ENABLE_REALTIME ? 'Enabled' : 'Disabled');
  }
} else if (DATABASE_CONFIG.DEBUG_MODE) {
  console.log('📱 Running in offline mode - database disabled');
  console.log('💡 To enable database: Set ENABLE_DATABASE to true and add your Supabase credentials');
}

// Export configuration for other modules
window.DATABASE_CONFIG = DATABASE_CONFIG;

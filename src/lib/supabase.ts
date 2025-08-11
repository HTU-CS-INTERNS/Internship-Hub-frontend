import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side client with service role key (for admin operations)
// This should only be initialized on the server-side to avoid exposing the service role key.
const initializeSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    // On the client, return null or a dummy client.
    return null;
  }
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Admin client not initialized.');
    return null;
  }

  return createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export const supabaseAdmin = initializeSupabaseAdmin();

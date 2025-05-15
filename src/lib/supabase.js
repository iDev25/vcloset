import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
// Only create the client if we have valid credentials
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Supabase URL and/or anon key not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
  // Create a mock client that won't throw errors but won't work either
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({})
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
          maybeSingle: () => Promise.resolve({ data: null }),
          order: () => Promise.resolve({ data: [] })
        }),
        order: () => Promise.resolve({ data: [] }),
        contains: () => ({
          order: () => Promise.resolve({ data: [] })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
      })
    })
  };
}

export { supabase };

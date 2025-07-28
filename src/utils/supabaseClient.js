// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Optional: log a helpful warning during dev if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '❌ Supabase credentials are missing! Check your .env file for REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

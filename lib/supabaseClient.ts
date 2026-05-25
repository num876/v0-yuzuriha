import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Bulletproof warning check for unconfigured environments
if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  if (typeof window !== 'undefined') {
    console.warn(
      'Supabase client is not fully configured. Please define NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseKey !== '' &&
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && 
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
  supabaseKey !== 'your_supabase_anon_key_here';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

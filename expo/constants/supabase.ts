import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && 
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: undefined,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

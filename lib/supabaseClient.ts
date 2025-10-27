// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Get your URL and Key from the .env.local file you already made
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
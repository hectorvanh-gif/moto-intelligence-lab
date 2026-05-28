import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Nuevo proyecto Supabase — moto-intelligence-lab
const SUPABASE_URL = "https://rbumxwchxgjbtxsxutbl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FJ0Skr8u_WADS-KpchPLGA_o3eq9ps3";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
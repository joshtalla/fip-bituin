import { createClient } from "@supabase/supabase-js";

const supaURL = process.env.VITE_SUPABASE_URL;
const supaAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supaURL, supaAnonKey);



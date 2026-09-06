import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ydswydifmafjvtlqbmmm.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc3d5ZGlmbWFmanZ0bHFibW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDgxODMsImV4cCI6MjA5ODIyNDE4M30.v2dZoNUJf1wYobrYoJ6FOs3ySJYzs5v2DRjb_dTfeRk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

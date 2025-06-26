
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://sxvinlpdgatvhwyhdjwe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dmlubHBkZ2F0dmh3eWhkandlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzgyNzEsImV4cCI6MjA2NTU1NDI3MX0.vGlaofBnz5P12dioi0WvcgiC65eSB1tvl0glFOk0xRU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = 'https://jxszlvhjufllmnqfouiz.supabase.co'
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c3psdmhqdWZsbG1ucWZvdWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3Mjk5ODAsImV4cCI6MjA0NjMwNTk4MH0.xk4gYA0gSAlGXZsdrqDCIkc0PjIR9r10gzLW-fkvNko";
export const supabase = createClient(supabaseUrl, supabaseAnonKey );

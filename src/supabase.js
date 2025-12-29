import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gdplyqomyckiaiorafmk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcGx5cW9teWNraWFpb3JhZm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzY2NjMsImV4cCI6MjA4MjU1MjY2M30.k52iDUf1ax0EDvweE-LI5WEELaf8_Jdo5JntMNlNbRU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

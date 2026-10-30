import { createClient } from '@supabase/supabase-js';

// 1. Initialize the real Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Fetch live data from the 'incidents' table
export const getIncidents = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false }); // Puts newest incidents at the top

  if (error) {
    console.error("Error fetching incidents:", error.message);
    return [];
  }

  return data;
};
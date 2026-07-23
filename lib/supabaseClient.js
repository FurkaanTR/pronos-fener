import { createClient } from "@supabase/supabase-js";

// Ces deux valeurs seront fournies par le coffre-fort de Vercel,
// jamais écrites en clair ici.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(url, key);

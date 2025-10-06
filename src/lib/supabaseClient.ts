import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
	// eslint-disable-next-line no-console
	console.warn('Supabase env vars are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

// Create a single instance to avoid multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient | null = null;

export const supabase = (() => {
	if (!supabaseInstance) {
		supabaseInstance = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
			auth: {
				persistSession: true,
				detectSessionInUrl: true,
			},
		});
	}
	return supabaseInstance;
})();



// Supabase connection — the anon/publishable key is safe to expose in
// client-side code by design; it can only do what Row Level Security allows.
const SUPABASE_URL = 'https://redkvlqooitnwersxysv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xUreHjEspBPPU22YL6O2CA_BoVATJdw';

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

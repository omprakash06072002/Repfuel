/*
 RepFuel Supabase browser configuration.
 Paste ONLY your Project URL and PUBLISHABLE key.
 Never put a service_role/secret key in GitHub Pages.
*/
window.REPFUEL_SUPABASE_URL = 'https://wukvqhuwtikczsgdfvws.supabase.co/rest/v1/';
window.REPFUEL_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_z42tPwWWCnZjwKr3AfxIZg_yTjm-Axq';

if (window.supabase && window.REPFUEL_SUPABASE_URL.startsWith('https://')
    && !window.REPFUEL_SUPABASE_URL.includes('YOUR-PROJECT-ID')
    && !window.REPFUEL_SUPABASE_PUBLISHABLE_KEY.includes('YOUR_KEY_HERE')) {
  window.repSupabase = window.supabase.createClient(
    window.REPFUEL_SUPABASE_URL,
    window.REPFUEL_SUPABASE_PUBLISHABLE_KEY,
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
  );
}

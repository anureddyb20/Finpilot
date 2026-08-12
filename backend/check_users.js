const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('YOUR_'))
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Supabase URL:", supabaseUrl);
  const { data: profiles, error: err } = await supabase.from('profiles').select('*');
  if (err) {
    console.error("Error reading profiles:", err);
  } else {
    console.log("Profiles count:", profiles.length);
    console.log("Profiles:", profiles.map(p => ({ id: p.id, full_name: p.full_name, country: p.country })));
  }
}
check();

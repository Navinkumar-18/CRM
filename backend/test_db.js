const { createClient } = require('@supabase/supabase-js');
const env = require('dotenv').config({ path: 'backend/.env' }).parsed;

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Error:', error);
  console.log('Users:', data);
}
test();

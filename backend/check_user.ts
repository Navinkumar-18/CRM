import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function check() {
  const { data, error } = await supabase.from('users').update({ password_hash: '$2a$12$IyTovZyAnhPuJMj8FBW55.vczd1gt6Iwcpw2lSAYb/0ZWGTKr5nEK' }).eq('email', 'staff@gmail.com');
  console.log(data, error);
}

check();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kjinmyqxlliwbiangyhr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-secret-key'
);

async function check() {
  const { data, error } = await supabase.from('users').update({ password_hash: '$2a$12$yn.mLpNM/YLvyRg47LCWduqszLHtpkZ6CmPWrK6uvh6uoNC7idSki' }).eq('email', 'manager@gmail.com');
  console.log(data, error);
}

check();

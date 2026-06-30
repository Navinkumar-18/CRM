import { supabase } from './backend/src/config/supabase';

async function test() {
  const { data, count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  console.log('Error:', error);
  console.log('Count:', count);
  console.log('Data length:', data?.length);
}
test();

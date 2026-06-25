import { supabase } from './src/config/supabase';

async function test() {
  const { data, count, error } = await supabase
    .from('customers')
    .select('assigned_to', { count: 'exact' });
  console.log('Error:', error);
  console.log('Count:', count);
}
test();

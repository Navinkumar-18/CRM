import { supabase } from './src/config/supabase';

async function test() {
  const tables = ['companies', 'contacts', 'deals', 'leads', 'tasks'];
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table}: ${count}`);
  }
}
test();

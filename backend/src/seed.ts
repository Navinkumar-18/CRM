import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { env } from './config/env';

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seedAdminEmail =
  process.env.SEED_ADMIN_EMAIL || 'nerupunavin450@gmail.com';
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

const isMissingColumnError = (error: any, column: string): boolean => {
  return error && typeof error.message === 'string' && error.message.includes(`'${column}' column`);
};

const seed = async () => {
  try {
    // Test connection
    const { error: connError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (connError) {
      throw new Error(connError.message);
    }
    console.log('Supabase Connected for Seeding...');

    // Clear existing data (order matters for FK constraints)
    await supabase
      .from('activities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('customers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Cleared existing data...');

    // 1. Create Users
    const passwordHash = await bcrypt.hash(seedAdminPassword, 12);

    const createUser = async (email: string, name: string, role: string) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          name,
          role,
          is_verified: true,
        })
        .select('*')
        .single();

      if (error)
        throw new Error(`Failed to create user ${email}: ${error.message}`);
      return data!;
    };

    const admin = await createUser(seedAdminEmail, 'Admin User', 'admin');
    const manager = await createUser(
      'manager@gmail.com',
      'Manager User',
      'manager',
    );
    const employee = await createUser(
      'employee@gmail.com',
      'Employee User',
      'employee',
    );

    const users = [admin, manager, employee];
    console.log('Created Users...');

    // 2. Create Customers
    try {
      const customerStatuses = ['active', 'inactive', 'prospect'] as const;
      const sectors = ['general', 'school', 'hospital', 'ecommerce'] as const;
      const customers: any[] = [];

      for (let i = 1; i <= 10; i++) {
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: `Customer ${i}`,
            email: `customer${i}@example.com`,
            phone: `+123456789${i.toString().padStart(2, '0')}`,
            company: `Company ${i}`,
            address: `${i} Main St, City`,
            status: customerStatuses[i % 3],
            sector: sectors[i % 4],
            notes: `Notes for customer ${i}`,
            assigned_to: users[i % 3].id,
          })
          .select('id')
          .single();

        if (error)
          throw new Error(`Failed to create customer ${i}: ${error.message}`);
        customers.push(data!);
      }
      console.log('Created Customers...');

      // 3. Create Leads
      const leadStatuses = [
        'new',
        'contacted',
        'qualified',
        'won',
        'lost',
      ] as const;
      const leads: any[] = [];

      for (let i = 1; i <= 15; i++) {
        const { data, error } = await supabase
          .from('leads')
          .insert({
            name: `Lead ${i}`,
            email: `lead${i}@example.com`,
            phone: `+198765432${i.toString().padStart(2, '0')}`,
            source: ['Website', 'Referral', 'Cold Call'][i % 3],
            status: leadStatuses[i % 5],
            sector: sectors[i % 4],
            notes: `Notes for lead ${i}`,
            assigned_to: users[i % 3].id,
          })
          .select('id')
          .single();

        if (error)
          throw new Error(`Failed to create lead ${i}: ${error.message}`);
        leads.push(data!);
      }
      console.log('Created Leads...');

      // 4. Create Tasks
      const taskStatuses = ['pending', 'in_progress', 'completed'] as const;
      const taskPriorities = ['low', 'medium', 'high'] as const;
      const tasks: any[] = [];

      for (let i = 1; i <= 20; i++) {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: `Task ${i}`,
            description: `Description for task ${i}`,
            status: taskStatuses[i % 3],
            priority: taskPriorities[i % 3],
            due_date: new Date(
              Date.now() + i * 24 * 60 * 60 * 1000,
            ).toISOString(),
            assigned_to: users[i % 3].id,
            customer_id: customers[i % 10].id,
          })
          .select('id')
          .single();

        if (error)
          throw new Error(`Failed to create task ${i}: ${error.message}`);
        tasks.push(data!);
      }
      console.log('Created Tasks...');

      // 5. Create Activities
      const activityTypes = [
        'customer_created',
        'customer_updated',
        'lead_created',
        'lead_updated',
        'task_assigned',
        'task_completed',
      ] as const;

      for (let i = 1; i <= 30; i++) {
        const { error } = await supabase.from('activities').insert({
          type: activityTypes[i % 6],
          description: `Activity description ${i}`,
          user_id: users[i % 3].id,
          customer_id: customers[i % 10].id,
          lead_id: leads[i % 15].id,
          task_id: tasks[i % 20].id,
        });

        if (error)
          throw new Error(`Failed to create activity ${i}: ${error.message}`);
      }
      console.log('Created Activities...');
    } catch (err: any) {
      console.error('Failed to seed related entities (schema missing?):', err.message);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

void seed();

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { env } from './config/env';

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'nerupunavin450@gmail.com';
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

const seed = async () => {
  // Safety guard: never run seed against production
  if (env.nodeEnv === 'production') {
    console.error('❌ SEED BLOCKED: Cannot run seed against production environment.');
    process.exit(1);
  }

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
    await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Cleared existing data...');

    // 1. Create Users (Admin + Indian Celebrities as Staff)
    const passwordHash = await bcrypt.hash(seedAdminPassword, 12);

    const createUser = async (email: string, name: string, role: string) => {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        const { data, error } = await supabase
          .from('users')
          .update({
            password_hash: passwordHash,
            name,
            role,
            is_verified: true,
          })
          .eq('email', email)
          .select('*')
          .single();

        if (error) throw new Error(`Failed to update user ${email}: ${error.message}`);
        return data!;
      }

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

      if (error) throw new Error(`Failed to create user ${email}: ${error.message}`);
      return data!;
    };

    const admin = await createUser(seedAdminEmail, 'Admin User', 'admin');
    const amitabh = await createUser('amitabh@gmail.com', 'Amitabh Bachchan', 'manager');
    const rajini = await createUser('rajini@gmail.com', 'Rajinikanth', 'manager');
    const shahrukh = await createUser('shahrukh@gmail.com', 'Shah Rukh Khan', 'employee');
    const priyanka = await createUser('priyanka@gmail.com', 'Priyanka Chopra', 'employee');
    const deepika = await createUser('deepika@gmail.com', 'Deepika Padukone', 'employee');
    const ranbir = await createUser('ranbir@gmail.com', 'Ranbir Kapoor', 'employee');
    const alia = await createUser('alia@gmail.com', 'Alia Bhatt', 'employee');
    const aishwarya = await createUser('aishwarya@gmail.com', 'Aishwarya Rai', 'employee');

    const staffUsers = [amitabh, rajini, shahrukh, priyanka, deepika, ranbir, alia, aishwarya];
    console.log('Created Users successfully in Supabase DB...');

    // 2. Create Customers from legacy localstorage & business data
    const customerSeedData = [
      {
        name: 'Robert Vance (Vance Refrigeration)',
        email: 'rvance@vancerefrigeration.com',
        phone: '+1 312 555 0190',
        company: 'Vance Refrigeration',
        address: '400 Industrial Way, Scranton, PA',
        status: 'active',
        sector: 'manufacturing',
        notes: 'Long term VIP client. Monthly check-in required.',
        assigned_to: shahrukh.id,
      },
      {
        name: 'Jan Levinson (White-Sellers Corp)',
        email: 'jlevinson@whitesellers.com',
        phone: '+1 212 555 0180',
        company: 'White-Sellers Corp',
        address: '800 Park Ave, New York, NY',
        status: 'active',
        sector: 'general',
        notes: 'Upgraded license from 10 to 25 seats last month.',
        assigned_to: priyanka.id,
      },
      {
        name: 'Dr. Gregory House (Princeton Plainsboro)',
        email: 'ghouse@ppth.org',
        phone: '+1 609 555 0170',
        company: 'Princeton Plainsboro Teaching Hospital',
        address: '100 Medical Center Dr, Princeton, NJ',
        status: 'active',
        sector: 'hospital',
        notes: 'Custom HIPAA compliant storage module active.',
        assigned_to: deepika.id,
      },
      {
        name: 'Arthur Pendelton (Sunnyside School District)',
        email: 'apendelton@sunnysidedistrict.edu',
        phone: '+1 415 555 0160',
        company: 'Sunnyside School District',
        address: '55 Education Blvd, San Francisco, CA',
        status: 'prospect',
        sector: 'school',
        notes: 'Pilot program ending in 2 weeks. Prepare renewal proposal.',
        assigned_to: rajini.id,
      },
      {
        name: 'Monica Geller (Jessa Boutique)',
        email: 'monica@jessaboutique.com',
        phone: '+1 212 555 0150',
        company: 'Jessa Boutique Online',
        address: '20 Bleecker St, New York, NY',
        status: 'inactive',
        sector: 'ecommerce',
        notes: 'Temporarily paused during off-season.',
        assigned_to: alia.id,
      },
      {
        name: 'Vijay Mallya (Kingfisher Retail)',
        email: 'vmallya@kingfisher.in',
        phone: '+91 98400 12345',
        company: 'Kingfisher Enterprises',
        address: 'UB City, Bengaluru, KA',
        status: 'active',
        sector: 'ecommerce',
        notes: 'High volume enterprise client.',
        assigned_to: ranbir.id,
      },
      {
        name: 'Vikram Sarabhai (SpaceTech Labs)',
        email: 'vsarabhai@spacetech.org',
        phone: '+91 98250 54321',
        company: 'SpaceTech Solutions',
        address: 'ISRO Enclave, Ahmedabad, GJ',
        status: 'active',
        sector: 'general',
        notes: 'Key defense partner.',
        assigned_to: amitabh.id,
      },
      {
        name: 'Ratan Tata (Tata Educational Trust)',
        email: 'rtata@tatatrusts.org',
        phone: '+91 98200 99999',
        company: 'Tata Educational Trust',
        address: 'Bombay House, Mumbai, MH',
        status: 'active',
        sector: 'school',
        notes: 'CSR CRM implementation across 100 schools.',
        assigned_to: aishwarya.id,
      },
    ];

    const customers: any[] = [];
    for (const c of customerSeedData) {
      const { data, error } = await supabase.from('customers').insert(c).select('*').single();
      if (error) throw new Error(`Failed customer insert: ${error.message}`);
      customers.push(data);
    }
    console.log(`Created ${customers.length} Customers in Supabase DB...`);

    // 3. Create Leads from legacy localstorage & business data
    const leadSeedData = [
      {
        name: 'Acme Global Software',
        email: 'procurement@acmeglobal.com',
        phone: '+1 800 555 0199',
        source: 'Website',
        status: 'qualified',
        sector: 'ecommerce',
        notes: 'Requested demo of enterprise tier for 50+ user license.',
        assigned_to: shahrukh.id,
      },
      {
        name: 'Starlight Education Institute',
        email: 'admin@starlightedu.org',
        phone: '+1 800 555 0188',
        source: 'Referral',
        status: 'contacted',
        sector: 'school',
        notes: 'Interested in CRM for student admissions tracking.',
        assigned_to: priyanka.id,
      },
      {
        name: 'Metro City Hospital Network',
        email: 'it.director@metrohospital.org',
        phone: '+1 800 555 0177',
        source: 'Cold Call',
        status: 'new',
        sector: 'hospital',
        notes: 'Need secure patient interaction log and scheduling integration.',
        assigned_to: deepika.id,
      },
      {
        name: 'Nexus Real Estate Group',
        email: 'contact@nexusrealty.com',
        phone: '+1 800 555 0166',
        source: 'Social Media',
        status: 'contacted',
        sector: 'general',
        notes: 'Expanding to 10 new branches, looking for multi-office CRM.',
        assigned_to: rajini.id,
      },
      {
        name: 'Apex Manufacturing Logistics',
        email: 'ops@apexmfg.com',
        phone: '+1 800 555 0155',
        source: 'Email',
        status: 'won',
        sector: 'manufacturing',
        notes: 'Contract signed for annual subscription. Onboarding next week.',
        assigned_to: amitabh.id,
      },
      {
        name: 'TechStream Solutions',
        email: 'info@techstream.io',
        phone: '+1 800 555 0144',
        source: 'Website',
        status: 'qualified',
        sector: 'general',
        notes: 'Follow up after proposal review.',
        assigned_to: ranbir.id,
      },
      {
        name: 'GreenValley Schools',
        email: 'admissions@greenvalley.edu',
        phone: '+1 800 555 0133',
        source: 'Referral',
        status: 'new',
        sector: 'school',
        notes: 'Informed by board member about Zuna CRM capabilities.',
        assigned_to: alia.id,
      },
      {
        name: 'Apollo Health Systems',
        email: 'contact@apollohealth.in',
        phone: '+91 44 2829 0000',
        source: 'Website',
        status: 'qualified',
        sector: 'hospital',
        notes: 'Enterprise rollout across 12 hospital hubs.',
        assigned_to: aishwarya.id,
      },
    ];

    const leads: any[] = [];
    for (const l of leadSeedData) {
      const { data, error } = await supabase.from('leads').insert(l).select('*').single();
      if (error) throw new Error(`Failed lead insert: ${error.message}`);
      leads.push(data);
    }
    console.log(`Created ${leads.length} Leads in Supabase DB...`);

    // 4. Create Tasks from legacy localstorage & business data
    const taskSeedData = [
      {
        title: 'Prepare Custom Pricing Proposal for Acme Global',
        description: 'Draft the enterprise tier pricing discount and email to procurement team.',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 3600000 * 24 * 1).toISOString().split('T')[0],
        assigned_to: shahrukh.id,
        customer_id: customers[0].id,
      },
      {
        title: 'Quarterly Check-in Call with Vance Refrigeration',
        description: 'Review system usage, answer support queries, and pitch the new Analytics add-on.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 3600000 * 24 * 2).toISOString().split('T')[0],
        assigned_to: shahrukh.id,
        customer_id: customers[0].id,
      },
      {
        title: 'Send Onboarding Welcome Kit to Apex Logistics',
        description: 'Provide login credentials, admin documentation link, and schedule onboarding webinar.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() - 3600000 * 24 * 1).toISOString().split('T')[0],
        assigned_to: amitabh.id,
        customer_id: customers[1].id,
      },
      {
        title: 'Follow up on Pilot Renewal with Sunnyside School District',
        description: 'Call Arthur Pendelton regarding the upcoming contract renewal decision.',
        status: 'pending',
        priority: 'high',
        due_date: new Date().toISOString().split('T')[0],
        assigned_to: rajini.id,
        customer_id: customers[3].id,
      },
      {
        title: 'Schedule Product Demo for Starlight Education',
        description: 'Coordinate 30-min Zoom demo with their admissions tracking team.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 3600000 * 24 * 3).toISOString().split('T')[0],
        assigned_to: priyanka.id,
        customer_id: customers[2].id,
      },
    ];

    const tasks: any[] = [];
    for (const t of taskSeedData) {
      const { data, error } = await supabase.from('tasks').insert(t).select('*').single();
      if (error) throw new Error(`Failed task insert: ${error.message}`);
      tasks.push(data);
    }
    console.log(`Created ${tasks.length} Tasks in Supabase DB...`);

    // 5. Create Activities
    const activitySeedData: Record<string, any>[] = [
      {
        type: 'task_completed',
        description: 'completed task "Send Onboarding Welcome Kit to Apex Logistics"',
        user_id: amitabh.id,
        customer_id: customers[1].id,
        task_id: tasks[2].id,
      },
      {
        type: 'lead_updated',
        description: 'changed lead status of "Acme Global Software" to Qualified',
        user_id: shahrukh.id,
        lead_id: leads[0].id,
      },
      {
        type: 'customer_updated',
        description: 'added follow-up notes for customer "Robert Vance (Vance Refrigeration)"',
        user_id: shahrukh.id,
        customer_id: customers[0].id,
      },
      {
        type: 'task_assigned',
        description: 'assigned task "Prepare Custom Pricing Proposal for Acme Global" to Shah Rukh Khan',
        user_id: admin.id,
        task_id: tasks[0].id,
      },
    ];

    for (const act of activitySeedData) {
      const { error } = await supabase.from('activities').insert(act);
      if (error) console.error('Activity insert note:', error.message);
    }
    console.log('Created Activities in Supabase DB...');

    console.log('🎉 SEEDING COMPLETE! All legacy localStorage data imported into Supabase database.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

void seed();

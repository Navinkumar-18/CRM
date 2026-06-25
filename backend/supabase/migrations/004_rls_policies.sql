-- Row-Level Security policies as defense-in-depth.
-- Backend uses service-role (bypasses RLS), but policies document
-- intended access rules for any future direct Supabase Auth usage.

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self ON users
  FOR ALL USING (auth.uid() = id);

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_admin ON customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY customers_own ON customers
  FOR ALL USING (auth.uid()::text = assigned_to);

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_admin ON leads
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY leads_own ON leads
  FOR ALL USING (auth.uid()::text = assigned_to);

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_admin ON tasks
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY tasks_own ON tasks
  FOR ALL USING (auth.uid()::text = assigned_to);

-- Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY activities_admin ON activities
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY activities_own ON activities
  FOR ALL USING (auth.uid()::text = user_id);

-- Refresh tokens
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY refresh_tokens_self ON refresh_tokens
  FOR ALL USING (auth.uid() = user_id);

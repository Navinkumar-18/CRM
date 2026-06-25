-- ================================================================
-- 005_mvp_schema.sql — Zuna CRM Full MVP Schema
-- Run this against your Supabase PostgreSQL instance
-- ================================================================

-- ── Companies (the B2B account) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  industry        VARCHAR(100),
  website         VARCHAR(255),
  phone           VARCHAR(50),
  email           VARCHAR(254),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'India',
  gst_number      VARCHAR(20),
  iso_certificate VARCHAR(100),
  verified        BOOLEAN DEFAULT false,
  sector          VARCHAR(50) NOT NULL DEFAULT 'general',
  owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Contacts (people within companies) ─────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100),
  email       VARCHAR(254),
  phone       VARCHAR(50),
  title       VARCHAR(100),
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Leads: add missing columns ──────────────────────────────────
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS value       NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS created_by  UUID REFERENCES users(id) ON DELETE SET NULL;

-- ── Deals (sales pipeline) ─────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE deal_stage AS ENUM (
    'prospecting', 'qualification', 'proposal',
    'negotiation', 'closed_won', 'closed_lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS deals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  value             NUMERIC(15,2) NOT NULL DEFAULT 0,
  stage             deal_stage NOT NULL DEFAULT 'prospecting',
  probability       SMALLINT DEFAULT 10 CHECK (probability BETWEEN 0 AND 100),
  expected_close_dt DATE,
  actual_close_dt   DATE,
  lead_id           UUID REFERENCES leads(id) ON DELETE SET NULL,
  company_id        UUID REFERENCES companies(id) ON DELETE SET NULL,
  contact_id        UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by        UUID NOT NULL REFERENCES users(id),
  lost_reason       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Notes (polymorphic — attach to any entity) ─────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body        TEXT NOT NULL,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id     UUID REFERENCES leads(id) ON DELETE CASCADE,
  deal_id     UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT notes_has_parent CHECK (
    num_nonnulls(lead_id, deal_id, contact_id, company_id) >= 1
  )
);

-- ── Tasks: extend with entity links ────────────────────────────
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS lead_id    UUID REFERENCES leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deal_id    UUID REFERENCES deals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- ── Activities: extend with new entity links + metadata ────────
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS deal_id    UUID REFERENCES deals(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata   JSONB;

-- Drop and recreate the type check to extend enum values
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check CHECK (type IN (
  'customer_created',  'customer_updated',
  'lead_created',      'lead_updated',      'lead_assigned',
  'deal_created',      'deal_updated',      'deal_stage_changed',
  'contact_created',   'contact_updated',
  'company_created',   'company_updated',
  'task_assigned',     'task_completed',
  'note_added',
  'custom'
));

-- ── Custom Modules (multi-industry engine) ──────────────────────
CREATE TABLE IF NOT EXISTS custom_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(50) DEFAULT 'cube',
  sector      VARCHAR(50) NOT NULL DEFAULT 'general',
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE field_type AS ENUM (
    'text', 'number', 'date', 'boolean',
    'select', 'multi_select', 'file', 'relation'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS custom_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID NOT NULL REFERENCES custom_modules(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,
  field_key   VARCHAR(100) NOT NULL,
  field_type  field_type NOT NULL DEFAULT 'text',
  required    BOOLEAN DEFAULT false,
  options     JSONB,
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (module_id, field_key)
);

CREATE TABLE IF NOT EXISTS custom_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID NOT NULL REFERENCES custom_modules(id) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}',
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_companies_owner    ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_sector   ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_contacts_company   ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner     ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned     ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_company      ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned     ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_stage        ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_company      ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead         ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_notes_deal         ON notes(deal_id);
CREATE INDEX IF NOT EXISTS idx_notes_contact      ON notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_notes_company      ON notes(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_records_mod ON custom_records(module_id);
CREATE INDEX IF NOT EXISTS idx_custom_records_data ON custom_records USING GIN (data);

-- ── updated_at triggers for new tables ─────────────────────────
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER custom_modules_updated_at BEFORE UPDATE ON custom_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER custom_records_updated_at BEFORE UPDATE ON custom_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS for new tables ──────────────────────────────────────────
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_admin ON companies
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY companies_own ON companies
  FOR ALL USING (auth.uid()::text = owner_id::text);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_admin ON contacts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY contacts_own ON contacts
  FOR ALL USING (auth.uid()::text = owner_id::text);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deals_admin ON deals
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY deals_own ON deals
  FOR ALL USING (auth.uid()::text = assigned_to::text);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY notes_admin ON notes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY notes_own ON notes
  FOR ALL USING (auth.uid()::text = author_id::text);

ALTER TABLE custom_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY custom_modules_all ON custom_modules FOR SELECT USING (true);
CREATE POLICY custom_modules_admin ON custom_modules
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE custom_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY custom_records_admin ON custom_records
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY custom_records_own ON custom_records
  FOR ALL USING (auth.uid()::text = owner_id::text);

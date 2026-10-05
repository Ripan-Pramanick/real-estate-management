-- =========================================================================
-- DOMUS REAL ESTATE SAAS - SUPABASE POSTGRESQL SCHEMA
-- =========================================================================
-- Run this script in your Supabase Project: Dashboard > SQL Editor > New query
-- This script provisions all tables, indexes, and Row Level Security (RLS) policies.
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SAAS TENANTS
CREATE TABLE IF NOT EXISTS saas_tenants (
  id VARCHAR(64) PRIMARY KEY,
  company_name TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  subscription_plan TEXT NOT NULL DEFAULT 'Basic',
  status TEXT NOT NULL DEFAULT 'Active',
  purchase_amount NUMERIC NOT NULL DEFAULT 0,
  purchase_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  properties_limit INT NOT NULL DEFAULT 10,
  projects_limit INT NOT NULL DEFAULT 5,
  contact_phone TEXT NOT NULL,
  notes TEXT,
  billing_cycle TEXT NOT NULL DEFAULT 'Monthly',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planning',
  progress NUMERIC NOT NULL DEFAULT 0,
  budget NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  manager TEXT NOT NULL,
  description TEXT NOT NULL,
  site_supervisor TEXT NOT NULL,
  safety_rating TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMPLOYEES & STAFF
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  salary NUMERIC NOT NULL DEFAULT 0,
  joining_date TEXT NOT NULL,
  assigned_project TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ASSETS & MACHINERY
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Operational',
  value NUMERIC NOT NULL DEFAULT 0,
  purchase_date TEXT NOT NULL,
  location TEXT NOT NULL,
  last_service_date TEXT NOT NULL,
  assigned_project TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSES & LEDGER
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APARTMENTS / UNITS
CREATE TABLE IF NOT EXISTS apartments (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  building_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  price NUMERIC NOT NULL DEFAULT 0,
  area_sqft NUMERIC NOT NULL DEFAULT 0,
  tenant_name TEXT,
  lease_start TEXT,
  lease_end TEXT,
  monthly_rent NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATERIALS & INVENTORY
CREATE TABLE IF NOT EXISTS materials (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock_level NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  supplier_name TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VENDORS & CONTRACTORS
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  supplied_items JSONB NOT NULL DEFAULT '[]'::JSONB,
  status TEXT NOT NULL DEFAULT 'Active',
  rating NUMERIC NOT NULL DEFAULT 0,
  active_contracts_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BILLING & INVOICES
CREATE TABLE IF NOT EXISTS bills (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL UNIQUE,
  apartment_id TEXT NOT NULL,
  building_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  property_type TEXT NOT NULL,
  billing_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Unpaid',
  payment_method TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MAINTENANCE TICKETS
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  apartment_id TEXT NOT NULL,
  building_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  tenant_email TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TEXT NOT NULL,
  sla_deadline TEXT,
  assigned_staff TEXT,
  resolution_notes TEXT
);

-- 11. SYSTEM NOTIFICATIONS
CREATE TABLE IF NOT EXISTS system_notifications (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TENDERS
CREATE TABLE IF NOT EXISTS tenders (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open',
  due_date TEXT NOT NULL,
  bids JSONB NOT NULL DEFAULT '[]'::JSONB,
  awarded_bid_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PROJECT MILESTONES
CREATE TABLE IF NOT EXISTS project_milestones (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  phase TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. GANTT TASKS
CREATE TABLE IF NOT EXISTS gantt_tasks (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES saas_tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  progress NUMERIC NOT NULL DEFAULT 0,
  dependencies JSONB,
  phase TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================================
-- INDEXES FOR MULTI-TENANT QUERY ACCELERATION
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apartments_tenant ON apartments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_tenant ON materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bills_tenant ON bills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON maintenance_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON system_notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenders_tenant ON tenders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_tenant ON project_milestones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gantt_tasks_tenant ON gantt_tasks(tenant_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE saas_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_tasks ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read & write during application bootstrapping
-- (You can restrict these policies to authenticated roles in production)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public access saas_tenants" ON saas_tenants;
  CREATE POLICY "Public access saas_tenants" ON saas_tenants FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access projects" ON projects;
  CREATE POLICY "Public access projects" ON projects FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access apartments" ON apartments;
  CREATE POLICY "Public access apartments" ON apartments FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access employees" ON employees;
  CREATE POLICY "Public access employees" ON employees FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access assets" ON assets;
  CREATE POLICY "Public access assets" ON assets FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access expenses" ON expenses;
  CREATE POLICY "Public access expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access materials" ON materials;
  CREATE POLICY "Public access materials" ON materials FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access vendors" ON vendors;
  CREATE POLICY "Public access vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access bills" ON bills;
  CREATE POLICY "Public access bills" ON bills FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access maintenance_tickets" ON maintenance_tickets;
  CREATE POLICY "Public access maintenance_tickets" ON maintenance_tickets FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access system_notifications" ON system_notifications;
  CREATE POLICY "Public access system_notifications" ON system_notifications FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access tenders" ON tenders;
  CREATE POLICY "Public access tenders" ON tenders FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access project_milestones" ON project_milestones;
  CREATE POLICY "Public access project_milestones" ON project_milestones FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access gantt_tasks" ON gantt_tasks;
  CREATE POLICY "Public access gantt_tasks" ON gantt_tasks FOR ALL USING (true) WITH CHECK (true);
END $$;

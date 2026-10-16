-- ========================================================
-- ReLife — The Living Digital Passport for Every Product
-- Production PostgreSQL Schema & Storage for Supabase
-- ========================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Authenticated App Users)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'consumer' check (role in ('consumer', 'technician', 'admin')),
  organization_name text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS (Digital Passport Registry)
create table if not exists public.products (
  id text primary key,
  public_id text unique not null, -- Unguessable slug for QR passports e.g. "rl-macbook-pro-16-c02g"
  name text not null,
  brand text not null,
  model text not null,
  serial_number text,
  category text not null check (category in ('smartphone', 'laptop', 'tablet', 'audio', 'appliance', 'bicycle', 'camera', 'gaming', 'other')),
  purchase_price numeric(10, 2) default 0.00,
  purchase_currency text default 'USD',
  purchase_date date,
  seller text,
  warranty_months integer default 12,
  warranty_expiry_date date,
  condition text default 'good' check (condition in ('mint', 'excellent', 'good', 'fair', 'refurbished')),
  image_url text,
  description text,
  health_score integer default 100 check (health_score between 0 and 100),
  health_breakdown jsonb default '{}'::jsonb,
  e_waste_avoided_kg numeric(8, 2) default 0.00,
  carbon_avoided_kg numeric(8, 2) default 0.00,
  original_lifespan_years numeric(4, 1) default 5.0,
  estimated_useful_life_remaining_years numeric(4, 1) default 5.0,
  resale_disclosure jsonb default '{"showSerialNumber": true, "showPurchasePrice": false, "showFullTimeline": true, "showDocumentProofs": true, "showHealthScoreBreakdown": true, "showTechnicianNotes": true}'::jsonb,
  ownership_history jsonb default '[]'::jsonb,
  status text default 'active' check (status in ('active', 'in_repair', 'transferred', 'archived')),
  is_publicly_shared boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_products_public_id on public.products(public_id);
create index if not exists idx_products_category on public.products(category);

-- 3. DOCUMENTS (Vault for receipts, warranties, certificates)
create table if not exists public.documents (
  id text primary key,
  product_id text references public.products(id) on delete cascade not null,
  title text not null,
  file_name text not null,
  file_size text,
  file_type text not null check (file_type in ('invoice', 'warranty_cert', 'manual', 'repair_receipt', 'photo')),
  url text not null,
  is_verified_receipt boolean default false,
  extracted_data jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_documents_product_id on public.documents(product_id);

-- 4. REPAIRS (Immutable Product Lifetime Timeline)
create table if not exists public.repairs (
  id text primary key,
  product_id text references public.products(id) on delete cascade not null,
  date date not null,
  issue_summary text not null,
  symptoms text,
  diagnosis text,
  technician_or_shop_name text not null,
  service_provider_id text,
  cost numeric(10, 2) default 0.00,
  parts_replaced jsonb default '[]'::jsonb,
  warranty_claim boolean default false,
  verification_badge text default 'owner-reported' check (verification_badge in ('technician-verified', 'document-backed', 'owner-reported')),
  verification_details jsonb default '{}'::jsonb,
  useful_life_extension_months integer default 12,
  receipt_document_id text,
  owner_approved boolean default true,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_repairs_product_id on public.repairs(product_id);

-- 5. SERVICE PROVIDERS (Technician submissions awaiting owner approval)
create table if not exists public.service_submissions (
  id text primary key,
  product_id text references public.products(id) on delete cascade not null,
  public_id text not null,
  product_name text not null,
  shop_name text not null,
  technician_name text not null,
  technician_contact text,
  issue_summary text not null,
  diagnosis text,
  parts_replaced jsonb default '[]'::jsonb,
  labor_cost numeric(10, 2) default 0.00,
  parts_cost numeric(10, 2) default 0.00,
  total_cost numeric(10, 2) default 0.00,
  repair_date date not null,
  warranty_claim boolean default false,
  notes text,
  status text default 'pending_owner_approval' check (status in ('pending_owner_approval', 'approved', 'rejected')),
  submitted_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. OWNERSHIP TRANSFERS (Chain of Custody Handshake)
create table if not exists public.ownership_transfers (
  id text primary key,
  token text unique not null,
  product_id text references public.products(id) on delete cascade not null,
  product_name text not null,
  product_image text,
  brand text not null,
  model text not null,
  from_owner_name text not null,
  from_owner_email text not null,
  to_recipient_email text not null,
  transfer_type text default 'private_sale' check (transfer_type in ('original_purchase', 'private_sale', 'gift', 'warranty_replacement', 'other')),
  agreed_price numeric(10, 2),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. MAINTENANCE REMINDERS
create table if not exists public.maintenance_reminders (
  id text primary key,
  product_id text references public.products(id) on delete cascade not null,
  product_name text not null,
  product_image text,
  title text not null,
  description text,
  due_date date not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  type text default 'maintenance' check (type in ('warranty_expiry', 'maintenance', 'inspection', 'firmware')),
  completed boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 8. STORAGE BUCKET FOR DOCUMENTS & INVOICES
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.documents enable row level security;
alter table public.repairs enable row level security;
alter table public.service_submissions enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.maintenance_reminders enable row level security;

-- Public read policies (allows public QR scans and shared passports)
create policy "Allow public read on shared products" on public.products for select using (true);
create policy "Allow insert on products" on public.products for insert with check (true);
create policy "Allow update on products" on public.products for update using (true);

create policy "Allow read on repairs" on public.repairs for select using (true);
create policy "Allow insert on repairs" on public.repairs for insert with check (true);

create policy "Allow read on documents" on public.documents for select using (true);
create policy "Allow insert on documents" on public.documents for insert with check (true);
create policy "Allow delete on documents" on public.documents for delete using (true);

create policy "Allow read/write on service_submissions" on public.service_submissions for all using (true);
create policy "Allow read/write on ownership_transfers" on public.ownership_transfers for all using (true);
create policy "Allow read/write on maintenance_reminders" on public.maintenance_reminders for all using (true);

-- Storage bucket access
create policy "Allow public read on storage objects" on storage.objects for select using (bucket_id = 'documents');
create policy "Allow public upload on storage objects" on storage.objects for insert with check (bucket_id = 'documents');

-- ========================================================
-- REALISTIC SEED DATA FOR DEMO & TESTING
-- ========================================================

insert into public.products (
  id, public_id, name, brand, model, serial_number, category, purchase_price, purchase_currency, purchase_date,
  seller, warranty_months, warranty_expiry_date, condition, image_url, description, health_score, e_waste_avoided_kg,
  carbon_avoided_kg, original_lifespan_years, estimated_useful_life_remaining_years
) values
(
  'prod-macbook-pro-16',
  'rl-macbook-pro-16-c02g',
  'MacBook Pro 16" (M1 Max, 32GB)',
  'Apple',
  'MacBook Pro 16-inch 2021',
  'C02G4103MD6R',
  'laptop',
  3499.00,
  'USD',
  '2022-04-10',
  'Apple Store Regent St.',
  12,
  '2023-04-10',
  'excellent',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
  'Workstation laptop utilized for engineering and creative production. Preserved with proactive battery swap.',
  88,
  2.10,
  240.00,
  5.0,
  4.2
),
(
  'prod-specialized-sirrus',
  'rl-sirrus-x4-9821',
  'Specialized Sirrus X 4.0 Gravel / Commuter Bike',
  'Specialized',
  'Sirrus X 4.0 EQ',
  'WSBC021948291T',
  'bicycle',
  1750.00,
  'USD',
  '2023-05-18',
  'Velorution Cycle Outfitters',
  24,
  '2025-05-18',
  'mint',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
  'Specialized commuter with Future Shock 1.5 suspension stem and Shimano Deore 1x11 gearing.',
  94,
  12.50,
  180.00,
  10.0,
  8.5
),
(
  'prod-dyson-v15',
  'rl-dyson-v15-8823',
  'Dyson V15 Detect Absolute Cordless Vacuum',
  'Dyson',
  'V15 Detect (368340-01)',
  'DY-V15-882319-K',
  'appliance',
  749.00,
  'USD',
  '2023-01-20',
  'Target Stores',
  24,
  '2025-01-20',
  'good',
  'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=80',
  'High suction cordless vacuum with laser illumination cleaner head and piezo sensor particle counter.',
  84,
  18.00,
  350.00,
  8.0,
  6.4
)
on conflict (id) do nothing;

-- Seed verified repairs
insert into public.repairs (
  id, product_id, date, issue_summary, symptoms, diagnosis, technician_or_shop_name, cost,
  parts_replaced, warranty_claim, verification_badge, useful_life_extension_months
) values
(
  'rep-mac-1',
  'prod-macbook-pro-16',
  '2024-06-14',
  'Battery degradation below 80% & thermal throttling under load',
  'Battery cycle count at 842 cycles; fans spinning up loudly.',
  'Electrochemical cell degradation and dust accumulation.',
  'MacRepairs Pro Lab & Certified Tech',
  219.00,
  '[{"name": "OEM 99.6Wh Lithium Polymer Battery Pack", "cost": 169}, {"name": "Thermal Grizzly Paste", "cost": 15}]'::jsonb,
  false,
  'technician-verified',
  36
),
(
  'rep-bike-1',
  'prod-specialized-sirrus',
  '2024-04-02',
  '11-Speed Cassette & Chain Wear Overhaul',
  'Chain skipping on 3rd smallest sprocket under torque.',
  'Chain elongation reached 0.75% wear threshold.',
  'Apex Velo Workshop',
  165.00,
  '[{"name": "Shimano Deore 11-42T Cassette", "cost": 65}, {"name": "KMC X11 Silver Chain", "cost": 38}]'::jsonb,
  false,
  'technician-verified',
  24
)
on conflict (id) do nothing;

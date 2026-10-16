-- ========================================================
-- ReLife — Migration: 20261016_initial_relife_schema.sql
-- ========================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES
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

-- 2. PRODUCTS
create table if not exists public.products (
  id text primary key,
  public_id text unique not null,
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

create index if not exists idx_products_public_id on public.products(public_id);
create index if not exists idx_products_category on public.products(category);

-- 3. DOCUMENTS
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

-- 4. REPAIRS
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

-- 5. SERVICE SUBMISSIONS
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

-- 6. OWNERSHIP TRANSFERS
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

-- 8. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.documents enable row level security;
alter table public.repairs enable row level security;
alter table public.service_submissions enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.maintenance_reminders enable row level security;

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

create policy "Allow public read on storage objects" on storage.objects for select using (bucket_id = 'documents');
create policy "Allow public upload on storage objects" on storage.objects for insert with check (bucket_id = 'documents');

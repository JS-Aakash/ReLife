-- ========================================================
-- ReLife — The Living Digital Passport for Every Product
-- Production PostgreSQL Schema with Row-Level Security (RLS)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Authenticated App Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
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
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  public_id text unique not null, -- Unguessable slug for QR passports e.g. "rl-mac-893a"
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
  status text default 'active' check (status in ('active', 'in_repair', 'transferred', 'archived')),
  is_publicly_shared boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_public_id on public.products(public_id);
create index if not exists idx_products_category on public.products(category);

-- 3. DOCUMENTS (Vault for receipts, warranties, certificates)
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  file_name text not null,
  file_size text,
  file_type text not null check (file_type in ('invoice', 'warranty_cert', 'manual', 'repair_receipt', 'photo')),
  storage_path text not null,
  is_verified_receipt boolean default false,
  extracted_data jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_documents_product_id on public.documents(product_id);

-- 4. SERVICE PROVIDERS (Verified repair shops & technicians)
create table if not exists public.service_providers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  shop_name text not null,
  technician_name text not null,
  license_number text,
  contact_email text not null,
  contact_phone text,
  shop_address text,
  verified boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. REPAIRS (Immutable Product Lifetime Timeline)
create table if not exists public.repairs (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  service_provider_id uuid references public.service_providers(id) on delete set null,
  date date not null,
  issue_summary text not null,
  symptoms text,
  diagnosis text,
  technician_or_shop_name text not null,
  cost numeric(10, 2) default 0.00,
  warranty_claim boolean default false,
  verification_badge text default 'owner-reported' check (verification_badge in ('technician-verified', 'document-backed', 'owner-reported')),
  verification_details jsonb default '{}'::jsonb,
  useful_life_extension_months integer default 12,
  receipt_document_id uuid references public.documents(id) on delete set null,
  owner_approved boolean default true,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_repairs_product_id on public.repairs(product_id);

-- 6. REPAIR PARTS
create table if not exists public.repair_parts (
  id uuid default uuid_generate_v4() primary key,
  repair_id uuid references public.repairs(id) on delete cascade not null,
  part_name text not null,
  part_number text,
  cost numeric(10, 2) default 0.00
);

-- 7. OWNERSHIP TRANSFERS (Chain of Custody & Smart Resale)
create table if not exists public.ownership_transfers (
  id uuid default uuid_generate_v4() primary key,
  token text unique not null,
  product_id uuid references public.products(id) on delete cascade not null,
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  to_user_email text not null,
  to_user_id uuid references public.profiles(id) on delete set null,
  transfer_type text default 'private_sale' check (transfer_type in ('original_purchase', 'private_sale', 'gift', 'warranty_replacement', 'other')),
  agreed_price numeric(10, 2),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  completed_at timestamptz
);

-- 8. MAINTENANCE REMINDERS
create table if not exists public.maintenance_reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  type text default 'maintenance' check (type in ('warranty_expiry', 'maintenance', 'inspection', 'firmware')),
  completed boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 9. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false,
  type text default 'info' check (type in ('warranty', 'repair_approval', 'transfer', 'milestone', 'info')),
  action_url text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.documents enable row level security;
alter table public.repairs enable row level security;
alter table public.repair_parts enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.maintenance_reminders enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Products:
-- 1. Owners have full CRUD
create policy "Owners have full access to products" on public.products
  for all using (auth.uid() = user_id);

-- 2. Public Safe Sharing: Anyone can view a product if is_publicly_shared is true
create policy "Public passport view" on public.products
  for select using (is_publicly_shared = true);

-- Documents: Only owners can view and manage their documents
create policy "Owners manage own documents" on public.documents
  for all using (auth.uid() = user_id);

-- Repairs:
-- 1. Product owners can view and manage repairs
create policy "Owners manage repairs" on public.repairs
  for all using (
    exists (
      select 1 from public.products
      where products.id = repairs.product_id and products.user_id = auth.uid()
    )
  );

-- 2. Public can view approved repairs of public products
create policy "Public view repairs of shared products" on public.repairs
  for select using (
    owner_approved = true and
    exists (
      select 1 from public.products
      where products.id = repairs.product_id and products.is_publicly_shared = true
    )
  );

-- Reminders & Notifications: strictly user private
create policy "User owns reminders" on public.maintenance_reminders
  for all using (auth.uid() = user_id);

create policy "User owns notifications" on public.notifications
  for all using (auth.uid() = user_id);

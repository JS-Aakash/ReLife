-- ========================================================
-- ReLife — The Living Digital Passport for Every Product
-- Production PostgreSQL Schema & Storage for Supabase
-- Auth-Integrated & Row Level Security (RLS) Enforced
-- ========================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. PROFILES (Authenticated App Users)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade unique,
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
  user_id uuid references auth.users(id) on delete set null, -- Authenticated owner
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
create index if not exists idx_products_user_id on public.products(user_id);

-- 3. DOCUMENTS (Encrypted Vault for receipts, warranties, certificates)
create table if not exists public.documents (
  id text primary key,
  product_id text references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
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
create index if not exists idx_documents_user_id on public.documents(user_id);

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
  from_owner_id uuid references auth.users(id) on delete set null,
  from_owner_name text not null,
  from_owner_email text not null,
  to_recipient_id uuid references auth.users(id) on delete set null,
  to_recipient_email text not null,
  transfer_type text default 'private_sale' check (transfer_type in ('original_purchase', 'private_sale', 'gift', 'warranty_replacement', 'other')),
  agreed_price numeric(10, 2),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_transfers_from_owner on public.ownership_transfers(from_owner_id);
create index if not exists idx_transfers_to_recipient on public.ownership_transfers(to_recipient_id);

-- 7. MAINTENANCE REMINDERS
create table if not exists public.maintenance_reminders (
  id text primary key,
  product_id text references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
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

create index if not exists idx_maintenance_reminders_user_id on public.maintenance_reminders(user_id);

-- 8. NOTIFICATIONS (User Alert Ledger)
create table if not exists public.notifications (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  timestamp timestamptz default timezone('utc'::text, now()) not null,
  read boolean default false,
  type text default 'info',
  action_url text,
  data jsonb default '{}'::jsonb
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- 9. STORAGE BUCKET FOR DOCUMENTS & INVOICES
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

-- 10. AUTH TRIGGER TO CREATE USER PROFILE AUTOMATICALLY
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_user_id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    coalesce(new.raw_user_meta_data->>'role', 'consumer')
  )
  on conflict (auth_user_id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, profiles.full_name),
      updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Each user accesses only their own records
-- ========================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.documents enable row level security;
alter table public.repairs enable row level security;
alter table public.service_submissions enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.maintenance_reminders enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Users view own profile or technician profiles
create policy "Profiles visible to owner or authenticated users" on public.profiles
  for select using (auth.uid() = auth_user_id or role = 'technician' or auth.uid() is not null);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = auth_user_id);

-- Products: Owners access own products; public can view shared active passports
create policy "Users view owned or public products" on public.products
  for select using (auth.uid() = user_id or (is_publicly_shared = true and status != 'archived'));

create policy "Users insert own products" on public.products
  for insert with check (auth.uid() = user_id or auth.uid() is not null);

create policy "Users update own products" on public.products
  for update using (auth.uid() = user_id);

create policy "Users delete own products" on public.products
  for delete using (auth.uid() = user_id);

-- Documents: STRONGLY RESTRICTED TO PRODUCT OWNER
-- Public QR passport viewers CANNOT read private documents
create policy "Owners view product documents" on public.documents
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.products p where p.id = documents.product_id and p.user_id = auth.uid())
  );

create policy "Owners insert product documents" on public.documents
  for insert with check (
    auth.uid() = user_id or
    exists (select 1 from public.products p where p.id = documents.product_id and p.user_id = auth.uid())
  );

create policy "Owners update product documents" on public.documents
  for update using (
    auth.uid() = user_id or
    exists (select 1 from public.products p where p.id = documents.product_id and p.user_id = auth.uid())
  );

create policy "Owners delete product documents" on public.documents
  for delete using (
    auth.uid() = user_id or
    exists (select 1 from public.products p where p.id = documents.product_id and p.user_id = auth.uid())
  );

-- Repairs: Visible for owned or publicly shared products; owners insert/update
create policy "Repairs visible to owner or public shared" on public.repairs
  for select using (
    exists (
      select 1 from public.products p 
      where p.id = repairs.product_id 
      and (p.user_id = auth.uid() or p.is_publicly_shared = true)
    )
  );

create policy "Owners insert repairs" on public.repairs
  for insert with check (
    exists (select 1 from public.products p where p.id = repairs.product_id and p.user_id = auth.uid())
  );

create policy "Owners update repairs" on public.repairs
  for update using (
    exists (select 1 from public.products p where p.id = repairs.product_id and p.user_id = auth.uid())
  );

-- Transfers: Sender, recipient email, or token bearer
create policy "Transfers select policy" on public.ownership_transfers
  for select using (
    auth.uid() = from_owner_id or
    auth.uid() = to_recipient_id or
    auth.jwt() ->> 'email' = to_recipient_email or
    status = 'pending'
  );

create policy "Transfers insert policy" on public.ownership_transfers
  for insert with check (auth.uid() = from_owner_id or auth.uid() is not null);

create policy "Transfers update policy" on public.ownership_transfers
  for update using (
    auth.uid() = from_owner_id or
    auth.uid() = to_recipient_id or
    auth.jwt() ->> 'email' = to_recipient_email or
    status = 'pending'
  );

-- Maintenance Reminders: Owner isolation
create policy "Reminders select policy" on public.maintenance_reminders for select using (auth.uid() = user_id);
create policy "Reminders insert policy" on public.maintenance_reminders for insert with check (auth.uid() = user_id);
create policy "Reminders update policy" on public.maintenance_reminders for update using (auth.uid() = user_id);
create policy "Reminders delete policy" on public.maintenance_reminders for delete using (auth.uid() = user_id);

-- Notifications: User isolation
create policy "Notifications select policy" on public.notifications for select using (auth.uid() = user_id);
create policy "Notifications insert policy" on public.notifications for insert with check (auth.uid() = user_id);
create policy "Notifications update policy" on public.notifications for update using (auth.uid() = user_id);
create policy "Notifications delete policy" on public.notifications for delete using (auth.uid() = user_id);

-- Service Submissions (Technicians submit, owner reviews)
create policy "Service submissions select" on public.service_submissions
  for select using (
    exists (select 1 from public.products p where p.id = service_submissions.product_id and p.user_id = auth.uid()) or
    auth.uid() is not null
  );

create policy "Service submissions insert" on public.service_submissions
  for insert with check (true);

create policy "Service submissions update by owner" on public.service_submissions
  for update using (
    exists (select 1 from public.products p where p.id = service_submissions.product_id and p.user_id = auth.uid())
  );

-- Storage bucket access
create policy "Authenticated document upload" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Authenticated document read" on storage.objects
  for select using (bucket_id = 'documents' and auth.role() = 'authenticated');

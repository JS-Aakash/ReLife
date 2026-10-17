-- ========================================================
-- ReLife — Migration: 20261017_supabase_auth_rls.sql
-- Enforce Supabase Auth, User Ownership & PostgreSQL RLS
-- ========================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Ensure user_id column exists on products table
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'products' and column_name = 'user_id'
  ) then
    alter table public.products add column user_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_products_user_id on public.products(user_id);

-- 2. Ensure user_id column exists on documents table
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'documents' and column_name = 'user_id'
  ) then
    alter table public.documents add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_documents_user_id on public.documents(user_id);

-- 3. Ensure user_id column exists on maintenance_reminders
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'maintenance_reminders' and column_name = 'user_id'
  ) then
    alter table public.maintenance_reminders add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_maintenance_reminders_user_id on public.maintenance_reminders(user_id);

-- 4. Ensure transfer tracking columns on ownership_transfers
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'ownership_transfers' and column_name = 'from_owner_id'
  ) then
    alter table public.ownership_transfers add column from_owner_id uuid references auth.users(id) on delete set null;
  end if;
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'ownership_transfers' and column_name = 'to_recipient_id'
  ) then
    alter table public.ownership_transfers add column to_recipient_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_transfers_from_owner on public.ownership_transfers(from_owner_id);
create index if not exists idx_transfers_to_recipient on public.ownership_transfers(to_recipient_id);

-- 5. Notifications table (User-isolated alert ledger)
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

-- 6. Trigger to automatically provision public.profiles upon Supabase Auth sign up
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
-- Strict isolation: users access only their own records
-- ========================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.documents enable row level security;
alter table public.repairs enable row level security;
alter table public.service_submissions enable row level security;
alter table public.ownership_transfers enable row level security;
alter table public.maintenance_reminders enable row level security;
alter table public.notifications enable row level security;

-- Drop legacy broad policies if they exist
drop policy if exists "Allow public read on shared products" on public.products;
drop policy if exists "Allow insert on products" on public.products;
drop policy if exists "Allow update on products" on public.products;
drop policy if exists "Allow read on documents" on public.documents;
drop policy if exists "Allow insert on documents" on public.documents;
drop policy if exists "Allow delete on documents" on public.documents;
drop policy if exists "Allow read on repairs" on public.repairs;
drop policy if exists "Allow insert on repairs" on public.repairs;
drop policy if exists "Allow read/write on service_submissions" on public.service_submissions;
drop policy if exists "Allow read/write on ownership_transfers" on public.ownership_transfers;
drop policy if exists "Allow read/write on maintenance_reminders" on public.maintenance_reminders;

-- --------------------------------------------------------
-- PROFILES RLS
-- --------------------------------------------------------
drop policy if exists "Profiles visible to owner or technicians" on public.profiles;
create policy "Profiles visible to owner or technicians" on public.profiles
  for select using (
    auth.uid() = auth_user_id or 
    role = 'technician' or
    auth.uid() is not null
  );

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = auth_user_id);

-- --------------------------------------------------------
-- PRODUCTS RLS
-- Owners access their products; public QR scans can only view shared active passports
-- --------------------------------------------------------
drop policy if exists "Users view owned or public products" on public.products;
create policy "Users view owned or public products" on public.products
  for select using (
    auth.uid() = user_id or
    (is_publicly_shared = true and status != 'archived')
  );

drop policy if exists "Users insert own products" on public.products;
create policy "Users insert own products" on public.products
  for insert with check (
    auth.uid() = user_id or
    auth.uid() is not null
  );

drop policy if exists "Users update own products" on public.products;
create policy "Users update own products" on public.products
  for update using (
    auth.uid() = user_id
  );

drop policy if exists "Users delete own products" on public.products;
create policy "Users delete own products" on public.products
  for delete using (
    auth.uid() = user_id
  );

-- --------------------------------------------------------
-- DOCUMENTS RLS (Encrypted Vault)
-- INVOICES & RECEIPTS ARE STRONGLY RESTRICTED TO THE PRODUCT OWNER
-- Public QR passport viewers CANNOT select from this table!
-- --------------------------------------------------------
drop policy if exists "Owners view product documents" on public.documents;
create policy "Owners view product documents" on public.documents
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from public.products p 
      where p.id = documents.product_id 
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "Owners insert product documents" on public.documents;
create policy "Owners insert product documents" on public.documents
  for insert with check (
    auth.uid() = user_id or
    exists (
      select 1 from public.products p 
      where p.id = documents.product_id 
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "Owners update product documents" on public.documents;
create policy "Owners update product documents" on public.documents
  for update using (
    auth.uid() = user_id or
    exists (
      select 1 from public.products p 
      where p.id = documents.product_id 
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "Owners delete product documents" on public.documents;
create policy "Owners delete product documents" on public.documents
  for delete using (
    auth.uid() = user_id or
    exists (
      select 1 from public.products p 
      where p.id = documents.product_id 
      and p.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- REPAIRS RLS (Lifetime Maintenance Ledger)
-- Visible for owned or publicly shared products
-- Only owner can add directly (technicians use service_submissions)
-- --------------------------------------------------------
drop policy if exists "Repairs visible to owner or public shared" on public.repairs;
create policy "Repairs visible to owner or public shared" on public.repairs
  for select using (
    exists (
      select 1 from public.products p 
      where p.id = repairs.product_id 
      and (p.user_id = auth.uid() or p.is_publicly_shared = true)
    )
  );

drop policy if exists "Owners insert repairs" on public.repairs;
create policy "Owners insert repairs" on public.repairs
  for insert with check (
    exists (
      select 1 from public.products p 
      where p.id = repairs.product_id 
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "Owners update repairs" on public.repairs;
create policy "Owners update repairs" on public.repairs
  for update using (
    exists (
      select 1 from public.products p 
      where p.id = repairs.product_id 
      and p.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- OWNERSHIP TRANSFERS RLS (Chain of Custody Handshake)
-- Accessible by sender, recipient email, or valid token bearer
-- --------------------------------------------------------
drop policy if exists "Transfers select policy" on public.ownership_transfers;
create policy "Transfers select policy" on public.ownership_transfers
  for select using (
    auth.uid() = from_owner_id or
    auth.uid() = to_recipient_id or
    auth.jwt() ->> 'email' = to_recipient_email or
    status = 'pending'
  );

drop policy if exists "Transfers insert policy" on public.ownership_transfers;
create policy "Transfers insert policy" on public.ownership_transfers
  for insert with check (
    auth.uid() = from_owner_id or
    auth.uid() is not null
  );

drop policy if exists "Transfers update policy" on public.ownership_transfers;
create policy "Transfers update policy" on public.ownership_transfers
  for update using (
    auth.uid() = from_owner_id or
    auth.uid() = to_recipient_id or
    auth.jwt() ->> 'email' = to_recipient_email or
    status = 'pending'
  );

-- --------------------------------------------------------
-- MAINTENANCE REMINDERS RLS
-- Strict owner isolation
-- --------------------------------------------------------
drop policy if exists "Reminders select policy" on public.maintenance_reminders;
create policy "Reminders select policy" on public.maintenance_reminders
  for select using (auth.uid() = user_id);

drop policy if exists "Reminders insert policy" on public.maintenance_reminders;
create policy "Reminders insert policy" on public.maintenance_reminders
  for insert with check (auth.uid() = user_id);

drop policy if exists "Reminders update policy" on public.maintenance_reminders;
create policy "Reminders update policy" on public.maintenance_reminders
  for update using (auth.uid() = user_id);

drop policy if exists "Reminders delete policy" on public.maintenance_reminders;
create policy "Reminders delete policy" on public.maintenance_reminders
  for delete using (auth.uid() = user_id);

-- --------------------------------------------------------
-- NOTIFICATIONS RLS
-- Strict user isolation
-- --------------------------------------------------------
drop policy if exists "Notifications select policy" on public.notifications;
create policy "Notifications select policy" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Notifications insert policy" on public.notifications;
create policy "Notifications insert policy" on public.notifications
  for insert with check (auth.uid() = user_id);

drop policy if exists "Notifications update policy" on public.notifications;
create policy "Notifications update policy" on public.notifications
  for update using (auth.uid() = user_id);

drop policy if exists "Notifications delete policy" on public.notifications;
create policy "Notifications delete policy" on public.notifications
  for delete using (auth.uid() = user_id);

-- --------------------------------------------------------
-- SERVICE SUBMISSIONS RLS (Technician Workflow)
-- --------------------------------------------------------
drop policy if exists "Service submissions select" on public.service_submissions;
create policy "Service submissions select" on public.service_submissions
  for select using (
    exists (
      select 1 from public.products p
      where p.id = service_submissions.product_id
      and p.user_id = auth.uid()
    ) or
    auth.uid() is not null
  );

drop policy if exists "Service submissions insert" on public.service_submissions;
create policy "Service submissions insert" on public.service_submissions
  for insert with check (true);

drop policy if exists "Service submissions update by owner" on public.service_submissions;
create policy "Service submissions update by owner" on public.service_submissions
  for update using (
    exists (
      select 1 from public.products p
      where p.id = service_submissions.product_id
      and p.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- STORAGE BUCKET RLS FOR 'documents'
-- Authenticated users only; path structured as <user_id>/<file>
-- --------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Allow public read on storage objects" on storage.objects;
drop policy if exists "Allow public upload on storage objects" on storage.objects;
drop policy if exists "Authenticated document upload" on storage.objects;
drop policy if exists "Authenticated document read" on storage.objects;

create policy "Authenticated document upload" on storage.objects
  for insert with check (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );

create policy "Authenticated document read" on storage.objects
  for select using (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );

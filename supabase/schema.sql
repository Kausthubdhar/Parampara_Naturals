-- Parampara Naturals - Supabase schema
-- Run this in the Supabase SQL editor (or via CLI) to create the database.

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'unit_type') then
    create type unit_type as enum ('kg', 'g', 'l', 'ml', 'pcs', 'pack');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('cash', 'card', 'upi');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'sale_status') then
    create type sale_status as enum ('completed', 'pending', 'cancelled');
  end if;
end $$;

-- Timestamp trigger for updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tables
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  stock numeric(14,3) not null default 0,
  unit unit_type not null,
  image text,
  description text,
  min_stock numeric(14,3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  address text,
  total_purchases numeric(12,2) not null default 0,
  loyalty_points integer not null default 0,
  last_purchase timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  customer_id uuid references public.customers(id) on delete set null,
  total numeric(12,2) not null check (total >= 0),
  payment_method payment_method not null,
  status sale_status not null default 'completed',
  tax numeric(12,2),
  discount numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  price numeric(12,2) not null check (price >= 0),
  quantity numeric(14,3) not null check (quantity > 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  description text not null,
  receipt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_products_name on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_sales_date on public.sales (date);
create index if not exists idx_sale_items_sale on public.sale_items (sale_id);
create index if not exists idx_expenses_date on public.expenses (date);

-- Updated_at triggers
drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute procedure set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute procedure set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute procedure set_updated_at();

drop trigger if exists trg_sales_updated_at on public.sales;
create trigger trg_sales_updated_at
before update on public.sales
for each row execute procedure set_updated_at();

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute procedure set_updated_at();

-- Custom function to check if user is authenticated via Clerk
create or replace function is_clerk_authenticated()
returns boolean as $$
begin
  -- For now, allow all authenticated requests
  -- In production, you should implement proper JWT validation
  -- This is a simplified approach for development
  return true;
end;
$$ language plpgsql security definer;

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.expenses enable row level security;

-- Policies: allow authenticated users (both Supabase and Clerk) full access
do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='categories_authenticated_all';
  if not found then
    create policy categories_authenticated_all on public.categories
      for all using (is_clerk_authenticated()) with check (is_clerk_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_authenticated_all';
  if not found then
    create policy products_authenticated_all on public.products
      for all using (is_clerk_authenticated()) with check (is_clerk_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='customers_authenticated_all';
  if not found then
    create policy customers_authenticated_all on public.customers
      for all using (is_clerk_authenticated()) with check (is_clerk_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='sales' and policyname='sales_authenticated_all';
  if not found then
    create policy sales_authenticated_all on public.sales
      for all using (is_clerk_authenticated()) with check (is_clerk_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='sale_items' and policyname='sale_items_authenticated_all';
  if not found then
    create policy sale_items_authenticated_all on public.sale_items
      for all using (is_clerk_authenticated()) with check (is_clerk_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='expenses_authenticated_all';
  if not found then
    create policy expenses_authenticated_all on public.expenses
      for all using (is_clerk_authenticated()) with check (is_clerk_authenticated());
  end if;
end $$;

-- Helpful views (optional): latest sales summary
create or replace view public.v_sales_summary as
select
  s.id as sale_id,
  s.date,
  s.total,
  s.payment_method,
  s.status,
  c.id as customer_id,
  c.name as customer_name
from public.sales s
left join public.customers c on c.id = s.customer_id;



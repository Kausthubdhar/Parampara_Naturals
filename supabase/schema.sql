-- Organica AI - Supabase schema
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
    create type sale_status as enum ('completed', 'pending', 'cancelled', 'partial');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'bag_type') then
    create type bag_type as enum ('paper_bag', 'cloth_bag', 'plastic_container', 'glass_container', 'other');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'loyalty_transaction_type') then
    create type loyalty_transaction_type as enum ('purchase', 'bag_return', 'referral', 'birthday', 'review', 'social_share', 'streak_bonus', 'high_value_bonus', 'redemption');
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

-- User profiles table for Supabase Auth integration
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid references auth.users(id) on delete cascade,
  clerk_user_id text unique, -- Keep for migration compatibility
  email text not null,
  first_name text,
  last_name text,
  full_name text,
  store_name text,
  store_type text default 'organic_store',
  phone text,
  address text,
  city text,
  state text,
  country text default 'India',
  timezone text default 'Asia/Kolkata',
  business_size text default 'small',
  established_year integer,
  specialties text[],
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  user_id uuid references public.user_profiles(id) on delete cascade,
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
  user_id uuid references public.user_profiles(id) on delete cascade,
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
  paid_amount numeric(12,2) default 0 check (paid_amount >= 0),
  remaining_amount numeric(12,2) default 0 check (remaining_amount >= 0),
  user_id uuid references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add constraint to ensure payment amounts are consistent
ALTER TABLE public.sales 
ADD CONSTRAINT check_payment_amounts 
CHECK (
  (status = 'completed' AND paid_amount = total AND remaining_amount = 0) OR
  (status = 'pending' AND paid_amount = 0 AND remaining_amount = total) OR
  (status = 'cancelled' AND paid_amount = 0 AND remaining_amount = 0) OR
  (status = 'partial' AND paid_amount > 0 AND remaining_amount > 0 AND paid_amount + remaining_amount = total)
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  price numeric(12,2) not null check (price >= 0),
  quantity numeric(14,3) not null check (quantity > 0),
  total numeric(12,2) not null check (total >= 0),
  user_id uuid references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  description text not null,
  receipt text,
  user_id uuid references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bag returns table for tracking reusable bag returns
create table if not exists public.bag_returns (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  bag_type bag_type not null,
  quantity integer not null check (quantity > 0),
  points_awarded integer not null check (points_awarded >= 0),
  notes text,
  user_id uuid references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Loyalty transactions table for tracking all loyalty point activities
create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  transaction_type loyalty_transaction_type not null,
  points integer not null, -- positive for earning, negative for redemption
  description text not null,
  reference_id uuid, -- can reference sale_id, bag_return_id, etc.
  user_id uuid references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_profiles_supabase_user_id on public.user_profiles (supabase_user_id);
create index if not exists idx_user_profiles_clerk_id on public.user_profiles (clerk_user_id);
create index if not exists idx_user_profiles_email on public.user_profiles (email);
create index if not exists idx_products_name on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_user_id on public.products (user_id);
create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_customers_user_id on public.customers (user_id);
create index if not exists idx_sales_date on public.sales (date);
create index if not exists idx_sales_user_id on public.sales (user_id);
create index if not exists idx_sale_items_sale on public.sale_items (sale_id);
create index if not exists idx_sale_items_user_id on public.sale_items (user_id);
create index if not exists idx_expenses_date on public.expenses (date);
create index if not exists idx_expenses_user_id on public.expenses (user_id);

-- Updated_at triggers
drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure set_updated_at();

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

-- Custom function to check if user is authenticated via Supabase Auth
create or replace function is_authenticated()
returns boolean as $$
begin
  -- Check if user is authenticated via Supabase Auth
  return auth.uid() is not null;
end;
$$ language plpgsql security definer;

-- RLS
alter table public.user_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.expenses enable row level security;
alter table public.bag_returns enable row level security;
alter table public.loyalty_transactions enable row level security;

-- Policies: allow authenticated users full access
do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='user_profiles' and policyname='user_profiles_authenticated_all';
  if not found then
    create policy user_profiles_authenticated_all on public.user_profiles
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='categories_authenticated_all';
  if not found then
    create policy categories_authenticated_all on public.categories
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_authenticated_all';
  if not found then
    create policy products_authenticated_all on public.products
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='customers_authenticated_all';
  if not found then
    create policy customers_authenticated_all on public.customers
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='sales' and policyname='sales_authenticated_all';
  if not found then
    create policy sales_authenticated_all on public.sales
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='sale_items' and policyname='sale_items_authenticated_all';
  if not found then
    create policy sale_items_authenticated_all on public.sale_items
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='expenses_authenticated_all';
  if not found then
    create policy expenses_authenticated_all on public.expenses
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='bag_returns' and policyname='bag_returns_authenticated_all';
  if not found then
    create policy bag_returns_authenticated_all on public.bag_returns
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='loyalty_transactions' and policyname='loyalty_transactions_authenticated_all';
  if not found then
    create policy loyalty_transactions_authenticated_all on public.loyalty_transactions
      for all using (is_authenticated()) with check (is_authenticated());
  end if;
end $$;

-- Function to calculate loyalty points for different activities
create or replace function calculate_loyalty_points(
  transaction_type loyalty_transaction_type,
  amount numeric default 0,
  bag_type bag_type default null,
  quantity integer default 1
) returns integer as $$
begin
  case transaction_type
    when 'purchase' then
      return floor(amount / 10)::integer; -- 1 point per ₹10
    when 'bag_return' then
      case bag_type
        when 'cloth_bag' then return 10 * quantity;
        when 'glass_container' then return 8 * quantity;
        when 'plastic_container' then return 5 * quantity;
        when 'paper_bag' then return 3 * quantity;
        when 'other' then return 5 * quantity;
        else return 5 * quantity;
      end case;
    when 'referral' then return 200;
    when 'birthday' then return 100;
    when 'review' then return 25;
    when 'social_share' then return 15;
    when 'streak_bonus' then return 50;
    when 'high_value_bonus' then return floor(amount * 0.02)::integer; -- 2% extra for high value
    when 'redemption' then return -abs(amount); -- negative for redemption (amount = points to redeem)
    else return 0;
  end case;
end;
$$ language plpgsql;

-- Function to update customer loyalty points
create or replace function update_customer_loyalty_points(
  p_customer_id uuid,
  p_points integer,
  p_transaction_type loyalty_transaction_type,
  p_description text,
  p_reference_id uuid default null
) returns void as $$
declare
  v_user_id uuid;
begin
  -- Get user_id from customer
  select user_id into v_user_id from public.customers where id = p_customer_id;
  
  -- Update customer loyalty points
  update public.customers 
  set loyalty_points = loyalty_points + p_points,
      updated_at = now()
  where id = p_customer_id;
  
  -- Insert loyalty transaction record
  insert into public.loyalty_transactions (
    customer_id, transaction_type, points, description, reference_id, user_id
  ) values (
    p_customer_id, p_transaction_type, p_points, p_description, p_reference_id, v_user_id
  );
end;
$$ language plpgsql;

-- Function to calculate redemption discount (500 points = ₹10)
create or replace function calculate_redemption_discount(points_to_redeem integer)
returns numeric as $$
begin
  -- 500 points = ₹10, so each point = ₹0.02
  return (points_to_redeem * 0.02);
end;
$$ language plpgsql;

-- Function to validate if customer has enough points for redemption
create or replace function validate_redemption(
  p_customer_id uuid,
  p_points_to_redeem integer
) returns boolean as $$
declare
  v_current_points integer;
begin
  select loyalty_points into v_current_points 
  from public.customers 
  where id = p_customer_id;
  
  return v_current_points >= p_points_to_redeem;
end;
$$ language plpgsql;

-- Function to process loyalty points redemption
create or replace function process_loyalty_redemption(
  p_customer_id uuid,
  p_points_to_redeem integer,
  p_sale_id uuid default null
) returns numeric as $$
declare
  v_user_id uuid;
  v_discount_amount numeric;
  v_is_valid boolean;
begin
  -- Validate redemption
  select validate_redemption(p_customer_id, p_points_to_redeem) into v_is_valid;
  
  if not v_is_valid then
    raise exception 'Insufficient loyalty points for redemption';
  end if;
  
  -- Calculate discount amount
  v_discount_amount := calculate_redemption_discount(p_points_to_redeem);
  
  -- Get user_id
  select user_id into v_user_id from public.customers where id = p_customer_id;
  
  -- Update customer points (subtract)
  update public.customers 
  set loyalty_points = loyalty_points - p_points_to_redeem,
      updated_at = now()
  where id = p_customer_id;
  
  -- Record redemption transaction
  insert into public.loyalty_transactions (
    customer_id, transaction_type, points, description, reference_id, user_id
  ) values (
    p_customer_id, 'redemption', -p_points_to_redeem, 
    'Loyalty points redemption: ' || p_points_to_redeem || ' points for ₹' || v_discount_amount || ' discount',
    p_sale_id, v_user_id
  );
  
  return v_discount_amount;
end;
$$ language plpgsql;

-- Function to update sale payment status
create or replace function update_sale_payment_status(
  p_sale_id uuid,
  p_paid_amount numeric,
  p_remaining_amount numeric,
  p_status sale_status
) returns void as $$
begin
  update public.sales 
  set 
    paid_amount = p_paid_amount,
    remaining_amount = p_remaining_amount,
    status = p_status,
    updated_at = now()
  where id = p_sale_id;
end;
$$ language plpgsql;

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



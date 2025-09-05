-- Parampara Naturals - Seed data
-- Run after schema to populate minimal demo data.

-- Categories
insert into public.categories (name, icon, color)
values
  ('Vegetables', '🥬', '#16a34a'),
  ('Fruits', '🍎', '#ef4444'),
  ('Grains', '🌾', '#f59e0b'),
  ('Dairy', '🥛', '#3b82f6')
on conflict (name) do nothing;

-- Products
insert into public.products (name, price, category_id, stock, unit, image, description, min_stock)
select 'Organic Spinach', 120.00, c.id, 50, 'kg'::unit_type, null, 'Fresh organic spinach', 5 from public.categories c where c.name='Vegetables'
union all
select 'Banana', 60.00, c.id, 100, 'kg'::unit_type, null, 'Sweet ripe bananas', 10 from public.categories c where c.name='Fruits'
union all
select 'Basmati Rice', 150.00, c.id, 200, 'kg'::unit_type, null, 'Premium basmati rice', 20 from public.categories c where c.name='Grains'
union all
select 'A2 Milk', 70.00, c.id, 80, 'l'::unit_type, null, 'Fresh A2 cow milk', 10 from public.categories c where c.name='Dairy'
on conflict do nothing;

-- Customers
insert into public.customers (name, phone, email, address)
values
  ('Ravi Kumar', '9999990001', 'ravi@example.com', 'Bengaluru'),
  ('Anita Sharma', '9999990002', 'anita@example.com', 'Pune'),
  ('Suresh Mehta', '9999990003', null, 'Mumbai')
on conflict (phone) do nothing;

-- One demo sale with two items
do $$
declare v_customer uuid;
declare v_sale uuid;
declare v_prod1 uuid;
declare v_prod2 uuid;
begin
  select id into v_customer from public.customers where phone='9999990001';
  select id into v_prod1 from public.products where name='Organic Spinach' limit 1;
  select id into v_prod2 from public.products where name='Banana' limit 1;

  insert into public.sales (customer_id, total, payment_method, status, tax, discount)
  values (v_customer, 260.00, 'upi', 'completed', 0, 0)
  returning id into v_sale;

  insert into public.sale_items (sale_id, product_id, product_name, price, quantity, total)
  select v_sale, v_prod1, 'Organic Spinach', 120.00, 1.0, 120.00
  union all
  select v_sale, v_prod2, 'Banana', 70.00, 2.0, 140.00;

  -- Update aggregates on customer
  update public.customers
    set total_purchases = coalesce(total_purchases, 0) + 260.00,
        loyalty_points = coalesce(loyalty_points, 0) + 26,
        last_purchase = now()
  where id = v_customer;
end $$;



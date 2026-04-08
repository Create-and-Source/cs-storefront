-- Products
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  cover_image text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Additional product images
create table product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tiered pricing per product
create table pricing_tiers (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  min_qty int not null,
  max_qty int,
  price_per_unit numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Quotes (client checkout)
create table quotes (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  client_email text not null,
  client_phone text,
  client_company text,
  logo_url text,
  status text default 'pending' check (status in ('pending','reviewed','priced','accepted','invoiced')),
  notes text,
  total numeric(10,2),
  created_at timestamptz default now()
);

-- Quote line items
create table quote_items (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  product_image text,
  quantity int not null,
  estimated_price numeric(10,2),
  final_price numeric(10,2),
  notes text,
  created_at timestamptz default now()
);

-- Storage buckets (run in Supabase dashboard or via API)
-- create bucket: product-images (public)
-- create bucket: client-logos (public)

-- RLS policies (permissive for now)
alter table products enable row level security;
alter table product_images enable row level security;
alter table pricing_tiers enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;

create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);
create policy "Public read pricing_tiers" on pricing_tiers for select using (true);
create policy "Allow all on products" on products for all using (true);
create policy "Allow all on product_images" on product_images for all using (true);
create policy "Allow all on pricing_tiers" on pricing_tiers for all using (true);
create policy "Allow all on quotes" on quotes for all using (true);
create policy "Allow all on quote_items" on quote_items for all using (true);

-- =====================================================================
-- 6ixstars — Schema de catálogo de ropa urbana (Supabase / PostgreSQL)
-- =====================================================================
-- Mantiene el patrón de 3 tablas del data layer (products + variantes +
-- imágenes) para que lib/products-db.js siga haciendo un solo join.
-- Para perfumes era: tallas en ml + notas olfativas. Aquí: tallas de ropa
-- (S/M/L/XL), color, material y categorías de prenda.
--
-- Ejecutar en el SQL Editor de Supabase (proyecto NUEVO de 6ixstars).
-- =====================================================================

-- Limpieza idempotente (cuidado: borra datos). Comentar en producción.
drop table if exists public.product_images cascade;
drop table if exists public.product_sizes  cascade;
drop table if exists public.products        cascade;

-- ---------------------------------------------------------------------
-- products — una fila por prenda/modelo
-- ---------------------------------------------------------------------
create table public.products (
  id             bigint generated always as identity primary key,
  slug           text unique not null,
  name           text not null,
  brand          text not null default '6ixstars',  -- marca o colab
  gender         text not null default 'unisex',    -- 'hombre' | 'mujer' | 'unisex'
  category       text,                               -- categoría principal (hoodies, camisetas, ...)
  categories     text[] not null default '{}',       -- hasta N categorías/etiquetas
  base_price     numeric(12,2) not null default 0,   -- precio en COP
  original_price numeric(12,2),                       -- precio tachado (ofertas)
  description    text default '',
  material       text default '',                     -- ej. 'Algodón 100% 380gsm'
  color          text default '',                     -- color principal legible
  fit            text default '',                     -- ej. 'Oversize', 'Regular'
  badge          text,                                -- ej. 'NUEVO', 'AGOTÁNDOSE'
  badge_color    text,                                -- hex opcional
  rating         numeric(3,2) not null default 0,
  reviews_count  integer not null default 0,
  stock          integer not null default 0,          -- stock total (suma de tallas)
  featured       boolean not null default false,
  bestseller     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index products_slug_idx       on public.products (slug);
create index products_category_idx   on public.products (category);
create index products_gender_idx     on public.products (gender);
create index products_categories_idx on public.products using gin (categories);

-- ---------------------------------------------------------------------
-- product_sizes — variantes por talla (con stock por talla)
-- ---------------------------------------------------------------------
create table public.product_sizes (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  size        text not null,                  -- 'XS','S','M','L','XL','XXL' o 'Única'
  price       numeric(12,2),                  -- override opcional; si null usa base_price
  stock       integer not null default 0,
  order_index integer not null default 0
);
create index product_sizes_product_idx on public.product_sizes (product_id);

-- ---------------------------------------------------------------------
-- product_images — galería ordenada
-- ---------------------------------------------------------------------
create table public.product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  url         text not null,
  order_index integer not null default 0
);
create index product_images_product_idx on public.product_images (product_id);

-- ---------------------------------------------------------------------
-- RLS — lectura pública del catálogo; escritura solo service_role
-- ---------------------------------------------------------------------
alter table public.products       enable row level security;
alter table public.product_sizes  enable row level security;
alter table public.product_images enable row level security;

create policy "public read products"
  on public.products for select using (true);
create policy "public read product_sizes"
  on public.product_sizes for select using (true);
create policy "public read product_images"
  on public.product_images for select using (true);
-- (las escrituras usan SUPABASE_SERVICE_ROLE_KEY, que bypassa RLS)

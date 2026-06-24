-- =====================================================
-- 6ixstars — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  phone        TEXT,
  city         TEXT,
  department   TEXT,
  country      TEXT DEFAULT 'CO',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÓRDENES
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference                TEXT UNIQUE NOT NULL,
  customer_id              UUID REFERENCES customers(id),
  customer_email           TEXT NOT NULL,
  customer_name            TEXT NOT NULL,
  customer_phone           TEXT,
  shipping_address         TEXT,
  shipping_city            TEXT,
  shipping_department      TEXT,
  shipping_country         TEXT DEFAULT 'CO',
  subtotal                 NUMERIC(12,2) NOT NULL,
  discount                 NUMERIC(12,2) DEFAULT 0,
  shipping_cost            NUMERIC(12,2) DEFAULT 0,
  total                    NUMERIC(12,2) NOT NULL,
  currency                 TEXT DEFAULT 'COP',
  payment_method           TEXT,
  status                   TEXT DEFAULT 'pending',
  wompi_tx_id              TEXT,
  notes                    TEXT,
  admin_notes              TEXT,
  tracking_carrier         TEXT,
  tracking_number          TEXT,
  recovery_email_sent_at   TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ITEMS DE ÓRDENES
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     TEXT NOT NULL,
  product_name   TEXT NOT NULL,
  product_slug   TEXT,
  selected_size  TEXT,
  selected_color TEXT,
  quantity       INTEGER NOT NULL,
  unit_price     NUMERIC(12,2) NOT NULL,
  total_price    NUMERIC(12,2) NOT NULL
);

-- =====================================================
-- PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  brand          TEXT,
  gender         TEXT DEFAULT 'unisex',
  fit            TEXT,
  material       TEXT,
  color          TEXT,
  base_price     NUMERIC(12,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(12,2),
  stock          INTEGER DEFAULT 0,
  rating         NUMERIC(3,2) DEFAULT 0,
  reviews_count  INTEGER DEFAULT 0,
  badge          TEXT,
  badge_color    TEXT,
  description    TEXT,
  category       TEXT,
  categories     TEXT[] DEFAULT '{}',
  featured       BOOLEAN DEFAULT false,
  bestseller     BOOLEAN DEFAULT false,
  active         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TALLAS DE PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS product_sizes (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        TEXT NOT NULL,
  price       NUMERIC(12,2),
  stock       INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0
);

-- =====================================================
-- IMÁGENES DE PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- =====================================================
-- INVENTARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
  product_id    TEXT PRIMARY KEY,
  product_name  TEXT NOT NULL,
  product_slug  TEXT,
  stock         INTEGER DEFAULT 0,
  reserved      INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 5,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RESEÑAS DE PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_slug TEXT NOT NULL,
  author_name  TEXT NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT DEFAULT '',
  text         TEXT NOT NULL,
  approved     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUSCRIPCIONES AL NEWSLETTER
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUSCRIPCIONES PUSH (notificaciones admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint   TEXT UNIQUE NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONVERSACIONES WHATSAPP (futuro)
-- =====================================================
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number    TEXT NOT NULL,
  customer_id     UUID REFERENCES customers(id),
  status          TEXT DEFAULT 'active',
  messages        JSONB DEFAULT '[]',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_slug          ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand         ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category      ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product  ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference       ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_email           ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order      ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug   ON reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_email       ON newsletter_subs(email);
CREATE INDEX IF NOT EXISTS idx_push_endpoint          ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_whatsapp_phone         ON whatsapp_conversations(phone_number);

-- =====================================================
-- TRIGGER: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER whatsapp_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- RLS: deshabilitado para operaciones server-side
-- =====================================================
CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE products               DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes          DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images         DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers              DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory              DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subs        DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations DISABLE ROW LEVEL SECURITY;

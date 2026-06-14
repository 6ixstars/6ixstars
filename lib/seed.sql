-- =====================================================================
-- 6ixstars — Seed de catálogo de ropa urbana (ejemplo)
-- Categorías: bermudas · conjuntos · camisas · buzos · jeans · gorras
-- =====================================================================
-- Ejecutar DESPUÉS de schema.sql, en el SQL Editor de Supabase.
-- Imágenes vacías → el front cae al placeholder. Reemplazar con fotos
-- reales (Supabase Storage) más adelante. Precios en COP.
-- =====================================================================

insert into public.products
  (slug, name, brand, gender, category, categories, base_price, original_price, description, material, color, fit, badge, badge_color, rating, reviews_count, stock, featured, bestseller)
values
  ('buzo-oversize-shadow', 'Buzo Oversize Shadow', '6ixstars', 'unisex', 'buzos', '{buzos}', 159900, 199900,
   'Buzo con capucha oversize de algodón pesado 400gsm. Bolsillo canguro y caída relajada. El básico que no falla.', 'Algodón 100% · 400gsm', 'Negro', 'Oversize', 'BESTSELLER', '#FF2E7E', 4.9, 38, 60, true, true),

  ('camisa-boxy-static', 'Camisa Boxy Static', '6ixstars', 'unisex', 'camisas', '{camisas}', 79900, null,
   'Camisa de corte boxy con hombros caídos y tela midweight. Estampado minimalista en el pecho.', 'Algodón 100% · 220gsm', 'Blanco hueso', 'Boxy', 'NUEVO', '#FF2E7E', 4.8, 21, 80, true, true),

  ('jean-baggy-wave', 'Jean Baggy Wave', '6ixstars', 'mujer', 'jeans', '{jeans}', 169900, null,
   'Baggy denim de tiro alto con caída amplia. Lavado claro y costuras contrastadas.', 'Denim 100% algodón', 'Azul claro', 'Baggy', 'NUEVO', '#FF2E7E', 4.9, 7, 35, true, false),

  ('bermuda-cargo-tactical', 'Bermuda Cargo Tactical', '6ixstars', 'hombre', 'bermudas', '{bermudas}', 109900, null,
   'Bermuda cargo con bolsillos laterales y bajo recto. Fresca y cómoda para el calor de la ciudad.', 'Poliéster-algodón · ripstop', 'Verde militar', 'Regular', null, null, 4.7, 14, 45, false, true),

  ('conjunto-track-6ix', 'Conjunto Track 6ix', '6ixstars', 'unisex', 'conjuntos', '{conjuntos}', 229900, 279900,
   'Conjunto completo: chaqueta track + pantalón a juego con ribetes contrastados. Fit armado de una.', 'Poliéster técnico', 'Negro/Rosa', 'Regular', 'OFERTA', '#FF2E7E', 4.9, 12, 28, true, false),

  ('gorra-snapback-6ix', 'Gorra Snapback 6ix', '6ixstars', 'unisex', 'gorras', '{gorras}', 59900, null,
   'Snapback estructurada de 6 paneles con bordado frontal. Visera plana y ajuste trasero.', 'Algodón-poliéster', 'Negro', 'Snapback', null, null, 4.6, 27, 100, false, true),

  ('camisa-oversize-toronto', 'Camisa Oversize Toronto', '6ixstars', 'unisex', 'camisas', '{camisas}', 84900, null,
   'Oversize tee con gráfico trasero inspirado en la cultura urbana del 6ix. Caída larga.', 'Algodón 100% · 240gsm', 'Negro', 'Oversize', null, null, 4.8, 18, 70, true, false),

  ('buzo-crewneck-fog', 'Buzo Crewneck Fog', '6ixstars', 'unisex', 'buzos', '{buzos}', 144900, null,
   'Crewneck sin capucha en tono niebla, interior perchado. Perfecto para capas.', 'Algodón-poliéster · 360gsm', 'Gris niebla', 'Regular', null, null, 4.7, 11, 50, false, false);

-- ---- Tallas por producto -------------------------------------------------
-- Prendas con tallas S/M/L/XL; gorra talla Única.
insert into public.product_sizes (product_id, size, stock, order_index)
select p.id, t.size, t.stock, t.ord
from public.products p
cross join (values
  ('S', 12, 0), ('M', 18, 1), ('L', 18, 2), ('XL', 12, 3)
) as t(size, stock, ord)
where p.category in ('bermudas','conjuntos','camisas','buzos','jeans');

insert into public.product_sizes (product_id, size, stock, order_index)
select p.id, 'Única', p.stock, 0
from public.products p
where p.category in ('gorras');

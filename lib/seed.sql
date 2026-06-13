-- =====================================================================
-- 6ixstars — Seed de catálogo de ropa urbana (ejemplo)
-- =====================================================================
-- Ejecutar DESPUÉS de schema.sql, en el SQL Editor de Supabase.
-- Imágenes: por ahora vacías → el front cae al placeholder. Reemplazar
-- con fotos reales (Supabase Storage) más adelante.
-- Precios en COP.
-- =====================================================================

insert into public.products
  (slug, name, brand, gender, category, categories, base_price, original_price, description, material, color, fit, badge, badge_color, rating, reviews_count, stock, featured, bestseller)
values
  ('hoodie-oversize-shadow', 'Hoodie Oversize Shadow', '6ixstars', 'unisex', 'hoodies', '{hoodies}', 159900, 199900,
   'Hoodie oversize de algodón pesado 400gsm. Capucha forrada, bolsillo canguro y caída relajada. El básico que no falla.', 'Algodón 100% · 400gsm', 'Negro', 'Oversize', 'BESTSELLER', '#111111', 4.9, 38, 60, true, true),

  ('camiseta-boxy-static', 'Camiseta Boxy Static', '6ixstars', 'unisex', 'camisetas', '{camisetas}', 79900, null,
   'Camiseta de corte boxy con hombros caídos y tela midweight. Estampado minimalista en el pecho.', 'Algodón 100% · 220gsm', 'Blanco hueso', 'Boxy', 'NUEVO', '#2E86C1', 4.8, 21, 80, true, true),

  ('cargo-jogger-tactical', 'Cargo Jogger Tactical', '6ixstars', 'hombre', 'pantalones', '{pantalones}', 139900, null,
   'Jogger cargo con bolsillos laterales, puños elásticos y cordón ajustable. Comodidad y actitud calle.', 'Poliéster-algodón · ripstop', 'Verde militar', 'Regular', null, null, 4.7, 14, 45, false, true),

  ('chaqueta-bomber-night', 'Chaqueta Bomber Night', '6ixstars', 'unisex', 'chaquetas', '{chaquetas}', 219900, 259900,
   'Bomber acolchada con cierre full y ribetes elásticos. Forro interno suave, lista para el frío de la ciudad.', 'Nylon · forro acolchado', 'Negro', 'Regular', 'OFERTA', '#C0392B', 4.9, 9, 30, true, false),

  ('gorra-snapback-6ix', 'Gorra Snapback 6ix', '6ixstars', 'unisex', 'gorras', '{gorras,accesorios}', 59900, null,
   'Snapback estructurada de 6 paneles con bordado frontal. Visera plana y ajuste trasero.', 'Algodón-poliéster', 'Negro', 'Snapback', null, null, 4.6, 27, 100, false, true),

  ('camiseta-oversize-toronto', 'Camiseta Oversize Toronto', '6ixstars', 'unisex', 'camisetas', '{camisetas}', 84900, null,
   'Oversize tee con gráfico trasero inspirado en la cultura urbana del 6ix. Caída larga.', 'Algodón 100% · 240gsm', 'Negro', 'Oversize', null, null, 4.8, 18, 70, true, false),

  ('buzo-crewneck-fog', 'Buzo Crewneck Fog', '6ixstars', 'unisex', 'hoodies', '{hoodies}', 144900, null,
   'Crewneck sin capucha en tono niebla, interior perchado. Perfecto para capas.', 'Algodón-poliéster · 360gsm', 'Gris niebla', 'Regular', null, null, 4.7, 11, 50, false, false),

  ('pantalon-baggy-wave', 'Pantalón Baggy Wave', '6ixstars', 'mujer', 'pantalones', '{pantalones}', 169900, null,
   'Baggy denim de tiro alto con caída amplia. Lavado claro y costuras contrastadas.', 'Denim 100% algodón', 'Azul claro', 'Baggy', 'NUEVO', '#2E86C1', 4.9, 7, 35, true, false);

-- ---- Tallas por producto -------------------------------------------------
-- Prendas con tallas S/M/L/XL; gorra talla Única.
insert into public.product_sizes (product_id, size, stock, order_index)
select p.id, t.size, t.stock, t.ord
from public.products p
cross join (values
  ('S', 12, 0), ('M', 18, 1), ('L', 18, 2), ('XL', 12, 3)
) as t(size, stock, ord)
where p.category in ('hoodies','camisetas','pantalones','chaquetas');

insert into public.product_sizes (product_id, size, stock, order_index)
select p.id, 'Única', p.stock, 0
from public.products p
where p.category in ('gorras','accesorios');

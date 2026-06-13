// Data access layer: lectura del catálogo de productos desde Supabase.
// Usa unstable_cache de Next.js para evitar pegarle a la DB en cada
// request. El cache se invalida con revalidateTag('products') cuando
// el admin edita un producto.
//
// Las funciones devuelven productos en el MISMO formato que el viejo
// lib/products.js para que los consumidores no tengan que cambiar nada
// más que sustituir el import.
//
// SERVER-ONLY: si un Client Component intenta importarme (directa o
// transitivamente), Next.js lanza un error de build. Esto previene que
// se bundlee el SDK de Supabase al browser. Para constantes síncronas
// usa lib/products-constants.js que sí es isomorfo.

import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from './supabase.js';

// Tag global del cache. Llamar revalidateTag('products') invalida toda
// la data del catálogo en memoria.
export const PRODUCTS_CACHE_TAG = 'products';

// Mapea un row de Supabase (con joins de sizes e images) al formato
// consumen los componentes. Modelo de ROPA: tallas (S/M/L/XL) en vez de ml,
// color/material/fit en vez de notas olfativas.
//
// Para no romper componentes durante la transición, cada talla expone tanto
// `size` (nuevo) como `ml` (alias legacy = misma etiqueta). Los campos de
// perfume (notes, longevity, season, ...) se devuelven vacíos para que el
// código que aún los lee no truene; se eliminarán en el pase de diseño.
function rowToProduct(row) {
  if (!row) return null;
  const base = Number(row.base_price) || 0;

  const sizes = (row.product_sizes || [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(s => {
      const label = s.size;
      const price = s.price != null ? Number(s.price) : base;
      return { size: label, ml: label, price, stock: s.stock ?? 0 };
    });

  const images = (row.product_images || [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(i => i.url);

  const categories = Array.isArray(row.categories) && row.categories.length
    ? row.categories
    : (row.category ? [row.category] : []);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    gender: row.gender || 'unisex',
    type: row.fit || '',                              // ProductCard lo muestra como subtítulo
    fit: row.fit || '',
    material: row.material || '',
    color: row.color || '',
    price: base,
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    productType: row.gender || 'unisex',              // los filtros por género reusan getProductsByType
    category: categories[0] || row.category || null,  // categoría principal
    categories,                                       // todas las categorías/etiquetas
    sizes: sizes.length ? sizes : [{ size: 'Única', ml: 'Única', price: base, stock: row.stock ?? 0 }],
    images,
    rating: Number(row.rating) || 0,
    reviews: row.reviews_count ?? 0,
    stock: row.stock ?? 0,
    badge: row.badge,
    badgeColor: row.badge_color,
    description: row.description || '',
    featured: !!row.featured,
    bestseller: !!row.bestseller,
    // --- Campos legacy de perfume (vacíos, pendientes de remover) ---
    notes: { top: '', heart: '', base: '' },
    longevity: '',
    sillage: '',
    season: '',
    occasion: [],
    momento: null,
    clima: null,
  };
}

// === Carga todo el catálogo (cacheado). Es la función "base" de la que
// las demás derivan (filter en memoria). Más simple que hacer N queries.
async function _getAllProductsFromDb() {
  if (!supabaseAdmin) {
    console.warn('[products-db] supabaseAdmin no disponible — devolviendo []');
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_sizes(*), product_images(*)')
    .order('id', { ascending: true });

  if (error) {
    console.error('[products-db] Error consultando productos:', error.message);
    return [];
  }

  return (data || []).map(rowToProduct).filter(Boolean);
}

export const getAllProducts = unstable_cache(
  _getAllProductsFromDb,
  ['all-products'],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 300 }
);

// === Helpers derivados (todos cacheados por extensión)
export async function getProductBySlug(slug) {
  if (!slug) return null;
  const all = await getAllProducts();
  return all.find(p => p.slug === slug) || null;
}

export async function getProductById(id) {
  if (id == null) return null;
  const all = await getAllProducts();
  return all.find(p => p.id === Number(id)) || null;
}

export async function getBestsellers(limit = 8) {
  const all = await getAllProducts();
  return all.filter(p => p.bestseller).slice(0, limit);
}

export async function getFeatured(limit = 8) {
  const all = await getAllProducts();
  return all.filter(p => p.featured).slice(0, limit);
}

export async function getProductsByBrand(brand) {
  const all = await getAllProducts();
  return all.filter(p => p.brand === brand);
}

export async function getProductsByCategory(category) {
  const all = await getAllProducts();
  return all.filter(p => p.category === category);
}

export async function getProductsByType(productType) {
  const all = await getAllProducts();
  return all.filter(p => p.productType === productType);
}

// === Lista única de marcas (para el menú/filtros)
export async function getAllBrands() {
  const all = await getAllProducts();
  return [...new Set(all.map(p => p.brand))]
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

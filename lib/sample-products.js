// Productos de ejemplo SOLO para desarrollo local sin Supabase.
// products-db.js los usa como fallback cuando `supabaseAdmin` es null
// (no hay credenciales en .env.local). En producción, con Supabase
// configurado, este archivo NUNCA se usa.
//
// Tienen el MISMO shape que devuelve rowToProduct() para que los
// componentes (ProductCard, PDP, tienda) funcionen sin cambios.

function mk(p) {
  const base = p.price;
  return {
    gender: 'unisex',
    type: p.fit || '',
    fit: p.fit || '',
    material: p.material || '',
    color: p.color || '',
    originalPrice: p.originalPrice ?? null,
    productType: 'unisex',
    categories: [p.category],
    reviews: p.reviews ?? 0,
    badge: p.badge ?? null,
    badgeColor: null,
    featured: !!p.featured,
    bestseller: !!p.bestseller,
    sizes: (p.sizes || ['S', 'M', 'L', 'XL']).map((s, i) => ({ size: s, ml: s, price: base, stock: 10 })),
    notes: { top: '', heart: '', base: '' },
    longevity: '', sillage: '', season: '', occasion: [], momento: null, clima: null,
    ...p,
  };
}

export const SAMPLE_PRODUCTS = [
  mk({
    id: 9001,
    slug: 'buzo-oversize-shadow',
    name: 'Buzo Oversize Shadow',
    brand: 'Nike',
    category: 'buzos',
    fit: 'Oversize',
    material: 'Algodón 100% french terry',
    color: 'Negro',
    price: 159900,
    originalPrice: 199900,
    rating: 4.8,
    reviews: 24,
    stock: 8,
    badge: 'NUEVO',
    featured: true,
    bestseller: true,
    description: 'Buzo oversize de algodón pesado con caída relajada. Corte streetwear, costuras reforzadas y tacto premium. Hecho para la calle, no para el clóset.',
    images: ['/img/gen/cat-buzos.webp', '/img/gen/look-01.webp'],
  }),
  mk({
    id: 9002,
    slug: 'jean-baggy-wave',
    name: 'Jean Baggy Wave Denim',
    brand: 'Adidas',
    category: 'jeans',
    fit: 'Baggy',
    material: 'Denim rígido 13oz',
    color: 'Azul medio',
    price: 169900,
    rating: 4.6,
    reviews: 12,
    stock: 4,
    badge: null,
    featured: false,
    bestseller: true,
    description: 'Jean baggy de denim pesado con lavado wave. Tiro medio, pierna ancha y caída perfecta sobre el tenis. Un básico que aguanta todo.',
    images: ['/img/gen/cat-jeans.webp', '/img/gen/look-02.webp'],
  }),
];

// === Constantes y helpers SÍNCRONOS del catálogo ===
//
// Este archivo es ISOMORFO: lo pueden importar tanto Server Components
// como Client Components sin arrastrar código de Supabase al bundle del
// browser. Aquí solo van valores puros y funciones que no tocan la DB.
//
// Si necesitas datos de productos (async), importa de lib/products.js:
//   import { getAllProducts } from '@/lib/products';
//
// NOTA: se conservan los MISMOS nombres de export que el sistema original
// (productTypes, collections, categoryLabels, ...) para no romper imports.
// El contenido fue migrado de perfumes → ropa urbana.

// === Helper síncrono: resolver imagen del producto
// - Productos con imágenes propias: usan images[0]
// - Fallback derivado del slug → /img/{slug}.webp
// - Fallback final: /img/placeholder.webp
export function getImagePath(product, fallback = '/img/placeholder.webp') {
  if (!product) return fallback;
  const first = product.images?.[0];
  if (first && !first.includes('placeholder')) return first;
  return product.slug ? `/img/${product.slug}.webp` : fallback;
}

// === "Tipos" de producto → aquí: GÉNERO (3 entradas principales del menú)
export const productTypes = [
  { id: 'hombre', slug: 'hombre', name: 'Hombre', description: 'Streetwear masculino',   color: '#111111', image: '/img/placeholder.webp' },
  { id: 'mujer',  slug: 'mujer',  name: 'Mujer',  description: 'Urbano femenino',         color: '#C0392B', image: '/img/placeholder.webp' },
  { id: 'unisex', slug: 'unisex', name: 'Unisex', description: 'Sin género, puro estilo', color: '#555555', image: '/img/placeholder.webp' },
];

// === "Colecciones" → aquí: CATEGORÍAS de prenda (para filtrar)
export const collections = [
  { id: 'hoodies',     slug: 'hoodies',     name: 'Hoodies & Buzos', description: 'Capucha, abrigo y calle',      color: '#1C1C1C', image: '/img/placeholder.webp' },
  { id: 'camisetas',   slug: 'camisetas',   name: 'Camisetas',       description: 'Oversize, boxy y básicas',     color: '#2E86C1', image: '/img/placeholder.webp' },
  { id: 'pantalones',  slug: 'pantalones',  name: 'Pantalones',      description: 'Cargo, jogger y baggy',        color: '#5D6D7E', image: '/img/placeholder.webp' },
  { id: 'chaquetas',   slug: 'chaquetas',   name: 'Chaquetas',       description: 'Bombers, denim y puffers',     color: '#784212', image: '/img/placeholder.webp' },
  { id: 'gorras',      slug: 'gorras',      name: 'Gorras',          description: 'Snapback, trucker y dad hats', color: '#196F3D', image: '/img/placeholder.webp' },
  { id: 'accesorios',  slug: 'accesorios',  name: 'Accesorios',      description: 'Bolsos, medias y más',         color: '#884EA0', image: '/img/placeholder.webp' },
];

// === Testimonios (fallback si no hay reseñas reales en Supabase)
export const testimonials = [
  { id: 1, name: 'Mateo Restrepo', location: 'Medellín',     rating: 5, text: 'El hoodie oversize es brutal, la tela pesa rico y el fit es justo como en las fotos. Me llegó en 2 días.', avatar: 'https://i.pravatar.cc/80?img=12', product: 'Hoodie Oversize' },
  { id: 2, name: 'Valeria Gómez',  location: 'Bogotá',       rating: 5, text: 'Las camisetas boxy son mi nuevo vicio. Calidad real, no se deforman al lavar. 100% recomendado.',        avatar: 'https://i.pravatar.cc/80?img=45', product: 'Camiseta Boxy' },
  { id: 3, name: 'Samuel Ortiz',   location: 'Cali',         rating: 5, text: 'Los cargo joggers son perfectos, cómodos y con mucho estilo. La marca está pegando fuerte en la ciudad.', avatar: 'https://i.pravatar.cc/80?img=33', product: 'Cargo Jogger' },
  { id: 4, name: 'Luna Martínez',  location: 'Barranquilla', rating: 5, text: 'Pedí una gorra y una chaqueta bomber, ambas calidad premium. El empaque también muy bien cuidado.',         avatar: 'https://i.pravatar.cc/80?img=24', product: 'Bomber' },
];

// === Labels de categoría (id → nombre legible)
export const categoryLabels = {
  hoodies:    'Hoodies & Buzos',
  camisetas:  'Camisetas',
  pantalones: 'Pantalones',
  chaquetas:  'Chaquetas',
  gorras:     'Gorras',
  accesorios: 'Accesorios',
};

// === Labels de "tipo" → aquí GÉNERO
export const productTypeLabels = {
  hombre: 'Hombre',
  mujer:  'Mujer',
  unisex: 'Unisex',
};

// === Ocasión de uso (reemplaza "momento del día" de perfumes)
export const momentoOptions = [
  { id: 'diario',  name: 'Para el día a día', description: 'Básicos y combinables para la calle', icon: '🏙️' },
  { id: 'salir',   name: 'Para salir',        description: 'Piezas statement para la noche',       icon: '🌃' },
  { id: 'deporte', name: 'Deportivo',         description: 'Cómodo para moverte sin parar',        icon: '⚡' },
];

// === Temporada (reemplaza "clima" de perfumes)
export const climaOptions = [
  { id: 'calido',   name: 'Clima Cálido', description: 'Telas ligeras y frescas',    icon: '🌞' },
  { id: 'templado', name: 'Entretiempo',  description: 'Capas y prendas versátiles', icon: '🌤️' },
  { id: 'frio',     name: 'Clima Frío',   description: 'Buzos, puffers y abrigo',     icon: '🧥' },
];

// === Helpers de derivación (se conservan por compatibilidad; sin uso real
// hasta que se definan etiquetas de ocasión/temporada por producto).
export function deriveMomento(product) {
  if (product.momento) return product.momento;
  return 'diario';
}

export function deriveClima(product) {
  if (product.clima) return product.clima;
  return 'templado';
}

// Defaults de cada sección editable de la home — son EXACTAMENTE los valores
// que estaban hardcodeados antes de que esto fuera editable desde el admin.
// Isomorfo (sin 'server-only'): lo importan tanto el server (para mergear
// con lo que haya en Supabase) como los componentes client (como prop-type
// de referencia / fallback si por algún motivo llega vacío).

export const HOME_DEFAULTS = {
  hero: {
    kicker: '★ STREETWEAR MULTIMARCA · DESDE EL 6IX',
    titlePrefix: 'EN LA CALLE',
    words: ['MANDAS', 'BRILLAS', 'PEGAS', 'RESALTAS'],
    subtitle: 'Las mejores marcas de streetwear, curadas. Lo que se usa en el 6ix.',
    ctaPrimaryText: 'VER LA TIENDA',
    ctaPrimaryHref: '/tienda',
    ctaSecondaryText: 'LO NUEVO',
    ctaSecondaryHref: '/tienda?sort=nuevo',
    video1: '/video/hero2.mp4',
    video1Poster: '/video/hero2-poster.webp',
    video2: '/video/hero3.mp4',
    video2Poster: '/video/hero3-poster.webp',
  },

  graffiti: {
    bgImage: '/img/graffiti.webp',
    phrases: ['NUEVOS INGRESOS', 'ENVÍO A TODA COLOMBIA', 'LAS MEJORES MARCAS'],
  },

  whysix: {
    tag: '/// FILOSOFÍA · 03',
    title: 'POR QUÉ 6IX',
    items: [
      { icon: 'Sparkles',   tag: 'SELECCIÓN', title: 'ELEGIDO',              text: 'Cada pieza escogida a mano. Nada de relleno — solo lo que manda en la calle.' },
      { icon: 'BadgeCheck', tag: 'CALIDAD',   title: 'CALIDAD GARANTIZADA',  text: 'Productos auténticos y verificados. Sin réplicas, sin excusas.' },
      { icon: 'Flame',      tag: 'CULTURA',   title: 'COMUNIDAD 6IX',        text: 'Más que una tienda: streetwear hecho para la calle, no para el clóset.' },
    ],
  },

  shoes: {
    tag: '/// TENIS',
    title: 'TENIS',
    linkText: 'VER TODO',
    linkHref: '/tienda?cat=gorras',
    items: [
      { name: '6IX AIR · LIME',    img: '/img/shoes/green.webp', color: '#9bdc28', href: '/tienda' },
      { name: '6IX AIR · AQUA',    img: '/img/shoes/blue.webp',  color: '#1da3c3', href: '/tienda' },
      { name: '6IX AIR · CRIMSON', img: '/img/shoes/red.webp',   color: '#eb0e2f', href: '/tienda' },
    ],
  },

  trust: {
    items: [
      { icon: 'Truck',       title: 'Envío a toda Colombia', subtitle: '24–48H' },
      { icon: 'ShieldCheck', title: 'Pago seguro',           subtitle: 'BOLD' },
      { icon: 'RefreshCw',   title: 'Cambios fáciles',       subtitle: '15 DÍAS' },
    ],
  },

  categories: {
    // key = id de la categoría en lib/products-constants.js (collections).
    // Vacío = usa el default /img/gen/cat-{id}.webp que ya existe en el repo.
    images: {},
  },

  lookbook: {
    tag: '/// EDITORIAL · COL. 2026',
    title: 'GALERÍA',
    titleAccent: '2026',
    subtitle: 'La calle como pasarela. Pasa el cursor — la pieza cobra vida.',
    buttonText: 'VER COLECCIÓN COMPLETA',
    images: [
      '/img/gen/look-01.webp', '/img/gen/look-02.webp', '/img/gen/look-03.webp',
      '/img/gen/look-04.webp', '/img/gen/look-05.webp', '/img/gen/look-06.webp',
      '/img/gen/look-07.webp', '/img/gen/look-08.webp', '/img/gen/look-09.webp',
    ],
  },

  campaign: {
    image: '/img/gen/campaign.webp',
    tag: '/// CAMPAÑA 2026',
    titleLine1: 'EN LAS CALLES',
    titleLine2: 'DE COLOMBIA',
    buttonText: 'VER LA COLECCIÓN',
    buttonHref: '/tienda',
  },

  manifesto: {
    marqueeWord: '6IXSTARS',
    tag: '/// MANIFIESTO N°01',
    titleLine1: 'HECHO PARA LA CALLE.',
    titleLine2: 'NO PARA EL CLÓSET.',
    text: '6ixstars reúne las mejores marcas de streetwear en un solo lugar. Piezas seleccionadas y elegidas a mano. Cuando se agota, se agota.',
  },

  testimonials: {
    items: [
      { name: 'Mateo Restrepo', location: 'Medellín',     product: 'Hoodie Oversize', rating: 5, text: 'El hoodie oversize es brutal, la tela pesa rico y el fit es justo como en las fotos. Me llegó en 2 días.' },
      { name: 'Valeria Gómez',  location: 'Bogotá',       product: 'Camiseta Boxy',   rating: 5, text: 'Las camisetas boxy son mi nuevo vicio. Calidad real, no se deforman al lavar. 100% recomendado.' },
      { name: 'Samuel Ortiz',   location: 'Cali',         product: 'Cargo Jogger',    rating: 5, text: 'Los cargo joggers son perfectos, cómodos y con mucho estilo. La marca está pegando fuerte en la ciudad.' },
      { name: 'Luna Martínez',  location: 'Barranquilla', product: 'Bomber',          rating: 5, text: 'Pedí una gorra y una chaqueta bomber, ambas calidad premium. El empaque también muy bien cuidado.' },
    ],
  },

  join: {
    tag: '/// COMUNIDAD 6IX',
    title: 'ÚNETE AL 6IX',
    text: 'Enterate de los nuevos ingresos antes que nadie. Acceso anticipado, descuentos y nada de spam.',
  },
};

export const HOME_SECTION_KEYS = Object.keys(HOME_DEFAULTS);

// Iconos disponibles para whysix/trust — nombre (string, así se guarda en
// Supabase) → se resuelve al componente lucide real en cada componente.
export const HOME_ICON_NAMES = [
  'Sparkles', 'BadgeCheck', 'Flame', 'Truck', 'ShieldCheck', 'RefreshCw',
  'Star', 'Heart', 'Zap', 'Award', 'Package', 'Gift',
];

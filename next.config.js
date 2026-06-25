/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      // Supabase Storage para imágenes de producto subidas desde el admin.
      // El hostname se infiere de NEXT_PUBLIC_SUPABASE_URL; aceptamos
      // cualquier subdomain *.supabase.co/storage/v1/object/public/*.
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  experimental: {
    serverActions: {
      // Permite uploads de hasta 5MB desde Server Actions (default es 1MB).
      bodySizeLimit: '5mb',
    },
  },
  // El navegador NO debe cachear el documento HTML: así cada deploy se ve al
  // instante sin tener que borrar datos de navegación. Los assets de _next/*
  // (con hash en el nombre) se siguen cacheando de forma inmutable.
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|sw.js).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        // El propio service worker nunca debe quedar cacheado.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;

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
};

export default nextConfig;

import './globals.css';
import { Montserrat, Anton, Space_Mono } from 'next/font/google';
import { PublicHeader, PublicFooter } from '@/components/layout/PublicChrome';
import ToasterWrapper from '@/components/ui/ToasterWrapper';
import DeferredShell from '@/components/layout/DeferredShell';
import { SITE_URL } from '@/lib/site';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Anton — display condensado pesado para titulares (look streetwear).
const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

// Space Mono — etiquetas técnicas/brutalistas (meta, tags, coordenadas).
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

// Imagen OG estática (1200x630) en /public/og.png.
const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: '6ixstars — Ropa urbana',
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '6ixstars — Streetwear & Ropa Urbana',
    template: '%s | 6ixstars',
  },
  description: 'Ropa urbana y streetwear para los que marcan la diferencia. Hoodies, camisetas, pantalones y accesorios con estilo. Envío a toda Colombia.',
  keywords: ['ropa urbana', 'streetwear Colombia', 'hoodies', 'camisetas oversize', 'ropa juvenil', 'moda urbana', 'sudaderas', 'ropa streetwear Medellín', '6ixstars'],
  authors: [{ name: '6ixstars' }],
  creator: '6ixstars',
  publisher: '6ixstars',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '6ixstars',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    siteName: '6ixstars',
    locale: 'es_CO',
    type: 'website',
    url: SITE_URL,
    title: '6ixstars — Streetwear & Ropa Urbana',
    description: 'Ropa urbana para los que marcan la diferencia. Envío a toda Colombia.',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: '6ixstars — Streetwear & Ropa Urbana',
    description: 'Ropa urbana para los que marcan la diferencia. Envío a toda Colombia.',
    images: [OG_IMAGE.url],
  },
  formatDetection: {
    telephone: false,
  },
};

// Schema.org Organization: le dice a Google quién es la marca, su logo
// para mostrar en SERP, redes sociales asociadas y formas de contacto.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: '6ixstars',
  alternateName: '6ixstars Streetwear',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
  },
  description: 'Ropa urbana y streetwear en Colombia. Hoodies, camisetas, pantalones y accesorios con envío a todo el país.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CO',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    areaServed: 'CO',
    availableLanguage: ['Spanish'],
  },
  sameAs: [
    'https://www.instagram.com/6ixstars/',
    'https://www.tiktok.com/@6ixstars',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: '6ixstars',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'es-CO',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/tienda?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({ children }) {
  // Carga el catálogo en server-side (cacheado) y se lo pasa al Navbar.
  // El Navbar necesita la lista de marcas para el mega menú y el catálogo
  // completo para la búsqueda en vivo.
  const { getAllProducts } = await import('@/lib/products');
  const products = await getAllProducts();
  return (
    <html lang="es" className={`${montserrat.variable} ${anton.variable} ${spaceMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <PublicHeader products={products} />
        <ToasterWrapper />
        {children}
        <PublicFooter />
        <DeferredShell />
      </body>
    </html>
  );
}

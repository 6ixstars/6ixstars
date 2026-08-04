import HomePageClient from '@/components/pages/HomePageClient';
import { getAllProducts } from '@/lib/products';
import { getHomeContent } from '@/lib/home-content';

export const metadata = {
  title: '6ixstars — Streetwear & Ropa Urbana en Colombia',
  description: 'Hoodies, camisetas oversize, cargos, jeans y gorras de las mejores marcas. Ropa urbana con envío a toda Colombia.',
};

export default async function HomePage() {
  // Cargamos el catálogo y el contenido editable de la home en server-side
  // (ambos cacheados) y se los pasamos al client component.
  const [products, content] = await Promise.all([
    getAllProducts(),
    getHomeContent(),
  ]);
  return <HomePageClient products={products} content={content} />;
}

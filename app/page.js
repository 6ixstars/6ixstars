import HomePageClient from '@/components/pages/HomePageClient';
import { getAllProducts } from '@/lib/products';

export const metadata = {
  title: '6ixstars — Streetwear & Ropa Urbana en Colombia',
  description: 'Hoodies, camisetas oversize, cargos y gorras. Ropa urbana para los que marcan la diferencia. Drops limitados con envío a toda Colombia.',
};

export default async function HomePage() {
  // Cargamos el catálogo en server-side (con cache) y se lo pasamos al
  // client component. El cliente no consulta la DB directamente.
  const products = await getAllProducts();
  return <HomePageClient products={products} />;
}

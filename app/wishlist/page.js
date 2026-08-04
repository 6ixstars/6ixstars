import { Suspense } from 'react';
import WishlistPageClient from '@/components/pages/WishlistPageClient';

export const metadata = {
  title: 'Lista de Deseos — Mis Prendas Favoritas',
  description: 'Tus prendas favoritas guardadas en un solo lugar.',
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <Suspense>
      <WishlistPageClient />
    </Suspense>
  );
}

'use client';
// Sección "Marcas" — usa el componente de 21st.dev (MarqueeLogoScroller).
// Tienda multimarca: marquee infinito con los logos de las marcas que vendemos.
import { MarqueeLogoScroller } from '@/components/ui/marquee-logos';

const G = (from, via, to) => ({ from, via, to });
const PINK = G('rgba(255,46,126,.0)', 'rgba(255,46,126,.25)', 'rgba(255,46,126,.55)');

const LOGOS = [
  { src: '/img/brands/nike.svg', alt: 'Nike', gradient: PINK },
  { src: '/img/brands/adidas.svg', alt: 'Adidas', gradient: PINK },
  { src: '/img/brands/jordan.svg', alt: 'Jordan', gradient: PINK },
  { src: '/img/brands/puma.svg', alt: 'Puma', gradient: PINK },
  { src: '/img/brands/newbalance.svg', alt: 'New Balance', gradient: PINK },
  { src: '/img/brands/reebok.svg', alt: 'Reebok', gradient: PINK },
  { src: '/img/brands/underarmour.svg', alt: 'Under Armour', gradient: PINK },
  { src: '/img/brands/thenorthface.svg', alt: 'The North Face', gradient: PINK },
  { src: '/img/brands/fila.svg', alt: 'Fila', gradient: PINK },
];

export default function BrandsMarquee() {
  return (
    <section className="container brands-21" style={{ paddingTop: 86, paddingBottom: 10 }}>
      <style>{`
        .brands-21 h2 { font-family: var(--font-display); font-weight: 400; letter-spacing: -.005em; text-transform: uppercase; line-height: .95; }
        .brands-21 p { font-family: var(--font-sans); }
      `}</style>
      <MarqueeLogoScroller
        title="LAS MEJORES MARCAS, EN UN SOLO LUGAR"
        description="Streetwear original de las marcas que mandan en la calle. Selección curada, 100% auténtico."
        logos={LOGOS}
        speed="normal"
      />
    </section>
  );
}

'use client';
// Sección "Lookbook" — usa el componente de 21st.dev (Animated Gallery):
// galería 3D que se endereza con el scroll, columnas en parallax.
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  ContainerScroll, ContainerSticky, GalleryContainer, GalleryCol,
  ContainerStagger, ContainerAnimated,
} from '@/components/blocks/animated-gallery';

const COL_1 = ['/img/gen/look-01.webp', '/img/gen/look-02.webp', '/img/gen/look-03.webp'];
const COL_2 = ['/img/gen/look-04.webp', '/img/gen/look-05.webp', '/img/gen/look-06.webp'];
const COL_3 = ['/img/gen/look-07.webp', '/img/gen/look-08.webp', '/img/gen/look-09.webp'];

// Cada foto mantiene su proporción vertical original (3:4). La altura manda
// y el ancho se deriva solo; margin auto la centra dentro de su columna.
const Img = ({ src }) => (
  <div style={{ aspectRatio: '3 / 4', height: '26vh', margin: '0 auto', overflow: 'hidden', borderRadius: '10px', boxShadow: '0 6px 18px rgba(0,0,0,.45)' }}>
    <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

export default function LookbookGallery() {
  return (
    <section className="lookbook-21" style={{ background: 'var(--black)' }}>
      <ContainerStagger className="container relative z-[9] place-self-center px-6 pt-24 text-center">
        <ContainerAnimated className="lk-tag">/// EDITORIAL · COL. 2026</ContainerAnimated>
        <ContainerAnimated>
          <h2 className="lk-title">GALERÍA <span>2026</span></h2>
        </ContainerAnimated>
        <ContainerAnimated className="lk-sub">
          La calle como pasarela. Piezas reales sobre gente real — así se ve el 6ix.
        </ContainerAnimated>
        <ContainerAnimated>
          <Link href="/tienda" className="sx6-btn sx6-btn-pink lk-cta" data-cursor="hover">
            VER COLECCIÓN <ArrowUpRight size={18} />
          </Link>
        </ContainerAnimated>
      </ContainerStagger>

      <ContainerScroll className="relative h-[170vh]">
        <ContainerSticky className="h-svh">
          <GalleryContainer className="container">
            <GalleryCol style={{ marginTop: '4vh' }} yRange={['12%', '0%']}>
              {COL_1.map((s, i) => <Img key={i} src={s} />)}
            </GalleryCol>
            <GalleryCol style={{ marginTop: '-2vh' }} yRange={['22%', '0%']}>
              {COL_2.map((s, i) => <Img key={i} src={s} />)}
            </GalleryCol>
            <GalleryCol style={{ marginTop: '4vh' }} yRange={['8%', '0%']}>
              {COL_3.map((s, i) => <Img key={i} src={s} />)}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>

      <style>{`
        .lookbook-21 .lk-tag { display:inline-block; font-family: var(--font-tech); font-size:.64rem; letter-spacing:.2em; color: var(--gold); border:1px solid var(--dark-4); padding:5px 10px; margin-bottom:16px; }
        .lookbook-21 .lk-title { font-family: var(--font-display); font-size: clamp(2.8rem, 9vw, 7rem); color: var(--white); line-height:.86; margin:0; text-transform:uppercase; }
        .lookbook-21 .lk-title span { color: transparent; -webkit-text-stroke: 2px var(--gold); }
        .lookbook-21 .lk-sub { max-width: 460px; margin: 18px auto 0; color: var(--gray-light); line-height:1.6; }
        .lookbook-21 .lk-cta { margin-top: 26px; }
      `}</style>
    </section>
  );
}

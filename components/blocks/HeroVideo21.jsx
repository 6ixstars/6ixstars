'use client';
// Componente de 21st.dev — "Hero with bg video" (convertido TSX→JSX).
// Video de fondo + headline con palabras rotativas (spring). Adaptado:
// usa VideoSlides (crossfade de 2 videos) y tema negro+rosa del 6ix.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import VideoSlides from '@/components/fx/VideoSlides';
import Magnetic from '@/components/fx/Magnetic';

export default function HeroVideo21() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ['MANDAS', 'BRILLAS', 'PEGAS', 'RESALTAS'], []);

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1));
    }, 2000);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <section className="hero21 relative w-full min-h-[100svh] overflow-hidden font-sans">
      {/* Video de fondo (crossfade de 2 clips) */}
      <div className="absolute inset-0 z-0">
        <VideoSlides />
      </div>
      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(11,11,12,.55) 0%, rgba(11,11,12,.15) 22%, transparent 45%, rgba(11,11,12,.45) 72%, rgba(11,11,12,.92) 100%)' }} />

      <div className="relative z-20 flex flex-col items-center justify-end md:justify-center w-full min-h-[100svh] pb-24 md:pb-0">
        <div className="flex gap-7 items-center justify-center flex-col w-full container">
          {/* Kicker */}
          <span className="hero21-kicker">★ STREETWEAR MULTIMARCA · DESDE EL 6IX</span>

          {/* Headline con palabra rotativa */}
          <h1 className="hero21-title">
            <span className="block">EN LA CALLE</span>
            <span className="relative flex w-full justify-center overflow-hidden text-center pb-2">
              &nbsp;
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="hero21-rot absolute"
                  initial={{ opacity: 0, y: -100 }}
                  transition={{ type: 'spring', stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="hero21-sub">Las mejores marcas de streetwear, originales y curadas. Lo que se usa en el 6ix.</p>

          <div className="flex flex-row flex-wrap gap-3 justify-center">
            <Magnetic strength={0.5}>
              <Link href="/tienda" className="sx6-btn sx6-btn-pink" data-cursor="hover">VER LA TIENDA <ArrowUpRight size={18} /></Link>
            </Magnetic>
            <Magnetic strength={0.5}>
              <Link href="/tienda?sort=nuevo" className="sx6-btn sx6-btn-ghost" data-cursor="hover">LO NUEVO</Link>
            </Magnetic>
          </div>
        </div>
      </div>

      <style>{`
        .hero21-kicker { font-family: var(--font-tech); font-size: .64rem; letter-spacing: .24em; color: var(--gold); }
        .hero21-title { font-family: var(--font-display); text-transform: uppercase; font-size: clamp(2.6rem, 9vw, 6.5rem); line-height: .9; color: #fff; text-align: center; margin: 0; text-shadow: 0 6px 36px rgba(0,0,0,.55); }
        .hero21-rot { font-family: var(--font-display); color: transparent; -webkit-text-stroke: 2px var(--gold); text-shadow: 0 0 40px rgba(255,46,126,.45); will-change: transform; }
        .hero21-sub { max-width: 460px; text-align: center; color: var(--gray-light); font-size: 1rem; line-height: 1.6; text-shadow: 0 2px 10px rgba(0,0,0,.6); }
        @media (max-width: 600px) { .hero21-title { font-size: clamp(2.2rem, 12vw, 3rem); } }
      `}</style>
    </section>
  );
}

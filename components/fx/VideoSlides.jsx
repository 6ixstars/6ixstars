'use client';
import { useEffect, useState } from 'react';

// Slideshow de videos de fondo con crossfade. Ambos reproducen en loop;
// se alterna la opacidad cada N segundos.
// hero3 es un clip vertical (celular) — con "cover" se ve recortado/con
// zoom excesivo, así que usa "contain" (se ve completo) + una copia del
// mismo video de fondo, difuminada, para rellenar los laterales sin
// barras negras.
const VIDEOS = [
  { src: '/video/hero2.mp4', poster: '/video/hero2-poster.webp', fit: 'cover' },
  { src: '/video/hero3.mp4', poster: '/video/hero3-poster.webp', fit: 'contain' },
];

export default function VideoSlides() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(() => VIDEOS.map((_, i) => i === 0));

  // Difiere la carga de los clips que no son el primero para no competir
  // con los recursos críticos del primer render (fuentes, JS, poster).
  useEffect(() => {
    const id = setTimeout(() => {
      setLoaded(VIDEOS.map(() => true));
    }, 1500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % VIDEOS.length), 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sx6-vslides" aria-hidden="true">
      {VIDEOS.map((v, i) => (
        <div key={v.src} className={`sx6-vslide-wrap ${i === active ? 'on' : ''}`}>
          {loaded[i] && (
            <>
              {v.fit === 'contain' && (
                <video className="sx6-vslide-bg" autoPlay muted loop playsInline preload="auto">
                  <source src={v.src} type="video/mp4" />
                </video>
              )}
              <video
                className={`sx6-vslide ${v.fit === 'contain' ? 'is-contain' : ''}`}
                autoPlay muted loop playsInline preload="auto" poster={v.poster}
              >
                <source src={v.src} type="video/mp4" />
              </video>
            </>
          )}
        </div>
      ))}
      <style>{`
        .sx6-vslides { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: #0B0B0C; }
        .sx6-vslide-wrap { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
        .sx6-vslide-wrap.on { opacity: 1; }
        .sx6-vslide, .sx6-vslide-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .sx6-vslide { object-fit: cover; z-index: 1; }
        .sx6-vslide.is-contain { object-fit: contain; }
        .sx6-vslide-bg { object-fit: cover; z-index: 0; filter: blur(50px) brightness(.55) saturate(1.3); transform: scale(1.2); }
      `}</style>
    </div>
  );
}

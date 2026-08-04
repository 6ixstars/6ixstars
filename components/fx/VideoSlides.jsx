'use client';
import { useEffect, useState } from 'react';

// Slideshow de videos de fondo con crossfade. Ambos reproducen en loop;
// se alterna la opacidad cada N segundos.
// hero3 es un clip vertical (celular) — con "cover" se ve recortado/con
// zoom excesivo, así que usa "contain" (se ve completo) y los laterales
// quedan en negro sólido — limpio y elegante, sin formas/blur de relleno.
export default function VideoSlides({ video1, video1Poster, video2, video2Poster }) {
  const VIDEOS = [
    { src: video1 || '/video/hero2.mp4', poster: video1Poster || '/video/hero2-poster.webp', fit: 'cover' },
    { src: video2 || '/video/hero3.mp4', poster: video2Poster || '/video/hero3-poster.webp', fit: 'contain' },
  ];
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
            <video
              className={`sx6-vslide ${v.fit === 'contain' ? 'is-contain' : ''}`}
              autoPlay muted loop playsInline preload="auto" poster={v.poster}
            >
              <source src={v.src} type="video/mp4" />
            </video>
          )}
        </div>
      ))}
      <style>{`
        .sx6-vslides { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: #0B0B0C; }
        .sx6-vslide-wrap { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
        .sx6-vslide-wrap.on { opacity: 1; }
        .sx6-vslide { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .sx6-vslide.is-contain { object-fit: contain; background: #0B0B0C; }
      `}</style>
    </div>
  );
}

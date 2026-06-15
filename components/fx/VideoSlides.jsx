'use client';
import { useEffect, useState } from 'react';

// Slideshow de videos de fondo con crossfade. Ambos reproducen en loop;
// se alterna la opacidad cada N segundos.
const VIDEOS = [
  { src: '/video/hero.mp4', poster: '/video/hero-poster.webp' },
  { src: '/video/hero2.mp4', poster: '/video/hero2-poster.webp' },
];

export default function VideoSlides() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % VIDEOS.length), 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sx6-vslides" aria-hidden="true">
      {VIDEOS.map((v, i) => (
        <video
          key={v.src}
          className={`sx6-vslide ${i === active ? 'on' : ''}`}
          autoPlay muted loop playsInline preload="auto" poster={v.poster}
        >
          <source src={v.src} type="video/mp4" />
        </video>
      ))}
      <style>{`
        .sx6-vslides { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .sx6-vslide { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.4s ease; }
        .sx6-vslide.on { opacity: 1; }
      `}</style>
    </div>
  );
}

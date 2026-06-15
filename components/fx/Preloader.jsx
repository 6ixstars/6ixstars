'use client';
import { useEffect, useState } from 'react';

// Preloader / intro: la estrella de 6ixstars flota y pulsa mientras una
// barra de progreso se llena; luego se desvanece y revela el sitio.
// Inspirado en el preloader "ghost" pero adaptado a la marca (estrella + rosa).
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + Math.random() * 16 + 7);
      setProgress(p);
      if (p >= 100) { clearInterval(id); setTimeout(() => setDone(true), 350); }
    }, 190);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!done) return;
    document.documentElement.style.overflow = '';
    const t = setTimeout(() => setHidden(true), 900);
    return () => clearTimeout(t);
  }, [done]);

  if (hidden) return null;

  return (
    <div className={`pl ${done ? 'pl-out' : ''}`} role="presentation">
      <div className="pl-inner">
        <svg className="pl-star" width="84" height="84" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 2 L61 38 L98 38 L68 60 L79 96 L50 74 L21 96 L32 60 L2 38 L39 38 Z" fill="currentColor" />
        </svg>
        <div className="pl-word">6IXSTARS</div>
        <div className="pl-text">CARGANDO EL DROP · FW26</div>
        <div className="pl-track"><div className="pl-bar" style={{ width: `${progress}%` }} /></div>
      </div>

      <style>{`
        .pl {
          position: fixed; inset: 0; z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #161118 50%, #0a0a0a 100%);
          opacity: 1; transition: opacity .9s ease-out;
        }
        .pl-out { opacity: 0; pointer-events: none; }
        .pl-inner { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .pl-star {
          color: var(--gold, #FF2E7E);
          filter: drop-shadow(0 0 26px rgba(255,46,126,.5));
          animation: pl-float 2.4s ease-in-out infinite, pl-spin 9s linear infinite;
        }
        @keyframes pl-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pl-spin { to { transform: rotate(360deg); } }
        .pl-word {
          font-family: var(--font-anton, system-ui), sans-serif;
          font-size: 2.4rem; letter-spacing: .04em; text-transform: uppercase;
          color: #fff; margin: 22px 0 10px; line-height: 1;
        }
        .pl-text {
          font-family: var(--font-mono, ui-monospace), monospace;
          font-size: .64rem; letter-spacing: .28em; text-transform: uppercase;
          color: rgba(255,255,255,.6); margin-bottom: 16px;
          animation: pl-pulse 2s ease-in-out infinite;
        }
        @keyframes pl-pulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pl-track { width: 130px; height: 2px; background: rgba(255,255,255,.12); border-radius: 2px; overflow: hidden; }
        .pl-bar { height: 100%; background: linear-gradient(90deg, var(--gold, #FF2E7E), var(--gold-dark, #E11D48)); transition: width .35s ease; }
        @media (prefers-reduced-motion: reduce) { .pl-star { animation: none; } .pl-text { animation: none; } }
      `}</style>
    </div>
  );
}

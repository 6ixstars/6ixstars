'use client';
import { useEffect, useState } from 'react';

export default function EntryScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('6ix-entered')) {
      // Pequeño delay para que la página cargue primero
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const play = () => {
    if (leaving) return;
    sessionStorage.setItem('6ix-entered', '1');
    const a = document.querySelector('audio[data-theme]');
    if (a) { a.muted = false; a.play().catch(() => {}); }
    dismiss();
  };

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <>
      <div className={`ixpop${leaving ? ' ixpop--out' : ''}`} role="dialog" aria-label="Música de fondo">

        {/* Icono música */}
        <div className="ixpop-ico">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        {/* Texto */}
        <div className="ixpop-text">
          <span className="ixpop-title">Música de fondo</span>
          <span className="ixpop-sub">6ixstars tiene su propia banda sonora</span>
        </div>

        {/* Botón play */}
        <button className="ixpop-play" onClick={play} aria-label="Reproducir música">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.54.84l11-7.5a1 1 0 0 0 0-1.68l-11-7.5A1 1 0 0 0 7 4.5z" />
          </svg>
          PLAY
        </button>

        {/* Cerrar */}
        <button className="ixpop-close" onClick={dismiss} aria-label="Cerrar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

      </div>

      <style>{`
        .ixpop {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          z-index: 9000;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px 14px 18px;
          background: rgba(12, 10, 7, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(201,169,110,.25);
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,.5), 0 0 0 1px rgba(201,169,110,.05) inset;
          animation: ixpop-in .45s cubic-bezier(.22,1,.36,1) forwards;
          white-space: nowrap;
          max-width: calc(100vw - 32px);
        }
        .ixpop--out {
          animation: ixpop-out .4s cubic-bezier(.4,0,.2,1) forwards !important;
        }
        @keyframes ixpop-in {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes ixpop-out {
          to { opacity: 0; transform: translateX(-50%) translateY(16px); }
        }

        .ixpop-ico {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(201,169,110,.12);
          border: 1px solid rgba(201,169,110,.2);
          color: #C9A96E;
          flex-shrink: 0;
        }

        .ixpop-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .ixpop-title {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .78rem;
          font-weight: 600;
          color: #F5EFE3;
          letter-spacing: .02em;
        }
        .ixpop-sub {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .65rem;
          color: rgba(250,246,238,.4);
          letter-spacing: .02em;
        }

        .ixpop-play {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          background: #C9A96E;
          border: none;
          border-radius: 999px;
          color: #0C0A07;
          font-family: var(--font-montserrat), sans-serif;
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .16em;
          cursor: pointer;
          flex-shrink: 0;
          transition: background .2s, transform .15s;
        }
        .ixpop-play:hover {
          background: #D4B47A;
          transform: scale(1.04);
        }
        .ixpop-play:active { transform: scale(.96); }

        .ixpop-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: rgba(250,246,238,.35);
          cursor: pointer;
          flex-shrink: 0;
          transition: color .2s, background .2s;
          padding: 0;
        }
        .ixpop-close:hover {
          color: #F5EFE3;
          background: rgba(250,246,238,.08);
        }

        @media (max-width: 480px) {
          .ixpop { bottom: 100px; }
          .ixpop-sub { display: none; }
        }
      `}</style>
    </>
  );
}

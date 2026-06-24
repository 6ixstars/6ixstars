'use client';
import { useEffect, useRef, useState } from 'react';

export default function EntryScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Solo mostrar una vez por sesión
    if (!sessionStorage.getItem('6ix-entered')) {
      setVisible(true);
    }
    // Montar el audio en este componente para tenerlo listo
    const a = document.querySelector('audio[data-theme]');
    if (a) audioRef.current = a;
  }, []);

  const enter = () => {
    // Guardar sesión
    sessionStorage.setItem('6ix-entered', '1');

    // Arrancar música
    const a = document.querySelector('audio[data-theme]');
    if (a) {
      a.muted = false;
      a.play().catch(() => {});
    }

    // Animar salida
    setLeaving(true);
    setTimeout(() => setVisible(false), 700);
  };

  if (!visible) return null;

  return (
    <>
      <div className={`entry${leaving ? ' entry--out' : ''}`} role="dialog" aria-modal="true" aria-label="Bienvenida">

        {/* Fondo con gradiente sutil */}
        <div className="entry-bg" />

        {/* Contenido central */}
        <div className="entry-body">

          {/* Marca */}
          <p className="entry-eyebrow">Bienvenido a</p>
          <h1 className="entry-brand">6IXSTARS</h1>
          <p className="entry-tagline">Streetwear · Colombia</p>

          {/* Nota de audio */}
          <div className="entry-sound">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
            <span>Este sitio tiene música de fondo</span>
          </div>

          {/* Botón entrar */}
          <button className="entry-btn" onClick={enter} autoFocus>
            <span>ENTRAR</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4.5v15a1 1 0 0 0 1.54.84l11-7.5a1 1 0 0 0 0-1.68l-11-7.5A1 1 0 0 0 7 4.5z" />
            </svg>
          </button>

        </div>

      </div>

      <style>{`
        .entry {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080705;
          animation: entry-in .5s ease forwards;
        }
        .entry--out {
          animation: entry-out .7s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes entry-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes entry-out {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.04); }
        }

        .entry-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,169,110,.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .entry-body {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          text-align: center;
          padding: 0 24px;
          animation: entry-body-in .7s .15s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes entry-body-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .entry-eyebrow {
          font-size: .65rem;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: rgba(201,169,110,.6);
          margin: 0 0 16px;
          font-family: var(--font-montserrat), sans-serif;
          font-weight: 500;
        }

        .entry-brand {
          font-family: var(--font-anton), 'Anton', sans-serif;
          font-size: clamp(3.5rem, 12vw, 7rem);
          font-weight: 400;
          color: #FAF6EE;
          letter-spacing: .04em;
          line-height: 1;
          margin: 0 0 12px;
        }

        .entry-tagline {
          font-size: .7rem;
          letter-spacing: .25em;
          text-transform: uppercase;
          color: rgba(250,246,238,.35);
          margin: 0 0 40px;
          font-family: var(--font-montserrat), sans-serif;
        }

        .entry-sound {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: .72rem;
          letter-spacing: .08em;
          color: rgba(201,169,110,.55);
          margin-bottom: 32px;
          font-family: var(--font-montserrat), sans-serif;
        }

        .entry-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          border: 1px solid rgba(201,169,110,.45);
          border-radius: 999px;
          background: transparent;
          color: #C9A96E;
          font-family: var(--font-montserrat), sans-serif;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background .25s, border-color .25s, color .25s, transform .2s;
        }
        .entry-btn:hover {
          background: rgba(201,169,110,.1);
          border-color: rgba(201,169,110,.8);
          color: #FAF6EE;
          transform: scale(1.03);
        }
        .entry-btn:active {
          transform: scale(.97);
        }
      `}</style>
    </>
  );
}

'use client';
import { useEffect, useState } from 'react';

const LETTERS = '6IXSTARS'.split('');

export default function EntryScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('6ix-entered')) {
      setVisible(true);
    }
  }, []);

  const enter = () => {
    if (leaving) return;
    sessionStorage.setItem('6ix-entered', '1');

    const a = document.querySelector('audio[data-theme]');
    if (a) {
      a.muted = false;
      a.play().catch(() => {});
    }

    setLeaving(true);
    setTimeout(() => setVisible(false), 900);
  };

  if (!visible) return null;

  return (
    <>
      <div
        className={`ix-entry${leaving ? ' ix-entry--out' : ''}`}
        onClick={enter}
        role="button"
        tabIndex={0}
        aria-label="Entrar al sitio"
        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? enter() : null}
      >
        {/* Línea superior */}
        <div className="ix-line ix-line--top" />

        {/* Contenido */}
        <div className="ix-center">

          {/* Ojo / punto decorativo */}
          <div className="ix-dot" />

          {/* Brand name con stagger por letra */}
          <h1 className="ix-brand" aria-label="6ixstars">
            {LETTERS.map((l, i) => (
              <span
                key={i}
                className="ix-letter"
                style={{ '--d': `${0.4 + i * 0.055}s` }}
              >
                {l}
              </span>
            ))}
          </h1>

          {/* Tagline */}
          <p className="ix-tag">Streetwear · Colombia</p>

          {/* Hint interacción */}
          <div className="ix-hint">
            <span className="ix-hint-dot" />
            <span>toca para entrar</span>
          </div>

        </div>

        {/* Línea inferior */}
        <div className="ix-line ix-line--bot" />

      </div>

      <style>{`
        /* ── Overlay ─────────────────────────────── */
        .ix-entry {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #080604;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          animation: ix-fade-in .4s ease forwards;
          overflow: hidden;
        }
        .ix-entry--out {
          animation: ix-fade-out .9s cubic-bezier(.4,0,.2,1) forwards !important;
        }
        @keyframes ix-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ix-fade-out {
          0%   { opacity: 1; transform: scale(1); filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.06); filter: blur(6px); }
        }

        /* ── Líneas horizontales ─────────────────── */
        .ix-line {
          position: absolute;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,169,110,.6), transparent);
          animation: ix-line-in .9s .1s cubic-bezier(.4,0,.2,1) forwards;
        }
        .ix-line--top { top: 80px; }
        .ix-line--bot { bottom: 80px; }
        @keyframes ix-line-in {
          to { width: 100%; }
        }

        /* ── Centro ──────────────────────────────── */
        .ix-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          text-align: center;
          padding: 0 24px;
        }

        /* ── Punto decorativo ────────────────────── */
        .ix-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C9A96E;
          margin-bottom: 28px;
          opacity: 0;
          animation: ix-el-in .4s .3s ease forwards;
        }

        /* ── Brand ───────────────────────────────── */
        .ix-brand {
          font-family: var(--font-anton), 'Anton', sans-serif;
          font-size: clamp(3.8rem, 14vw, 9rem);
          font-weight: 400;
          color: #F5EFE3;
          letter-spacing: .06em;
          line-height: 1;
          margin: 0 0 16px;
          display: flex;
          gap: .01em;
        }

        .ix-letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(28px) skewX(-4deg);
          animation: ix-letter-in .55s var(--d) cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes ix-letter-in {
          to { opacity: 1; transform: translateY(0) skewX(0deg); }
        }

        /* ── Tagline ─────────────────────────────── */
        .ix-tag {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .65rem;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: rgba(201,169,110,.55);
          margin: 0 0 52px;
          opacity: 0;
          animation: ix-el-in .5s 1.1s ease forwards;
        }

        /* ── Hint ────────────────────────────────── */
        .ix-hint {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-montserrat), sans-serif;
          font-size: .6rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: rgba(250,246,238,.25);
          opacity: 0;
          animation: ix-el-in .5s 1.6s ease forwards;
        }
        .ix-hint-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(201,169,110,.5);
          animation: ix-pulse 1.8s 1.6s ease-in-out infinite;
        }
        @keyframes ix-pulse {
          0%, 100% { opacity: .4; transform: scale(1); }
          50%       { opacity: 1;  transform: scale(1.4); }
        }

        /* ── Utilidad ────────────────────────────── */
        @keyframes ix-el-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .ix-line--top { top: 52px; }
          .ix-line--bot { bottom: 52px; }
        }
      `}</style>
    </>
  );
}

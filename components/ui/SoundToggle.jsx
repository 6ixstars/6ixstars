'use client';
import { useEffect, useRef, useState } from 'react';

export default function SoundToggle() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;

    const optedOut = localStorage.getItem('6ix-sound') === 'off';
    if (optedOut) { setReady(true); return; }

    // Esperar a que el audio arranque muted (vía atributo autoPlay+muted del HTML)
    // y luego desmutear. Si no arrancó solo, desmutear en primer gesto.
    const tryUnmute = () => {
      a.muted = false;
      if (!a.paused) {
        setPlaying(true);
        return;
      }
      a.play().then(() => setPlaying(true)).catch(() => {});
    };

    // Intentar desmutear después de un tick (el navegador necesita un frame)
    const t = setTimeout(tryUnmute, 300);

    // Fallback: primer clic o toque en cualquier parte
    const onGesture = () => {
      a.muted = false;
      a.play().then(() => setPlaying(true)).catch(() => {});
    };
    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('touchstart', onGesture, { once: true, passive: true });

    setReady(true);

    return () => {
      clearTimeout(t);
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      localStorage.setItem('6ix-sound', 'off');
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
      localStorage.setItem('6ix-sound', 'on');
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/theme.mp3" loop preload="auto" autoPlay muted playsInline />

      <button
        type="button"
        onClick={toggle}
        className={`snd-btn${playing ? ' snd-btn--on' : ''}`}
        aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        aria-pressed={playing}
        title={playing ? 'Pausar música' : 'Reproducir música'}
      >
        {/* Icono */}
        <span className="snd-ico">
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" rx="1.5" />
              <rect x="14" y="4" width="5" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4.5v15a1 1 0 0 0 1.54.84l11-7.5a1 1 0 0 0 0-1.68l-11-7.5A1 1 0 0 0 7 4.5z" />
            </svg>
          )}
        </span>

        {/* Barras EQ animadas */}
        <span className="snd-eq" aria-hidden="true">
          <i /><i /><i /><i />
        </span>

        {/* Label */}
        <span className="snd-label">{playing ? 'SONANDO' : 'MUSIC'}</span>
      </button>

      <style>{`
        .snd-btn {
          position: fixed;
          right: 24px;
          bottom: 88px;
          z-index: 200;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding: 0 14px 0 10px;
          background: rgba(10, 9, 7, 0.80);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(201, 169, 110, 0.20);
          border-radius: 999px;
          color: rgba(243, 234, 215, 0.70);
          cursor: pointer;
          transition: border-color .25s, color .25s, transform .2s, box-shadow .25s;
          box-shadow: 0 4px 20px rgba(0,0,0,.35);
          font-family: inherit;
        }
        .snd-btn:hover {
          border-color: rgba(201, 169, 110, 0.55);
          color: #C9A96E;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,.45);
        }
        .snd-btn--on {
          border-color: rgba(201, 169, 110, 0.45);
          color: #C9A96E;
        }

        /* Círculo del icono */
        .snd-ico {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(201, 169, 110, 0.12);
          border: 1px solid rgba(201, 169, 110, 0.25);
          flex-shrink: 0;
          transition: background .25s, border-color .25s;
        }
        .snd-btn:hover .snd-ico,
        .snd-btn--on .snd-ico {
          background: rgba(201, 169, 110, 0.20);
          border-color: rgba(201, 169, 110, 0.5);
        }

        /* Label */
        .snd-label {
          font-size: .58rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-weight: 600;
          transition: color .25s;
        }

        /* Barras EQ */
        .snd-eq {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 14px;
        }
        .snd-eq i {
          display: block;
          width: 2.5px;
          height: 4px;
          background: currentColor;
          border-radius: 1px;
          transform-origin: bottom;
          opacity: 0.4;
          transition: opacity .25s;
        }
        .snd-btn--on .snd-eq i {
          animation: snd-eq .9s ease-in-out infinite;
          opacity: 1;
        }
        .snd-btn--on .snd-eq i:nth-child(2) { animation-delay: .15s; }
        .snd-btn--on .snd-eq i:nth-child(3) { animation-delay: .30s; }
        .snd-btn--on .snd-eq i:nth-child(4) { animation-delay: .45s; }

        @keyframes snd-eq {
          0%, 100% { transform: scaleY(.35); }
          50%       { transform: scaleY(2.8); }
        }

        @media (max-width: 640px) {
          .snd-btn {
            right: 16px;
            bottom: 90px;
          }
          .snd-label { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .snd-btn--on .snd-eq i { animation: none; }
        }
      `}</style>
    </>
  );
}

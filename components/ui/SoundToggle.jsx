'use client';
import { useEffect, useRef, useState } from 'react';

// Música de fondo con botón PLAY/PAUSA.
// Intenta reproducir al cargar (los navegadores suelen bloquear el autoplay
// con sonido sin gesto; por eso también arranca en el primer clic/tecla).
// Recuerda la preferencia en localStorage. Volumen .4. Loop.
// Pon tu canción en: public/audio/theme.mp3
export default function SoundToggle() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.4;
    const optedOut = typeof window !== 'undefined' && localStorage.getItem('6ix-sound') === 'off';
    if (optedOut) return;

    const start = () => { a.play().then(() => setPlaying(true)).catch(() => {}); };
    // 1) intento inmediato al cargar
    start();
    // 2) fallback: primer gesto del usuario
    const onGesture = () => {
      a.play().then(() => setPlaying(true)).catch(() => {});
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('keydown', onGesture, { once: true });
    window.addEventListener('touchstart', onGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause(); setPlaying(false); localStorage.setItem('6ix-sound', 'off');
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {}); localStorage.setItem('6ix-sound', 'on');
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/theme.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className={`sound-toggle ${playing ? 'is-playing' : ''}`}
        aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        aria-pressed={playing}
        data-cursor="hover"
        title={playing ? 'Pausar música' : 'Reproducir música'}
      >
        <span className="sound-ico" aria-hidden="true">
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.54.84l11-7.5a1 1 0 0 0 0-1.68l-11-7.5A1 1 0 0 0 7 4.5z" /></svg>
          )}
        </span>
        <span className="sound-eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="sound-label">{playing ? 'SONANDO' : 'PLAY'}</span>

        <style>{`
          .sound-toggle {
            position: fixed; left: 24px; bottom: 24px; z-index: 90;
            display: inline-flex; align-items: center; gap: 10px;
            height: 48px; padding: 0 16px;
            background: rgba(11,11,12,.72); backdrop-filter: blur(10px);
            border: 1px solid var(--dark-4); border-radius: 999px;
            color: var(--white); cursor: pointer;
            transition: border-color .25s, background .25s, transform .25s;
          }
          .sound-toggle:hover { border-color: var(--gold); transform: translateY(-2px); }
          .sound-toggle.is-playing { border-color: var(--gold); }
          .sound-ico { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--gold); color: #0B0B0C; flex-shrink: 0; }
          .sound-label { font-family: var(--font-tech, monospace); font-size: .58rem; letter-spacing: .2em; color: var(--gray-light); }
          .sound-toggle.is-playing .sound-label { color: var(--gold); }
          .sound-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 16px; }
          .sound-eq i { width: 3px; height: 5px; background: var(--gold); border-radius: 1px; transform-origin: bottom; opacity: .5; }
          .sound-toggle.is-playing .sound-eq i { animation: sx6-eq .9s ease-in-out infinite; opacity: 1; }
          .sound-toggle.is-playing .sound-eq i:nth-child(2) { animation-delay: .15s; }
          .sound-toggle.is-playing .sound-eq i:nth-child(3) { animation-delay: .3s; }
          .sound-toggle.is-playing .sound-eq i:nth-child(4) { animation-delay: .45s; }
          @keyframes sx6-eq { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(2.6); } }
          @media (max-width: 768px) { .sound-toggle { left: 16px; bottom: 16px; height: 44px; padding: 0 13px; gap: 8px; } .sound-label { display: none; } }
          @media (prefers-reduced-motion: reduce) { .sound-toggle.is-playing .sound-eq i { animation: none; } }
        `}</style>
      </button>
    </>
  );
}

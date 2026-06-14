'use client';
import { useEffect, useRef, useState } from 'react';

// Música de fondo de la tienda.
// Los navegadores BLOQUEAN el autoplay con sonido sin gesto del usuario,
// así que: arranca en el primer clic/tecla (si no la apagó antes) y deja
// un botón flotante con ecualizador para encender/apagar. Recuerda la
// preferencia en localStorage. Volumen bajo (.35) para no invadir.
//
// Pon tu canción en: public/audio/theme.mp3
export default function SoundToggle() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;
    const optedOut = typeof window !== 'undefined' && localStorage.getItem('6ix-sound') === 'off';
    if (optedOut) return;

    const tryPlay = () => {
      a.play().then(() => setPlaying(true)).catch(() => {});
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
    };
    window.addEventListener('pointerdown', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });
    window.addEventListener('touchstart', tryPlay, { once: true });
    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
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
      <audio ref={audioRef} src="/audio/theme.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className={`sound-toggle ${playing ? 'is-playing' : ''}`}
        aria-label={playing ? 'Apagar música' : 'Encender música'}
        aria-pressed={playing}
        data-cursor="hover"
        title={playing ? 'Apagar música' : 'Encender música'}
      >
        <span className="sound-eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="sound-label">{playing ? 'SONIDO' : 'MUTE'}</span>

        <style>{`
          .sound-toggle {
            position: fixed; left: 24px; bottom: 24px; z-index: 90;
            display: inline-flex; align-items: center; gap: 9px;
            height: 46px; padding: 0 16px;
            background: rgba(11,11,12,.7); backdrop-filter: blur(10px);
            border: 1px solid var(--dark-4); border-radius: 999px;
            color: var(--white); cursor: pointer;
            transition: border-color .25s, background .25s, transform .25s;
          }
          .sound-toggle:hover { border-color: var(--gold); transform: translateY(-2px); }
          .sound-toggle.is-playing { border-color: var(--gold); }
          .sound-label { font-family: var(--font-tech, monospace); font-size: .58rem; letter-spacing: .2em; color: var(--gray-light); }
          .sound-toggle.is-playing .sound-label { color: var(--gold); }
          .sound-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 16px; }
          .sound-eq i { width: 3px; height: 5px; background: var(--gold); border-radius: 1px; transform-origin: bottom; }
          .sound-toggle.is-playing .sound-eq i { animation: sx6-eq .9s ease-in-out infinite; }
          .sound-toggle.is-playing .sound-eq i:nth-child(2) { animation-delay: .15s; }
          .sound-toggle.is-playing .sound-eq i:nth-child(3) { animation-delay: .3s; }
          .sound-toggle.is-playing .sound-eq i:nth-child(4) { animation-delay: .45s; }
          @keyframes sx6-eq { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(2.6); } }
          @media (max-width: 768px) { .sound-toggle { left: 16px; bottom: 16px; height: 42px; padding: 0 13px; } }
          @media (prefers-reduced-motion: reduce) { .sound-toggle.is-playing .sound-eq i { animation: none; } }
        `}</style>
      </button>
    </>
  );
}

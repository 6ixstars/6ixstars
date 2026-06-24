'use client';
// Componente de 21st.dev — "Tubelight Navbar" (convertido TSX→JSX, adaptado).
// Indicador activo con pill + lámpara encendida que se desliza entre ítems
// con física de resorte (motion layoutId). Tema rosa del 6ix.
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TubelightNav({ items = [] }) {
  return (
    <nav className="tube-nav" aria-label="Categorías">
      {items.map((item) => (
        <Link key={item.label} href={item.to} className={`tube-link ${item.active ? 'active' : ''}`}>
          <span className="tube-label">{item.label}</span>
          {item.active && (
            <motion.span
              layoutId="tubelamp"
              className="tube-pill"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <span className="tube-lamp" aria-hidden="true" />
            </motion.span>
          )}
        </Link>
      ))}

      <style>{`
        .tube-nav { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .tube-link { position: relative; font-family: var(--font-sans); font-size: .74rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--gray-light); padding: 9px 16px; border-radius: 999px; transition: color .25s; white-space: nowrap; }
        .tube-link:hover { color: var(--white); }
        .tube-link.active { color: var(--gold); }
        .tube-label { position: relative; z-index: 1; }
        .tube-pill { position: absolute; inset: 0; z-index: 0; background: rgba(255,46,126,.10); border-radius: 999px; }
        .tube-lamp { position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%); width: 58%; height: 3px; background: var(--gold); border-radius: 999px;
          box-shadow: 0 0 12px 2px rgba(255,46,126,.75), 0 0 26px 5px rgba(255,46,126,.45), 0 0 40px 8px rgba(255,46,126,.2); }
        @media (max-width: 1200px) { .tube-link { font-size: .7rem; letter-spacing: .05em; padding: 9px 12px; } }
      `}</style>
    </nav>
  );
}

'use client';

const ITEMS = [
  'ENVÍO A TODA COLOMBIA',
  'NUEVOS INGRESOS',
  'PAGO SEGURO CON WOMPI',
  '10% OFF EN TU PRIMERA COMPRA',
];

// Duplicamos 2 veces para el loop seamless (marquee usa translateX(-50%))
const TRACK = [...ITEMS, ...ITEMS];

export default function AnnouncementBar() {
  return (
    <div className="sb-announce">
      <div className="marquee-track" style={{ animationDuration: '22s' }}>
        {TRACK.map((t, i) => (
          <span key={i} className="sb-announce-item">
            {t}
            <span className="sb-announce-dot" aria-hidden="true">★</span>
          </span>
        ))}
      </div>

      <style>{`
        .sb-announce {
          background: #060607;
          color: var(--white);
          padding: 9px 0;
          font-size: .68rem;
          letter-spacing: .26em;
          text-transform: uppercase;
          font-weight: 700;
          overflow: hidden;
          position: relative;
          z-index: 60;
          font-family: var(--font-sans);
          border-bottom: 1px solid var(--dark-4);
        }
        .sb-announce-item {
          display: inline-flex;
          align-items: center;
          gap: clamp(32px, 5vw, 56px);
          padding: 0 clamp(16px, 2.5vw, 28px);
          white-space: nowrap;
        }
        .sb-announce-dot {
          color: var(--gold);
          font-size: .8em;
          line-height: 1;
        }
        @media (max-width: 480px) {
          .sb-announce { font-size: .6rem; letter-spacing: .18em; padding: 7px 0; }
        }
      `}</style>
    </div>
  );
}

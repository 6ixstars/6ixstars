'use client';

const ITEMS = [
  'ENVÍO A TODA COLOMBIA',
  'NUEVOS INGRESOS',
  'PAGO SEGURO CON WOMPI',
  '10% OFF EN TU PRIMERA COMPRA',
];

export default function AnnouncementBar() {
  return (
    <div className="sb-announce">
      <div className="sb-announce-track">
        {[...Array(3)].map((_, dup) => (
          ITEMS.map((t, i) => (
            <span key={`${dup}-${i}`} className="sb-announce-item">
              {t}
              <span className="sb-announce-dot" aria-hidden="true">★</span>
            </span>
          ))
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
          position: sticky;
          top: 0;
          z-index: 60;
          font-family: var(--font-sans);
          border-bottom: 1px solid var(--dark-4);
        }
        .sb-announce-track {
          display: flex;
          gap: clamp(24px, 5vw, 48px);
          white-space: nowrap;
          animation: sb-announce-scroll 40s linear infinite;
          width: max-content;
        }
        .sb-announce-item {
          display: inline-flex;
          align-items: center;
          gap: clamp(24px, 5vw, 48px);
        }
        .sb-announce-dot {
          color: var(--gold);
          font-size: .8em;
          line-height: 1;
        }
        @media (max-width: 480px) {
          .sb-announce {
            font-size: .6rem;
            letter-spacing: .18em;
            padding: 7px 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-announce-track { animation: none; }
        }
        @keyframes sb-announce-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

const ITEMS = [
  'ENVÍO A TODA COLOMBIA',
  'NUEVOS INGRESOS',
  'PAGO SEGURO CON WOMPI',
  '10% OFF EN TU PRIMERA COMPRA',
];

const TRACK = [...ITEMS, ...ITEMS];

export default function AnnouncementBar() {
  return (
    <div className="sb-announce">
      <div className="sb-announce-track">
        {TRACK.map((t, i) => (
          <span key={i} className="sb-announce-item">
            {t}
            <span className="sb-announce-dot" aria-hidden="true">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

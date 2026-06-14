'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

// Carrusel 3D interactivo (estilo Nike): las piezas del drop se disponen en
// un anillo 3D. Se arrastra para girar, hay flechas, y auto-rota. La pieza
// del frente se resalta. CSS 3D puro (transform-style: preserve-3d).
export default function Drop3D({ items = [] }) {
  const N = items.length || 1;
  const theta = 360 / N;
  const radius = 380;
  const [angle, setAngle] = useState(0);
  const drag = useRef(null);
  const hover = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!drag.current && !hover.current) setAngle(a => a - theta);
    }, 3800);
    return () => clearInterval(id);
  }, [theta]);

  const onDown = (e) => {
    drag.current = { x: e.clientX, a: angle };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e) => { if (drag.current) setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.4); };
  const onUp = () => { if (drag.current) { setAngle(a => Math.round(a / theta) * theta); drag.current = null; } };

  const active = (((Math.round(-angle / theta)) % N) + N) % N;
  const activeItem = items[active] || {};

  return (
    <div className="d3" onMouseEnter={() => (hover.current = true)} onMouseLeave={() => { hover.current = false; onUp(); }}>
      <div className="d3-stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="d3-ring" style={{ transform: `translateZ(-${radius}px) rotateY(${angle}deg)` }}>
          {items.map((it, i) => (
            <div key={it.slug || i} className={`d3-card ${i === active ? 'on' : ''}`}
              style={{ transform: `rotateY(${i * theta}deg) translateZ(${radius}px)` }}>
              <div className="d3-card-img">
                <img src={it.img} alt={it.name} draggable="false" />
                <span className="d3-card-tag">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="d3-card-info">
                <span className="d3-card-name">{it.name}</span>
                <span className="d3-card-price">{it.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d3-bar">
        <button onClick={() => setAngle(a => a + theta)} aria-label="Anterior" data-cursor="hover"><ChevronLeft size={18} /></button>
        <span className="d3-counter">{String(active + 1).padStart(2, '0')} <i>/</i> {String(N).padStart(2, '0')}</span>
        <button onClick={() => setAngle(a => a - theta)} aria-label="Siguiente" data-cursor="hover"><ChevronRight size={18} /></button>
        {activeItem.slug && (
          <Link href={`/producto/${activeItem.slug}`} className="d3-shop" data-cursor="hover">
            VER PIEZA <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <p className="d3-hint">↤ ARRASTRA PARA GIRAR ↦</p>

      <style>{`
        .d3 { user-select: none; }
        .d3-stage { perspective: 1400px; height: clamp(380px, 48vw, 520px); display: flex; align-items: center; justify-content: center; cursor: grab; touch-action: pan-y; }
        .d3-stage:active { cursor: grabbing; }
        .d3-ring { position: relative; width: clamp(220px, 26vw, 300px); height: clamp(320px, 38vw, 420px); transform-style: preserve-3d; transition: transform .65s cubic-bezier(.16,1,.3,1); }
        .d3-card { position: absolute; inset: 0; backface-visibility: hidden; opacity: .4; transition: opacity .5s; }
        .d3-card.on { opacity: 1; }
        .d3-card-img { position: relative; width: 100%; height: 78%; overflow: hidden; border: 1px solid var(--dark-4); background: #141416; }
        .d3-card.on .d3-card-img { border-color: var(--gold); box-shadow: 0 30px 70px rgba(0,0,0,.6), 0 0 0 1px var(--gold); }
        .d3-card-img img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
        .d3-card-tag { position: absolute; top: 10px; left: 10px; font-family: var(--font-tech, monospace); font-size: .6rem; letter-spacing: .12em; color: #fff; background: rgba(11,11,12,.6); padding: 3px 7px; }
        .d3-card-info { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 12px 2px 0; }
        .d3-card-name { font-family: var(--font-sans); font-weight: 800; font-size: .82rem; color: var(--white); text-transform: uppercase; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .d3-card-price { font-family: var(--font-display); font-size: 1.05rem; color: var(--gold); flex-shrink: 0; }

        .d3-bar { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 18px; flex-wrap: wrap; }
        .d3-bar button { width: 46px; height: 46px; border: 1px solid var(--dark-4); background: transparent; color: var(--white); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
        .d3-bar button:hover { border-color: var(--gold); color: var(--gold); }
        .d3-counter { font-family: var(--font-display); font-size: 1.4rem; color: var(--white); min-width: 92px; text-align: center; }
        .d3-counter i { color: var(--gray); font-style: normal; margin: 0 4px; }
        .d3-shop { display: inline-flex; align-items: center; gap: 7px; padding: 13px 18px; background: var(--gold); color: #0B0B0C; font-weight: 800; font-size: .74rem; letter-spacing: .1em; text-transform: uppercase; transition: gap .2s, background .2s; }
        .d3-shop:hover { background: #fff; gap: 11px; }
        .d3-hint { text-align: center; margin-top: 14px; font-family: var(--font-tech, monospace); font-size: .6rem; letter-spacing: .25em; color: var(--gray); }
        @media (max-width: 640px) { .d3-shop { width: 100%; justify-content: center; order: 3; margin-top: 6px; } }
      `}</style>
    </div>
  );
}

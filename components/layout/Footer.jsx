'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MapPin, ChevronDown } from 'lucide-react';
import { collections } from '@/lib/products-constants';

const SvgIG = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const SvgTT = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.15a4.85 4.85 0 0 1-1-.46z" /></svg>;

const COLS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Toda la tienda', to: '/tienda' },
      { label: 'Nuevos Drops', to: '/tienda?sort=nuevo' },
      { label: 'Más Vendidos', to: '/tienda?sort=bestseller' },
      { label: 'Hombre', to: '/tienda?gender=hombre' },
      { label: 'Mujer', to: '/tienda?gender=mujer' },
    ],
  },
  {
    title: 'Categorías',
    links: collections.map(c => ({ label: c.name, to: `/tienda?cat=${c.id}` })),
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Contacto', to: '/contacto' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Envíos', to: '/faq' },
      { label: 'Devoluciones', to: '/devoluciones' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
];

const SOCIAL = [
  { Icon: SvgIG, label: 'Instagram', href: 'https://www.instagram.com/6ixstars/' },
  { Icon: SvgTT, label: 'TikTok', href: 'https://www.tiktok.com/@6ixstars' },
];

function FooterCol({ title, links, openCol, setOpenCol }) {
  const isOpen = openCol === title;
  return (
    <div className={`sb-footer-col ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="sb-footer-col-toggle"
        onClick={() => setOpenCol(isOpen ? null : title)}
        aria-expanded={isOpen}
      >
        <h4>{title}</h4>
        <ChevronDown size={16} className="sb-footer-col-chev" />
      </button>
      <ul>
        {links.map(l => (
          <li key={l.label}><Link href={l.to}>{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [openCol, setOpenCol] = useState(null);

  return (
    <footer className="sb-footer">
      <div className="container sb-footer-inner">
        <div className="sb-footer-top">
          <div className="sb-footer-brand">
            <Link href="/" className="sb-footer-logo-link" aria-label="6ixstars inicio">
              <img
                src="/img/logo.png"
                alt="6ixstars"
                className="sb-footer-logo-img"
                width={200}
                height={52}
                loading="lazy"
              />
            </Link>
            <p>
              Streetwear desde el 6ix. Telas pesadas, fits reales y drops limitados
              para los que marcan la diferencia en la calle.
            </p>
            <div className="sb-footer-social">
              {SOCIAL.map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {COLS.map(col => (
            <FooterCol key={col.title} {...col} openCol={openCol} setOpenCol={setOpenCol} />
          ))}
        </div>

        <div className="sb-footer-bottom">
          <p>© {new Date().getFullYear()} 6ixstars · Todos los derechos reservados</p>
          <p className="sb-footer-loc">
            <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Colombia · Hecho con <span style={{ color: 'var(--gold)' }}>★</span>
          </p>
        </div>
      </div>

      <style>{`
        .sb-footer {
          background: var(--bg-deep);
          color: var(--gray);
          padding: 90px 0 36px;
          font-family: var(--font-sans);
          font-size: .88rem;
          line-height: 1.6;
          border-top: 1px solid var(--dark-4);
        }
        .sb-footer-inner { padding-left: 24px; padding-right: 24px; }
        .sb-footer-top {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 56px;
          padding-bottom: 56px;
          border-bottom: 1px solid var(--dark-4);
        }
        .sb-footer-logo-link { display: inline-block; margin-bottom: 20px; }
        .sb-footer-logo-img {
          height: 48px;
          width: auto;
          display: block;
          filter: drop-shadow(0 2px 12px rgba(255,46,126,.25));
        }
        .sb-footer-brand p {
          font-size: .88rem;
          line-height: 1.65;
          max-width: 38ch;
          margin-bottom: 22px;
          color: var(--gray);
        }
        .sb-footer-social { display: flex; gap: 10px; }
        .sb-footer-social a {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1px solid var(--dark-4);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-light);
          transition: all .25s ease;
        }
        .sb-footer-social a:hover {
          background: var(--gold);
          border-color: var(--gold);
          color: #0B0B0C;
          transform: translateY(-2px);
        }

        .sb-footer-col-toggle {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          cursor: default;
        }
        .sb-footer-col-chev { color: var(--gray); transition: transform .25s ease; display: none; }
        .sb-footer-col h4 {
          font-family: var(--font-sans);
          font-size: .72rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--white);
          font-weight: 800;
          margin: 0 0 18px;
        }
        .sb-footer-col ul { list-style: none; margin: 0; padding: 0; }
        .sb-footer-col li { margin-bottom: 10px; }
        .sb-footer-col a {
          font-size: .88rem;
          color: var(--gray);
          transition: color .2s ease, transform .2s ease;
          display: inline-block;
        }
        .sb-footer-col a:hover { color: var(--gold); transform: translateX(4px); }

        .sb-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 28px;
          font-size: .72rem;
          flex-wrap: wrap;
          gap: 14px;
          color: var(--gray);
          letter-spacing: .04em;
        }

        @media (max-width: 1024px) {
          .sb-footer-top { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
          .sb-footer-brand { grid-column: 1 / -1; max-width: 100%; }
          .sb-footer-brand p { max-width: 60ch; }
        }

        @media (max-width: 768px) {
          .sb-footer { padding: 56px 0 28px; text-align: left; }
          .sb-footer-inner { padding-left: 20px; padding-right: 20px; }
          .sb-footer-top { grid-template-columns: 1fr; gap: 0; padding-bottom: 24px; }
          .sb-footer-brand {
            text-align: center;
            padding-bottom: 28px;
            margin-bottom: 8px;
            border-bottom: 1px solid var(--dark-4);
          }
          .sb-footer-logo-link { display: flex; justify-content: center; margin-bottom: 16px; }
          .sb-footer-logo-img { height: 44px; }
          .sb-footer-brand p { max-width: 38ch; margin: 0 auto 18px; font-size: .85rem; }
          .sb-footer-social { justify-content: center; gap: 12px; }
          .sb-footer-social a { width: 42px; height: 42px; }

          .sb-footer-col { border-bottom: 1px solid var(--dark-4); }
          .sb-footer-col-toggle { cursor: pointer; padding: 16px 0; min-height: 44px; }
          .sb-footer-col-chev { display: block; }
          .sb-footer-col.is-open .sb-footer-col-chev { transform: rotate(180deg); color: var(--gold); }
          .sb-footer-col h4 { margin: 0; font-size: .78rem; }
          .sb-footer-col.is-open h4 { color: var(--gold); }
          .sb-footer-col ul { max-height: 0; overflow: hidden; transition: max-height .3s ease, padding .3s ease; }
          .sb-footer-col.is-open ul { max-height: 500px; padding-bottom: 16px; }
          .sb-footer-col li { margin-bottom: 14px; }
          .sb-footer-col li:last-child { margin-bottom: 0; }
          .sb-footer-col a { font-size: .9rem; display: block; padding: 2px 0; transform: none; }
          .sb-footer-col a:hover { transform: translateX(6px); }

          .sb-footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
            padding-top: 22px;
            margin-top: 12px;
          }
        }
      `}</style>
    </footer>
  );
}

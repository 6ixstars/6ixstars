'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { productTypes } from '@/lib/products-constants';

/**
 * Form GET para buscar/filtrar productos. Cliente porque necesita botón
 * "Limpiar" que resetea los filtros sin recargar manualmente.
 */
export default function ProductsSearchForm({ defaultQ, defaultType, defaultBrand, brands }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ || '');
  const [type, setType] = useState(defaultType || '');
  const [brand, setBrand] = useState(defaultBrand || '');

  function onSubmit(e) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (type) sp.set('type', type);
    if (brand) sp.set('brand', brand);
    const qs = sp.toString();
    router.push(`/admin/products${qs ? '?' + qs : ''}`);
  }

  function onClear() {
    setQ('');
    setType('');
    setBrand('');
    router.push('/admin/products');
  }

  const hasFilters = q || type || brand;

  return (
    <form onSubmit={onSubmit} className="psf" role="search">
      <div className="psf-field psf-field--grow">
        <label htmlFor="psf-q">Buscar</label>
        <input
          id="psf-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, marca o slug…"
        />
      </div>

      <div className="psf-field">
        <label htmlFor="psf-type">Género</label>
        <select id="psf-type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos</option>
          {productTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="psf-field">
        <label htmlFor="psf-brand">Marca</label>
        <select id="psf-brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Todas</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="psf-actions">
        <button type="submit" className="psf-btn psf-btn--primary">Filtrar</button>
        {hasFilters && (
          <button type="button" onClick={onClear} className="psf-btn psf-btn--ghost">
            Limpiar
          </button>
        )}
      </div>

      <style jsx>{`
        .psf {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 0.75rem;
          padding: 1rem 1.1rem;
          background: var(--dark-2);
          border: 1px solid var(--dark-4);
          border-radius: 14px;
          margin-bottom: 1.25rem;
          align-items: end;
          font-family: var(--font-montserrat), system-ui, sans-serif;
        }
        @media (max-width: 720px) {
          .psf { grid-template-columns: 1fr 1fr; }
          .psf-field--grow { grid-column: 1 / -1; }
          .psf-actions { grid-column: 1 / -1; }
        }
        .psf-field {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
        }
        .psf-field label {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gray);
        }
        .psf-field input,
        .psf-field select {
          width: 100%;
          padding: 0.55rem 0.75rem;
          background: var(--dark);
          border: 1px solid var(--dark-4);
          border-radius: 8px;
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--white);
          font-family: inherit;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .psf-field input::placeholder { color: var(--gray); }
        .psf-field input:focus,
        .psf-field select:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(238, 177, 195, 0.15);
        }
        .psf-actions {
          display: flex;
          gap: 0.5rem;
        }
        .psf-btn {
          padding: 0.6rem 1.1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          letter-spacing: 0.03em;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .psf-btn--primary {
          background: var(--gold);
          color: #0B0B0C;
        }
        .psf-btn--primary:hover {
          background: var(--gold-dark);
          color: #fff;
        }
        .psf-btn--ghost {
          background: transparent;
          color: var(--gray-light);
          border-color: var(--dark-4);
        }
        .psf-btn--ghost:hover {
          background: var(--dark);
          color: var(--white);
          border-color: var(--gray);
        }
      `}</style>
    </form>
  );
}

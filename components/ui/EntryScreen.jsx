'use client';
import { useEffect, useState } from 'react';

const PROMO_CODE = 'PRIMERA10';

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('6ix-promo-seen')) {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    if (leaving) return;
    sessionStorage.setItem('6ix-promo-seen', '1');
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      sessionStorage.setItem('6ix-promo-seen', '1');
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay de fondo */}
      <div className={`pp-overlay${leaving ? ' pp-overlay--out' : ''}`} onClick={dismiss} />

      {/* Card */}
      <div className={`pp-card${leaving ? ' pp-card--out' : ''}`} role="dialog" aria-modal="true" aria-label="Oferta de bienvenida">

        {/* Cerrar */}
        <button className="pp-close" onClick={dismiss} aria-label="Cerrar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Banda lateral dorada */}
        <div className="pp-side" aria-hidden="true">
          <span className="pp-side-text">6IXSTARS</span>
        </div>

        {/* Contenido */}
        <div className="pp-body">

          <p className="pp-eyebrow">Oferta de bienvenida</p>

          <div className="pp-offer">
            <span className="pp-pct">10<span className="pp-sym">%</span></span>
            <span className="pp-off">OFF</span>
          </div>

          <p className="pp-desc">en tu primera compra</p>

          {!sent ? (
            <>
              <p className="pp-sub">Suscríbete y recibe tu código al instante</p>

              <form className="pp-form" onSubmit={handleSubmit}>
                <input
                  className="pp-input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-label="Correo electrónico"
                />
                <button className="pp-btn" type="submit" disabled={loading}>
                  {loading ? '…' : 'OBTENER CÓDIGO'}
                </button>
              </form>

              <button className="pp-skip" onClick={dismiss}>No, gracias</button>
            </>
          ) : (
            <>
              <p className="pp-sub">¡Listo! Usa este código al pagar:</p>
              <button className="pp-code" onClick={copyCode} title="Copiar código">
                <span>{PROMO_CODE}</span>
                <span className="pp-copy-ico">
                  {copied ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  )}
                </span>
              </button>
              <p className="pp-legal">{copied ? '¡Copiado!' : 'Toca el código para copiarlo'}</p>
              <a href="/tienda" className="pp-btn pp-btn--link" onClick={dismiss}>IR A LA TIENDA</a>
            </>
          )}

          <p className="pp-terms">*Válido para nuevos clientes · No acumulable</p>

        </div>
      </div>

      <style>{`
        .pp-overlay {
          position: fixed;
          inset: 0;
          z-index: 8998;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(2px);
          animation: pp-fade-in .35s ease forwards;
        }
        .pp-overlay--out { animation: pp-fade-out .4s ease forwards !important; }

        @keyframes pp-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pp-fade-out { from { opacity: 1; } to { opacity: 0; } }

        /* ── Card ── */
        .pp-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 8999;
          display: flex;
          width: min(440px, calc(100vw - 32px));
          background: #0E0B08;
          border: 1px solid rgba(201,169,110,.25);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(201,169,110,.06) inset;
          animation: pp-card-in .45s cubic-bezier(.22,1,.36,1) forwards;
        }
        .pp-card--out { animation: pp-card-out .4s cubic-bezier(.4,0,.2,1) forwards !important; }
        @keyframes pp-card-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)) scale(.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pp-card-out {
          to { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) scale(.97); }
        }

        /* ── Banda lateral ── */
        .pp-side {
          width: 44px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #C9A96E 0%, #8A6936 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pp-side-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          font-family: var(--font-montserrat), sans-serif;
          font-size: .55rem;
          font-weight: 700;
          letter-spacing: .28em;
          color: #0E0B08;
        }

        /* ── Body ── */
        .pp-body {
          flex: 1;
          padding: 28px 24px 22px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }

        .pp-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(250,246,238,.06);
          border: none;
          color: rgba(250,246,238,.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .2s, color .2s;
        }
        .pp-close:hover { background: rgba(250,246,238,.12); color: #F5EFE3; }

        .pp-eyebrow {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .6rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: #C9A96E;
          margin: 0 0 10px;
          font-weight: 600;
        }

        .pp-offer {
          display: flex;
          align-items: baseline;
          gap: 4px;
          line-height: 1;
          margin-bottom: 2px;
        }
        .pp-pct {
          font-family: var(--font-anton), 'Anton', sans-serif;
          font-size: 5.5rem;
          color: #C9A96E;
          line-height: 1;
        }
        .pp-sym {
          font-size: 3rem;
        }
        .pp-off {
          font-family: var(--font-anton), 'Anton', sans-serif;
          font-size: 2rem;
          color: rgba(201,169,110,.5);
          letter-spacing: .08em;
          align-self: flex-end;
          padding-bottom: 10px;
        }

        .pp-desc {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .8rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(250,246,238,.7);
          margin: 0 0 16px;
          font-weight: 500;
        }

        .pp-sub {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .72rem;
          color: rgba(250,246,238,.45);
          margin: 0 0 14px;
          line-height: 1.5;
        }

        /* ── Form ── */
        .pp-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-bottom: 10px;
        }
        .pp-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(250,246,238,.05);
          border: 1px solid rgba(201,169,110,.2);
          border-radius: 10px;
          color: #F5EFE3;
          font-family: var(--font-montserrat), sans-serif;
          font-size: .82rem;
          outline: none;
          transition: border-color .2s;
          box-sizing: border-box;
        }
        .pp-input::placeholder { color: rgba(250,246,238,.25); }
        .pp-input:focus { border-color: rgba(201,169,110,.55); }

        .pp-btn {
          width: 100%;
          padding: 12px;
          background: #C9A96E;
          border: none;
          border-radius: 10px;
          color: #0E0B08;
          font-family: var(--font-montserrat), sans-serif;
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .18em;
          cursor: pointer;
          transition: background .2s, transform .15s;
          text-decoration: none;
          text-align: center;
          display: block;
        }
        .pp-btn:hover { background: #D4B47A; transform: translateY(-1px); }
        .pp-btn:disabled { opacity: .6; cursor: not-allowed; }
        .pp-btn--link { margin-top: 12px; }

        .pp-skip {
          background: none;
          border: none;
          color: rgba(250,246,238,.25);
          font-family: var(--font-montserrat), sans-serif;
          font-size: .65rem;
          cursor: pointer;
          padding: 4px 0;
          letter-spacing: .06em;
          transition: color .2s;
        }
        .pp-skip:hover { color: rgba(250,246,238,.5); }

        /* ── Código ── */
        .pp-code {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: rgba(201,169,110,.1);
          border: 1px dashed rgba(201,169,110,.4);
          border-radius: 10px;
          color: #C9A96E;
          font-family: var(--font-montserrat), sans-serif;
          font-size: .95rem;
          font-weight: 700;
          letter-spacing: .2em;
          cursor: pointer;
          transition: background .2s;
          margin-bottom: 6px;
        }
        .pp-code:hover { background: rgba(201,169,110,.16); }
        .pp-copy-ico { opacity: .7; }

        .pp-legal {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .6rem;
          color: rgba(250,246,238,.3);
          margin: 0 0 4px;
          letter-spacing: .04em;
        }

        .pp-terms {
          font-family: var(--font-montserrat), sans-serif;
          font-size: .58rem;
          color: rgba(250,246,238,.2);
          margin: 12px 0 0;
          letter-spacing: .03em;
        }
      `}</style>
    </>
  );
}

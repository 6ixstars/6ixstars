'use client';
import { useState, useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { syncOrderAction, syncAllPendingAction } from './_actions';

export function SyncOrderButton({ orderId }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState(null);

  const onClick = () => {
    setMsg(null);
    startTransition(async () => {
      const r = await syncOrderAction(orderId);
      setMsg(r);
    });
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={onClick}
        disabled={isPending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          background: 'var(--gold)',
          color: '#0B0B0C',
          border: 0,
          borderRadius: 6,
          fontSize: '.82rem',
          fontWeight: 700,
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <RefreshCw size={13} className={isPending ? 'spin' : ''} />
        {isPending ? 'Sincronizando…' : 'Sincronizar con Bold'}
      </button>
      {msg && (
        <span style={{ fontSize: '.82rem', fontWeight: 600, color: msg.ok ? '#4ADE80' : '#FF4D6A' }}>
          {msg.ok
            ? `${msg.oldStatus} → ${msg.newStatus}`
            : `✗ ${msg.error}`}
        </span>
      )}
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function SyncAllPendingButton() {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState(null);

  const onClick = () => {
    setMsg(null);
    startTransition(async () => {
      const r = await syncAllPendingAction();
      setMsg(r);
    });
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={onClick}
        disabled={isPending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 13px',
          background: 'var(--dark-2)',
          color: 'var(--white)',
          border: '1px solid var(--dark-4)',
          borderRadius: 6,
          fontSize: '.78rem',
          fontWeight: 600,
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <RefreshCw size={13} className={isPending ? 'spin' : ''} />
        {isPending ? 'Sincronizando…' : 'Sincronizar pendientes'}
      </button>
      {msg && (
        <div style={{ fontSize: '.78rem', fontWeight: 500, color: msg.ok ? 'var(--gray-light)' : '#FF4D6A' }}>
          {msg.ok ? (
            <details open>
              <summary style={{ cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>{msg.synced} consultadas</summary>
              <ul style={{ margin: '6px 0 0 0', padding: '0 0 0 16px' }}>
                {msg.results.map((r, i) => (
                  <li key={i} style={{ fontFamily: 'ui-monospace, monospace', fontSize: '.74rem', color: 'var(--gray-light)' }}>
                    <span>{r.ref}</span> → <strong>{r.status}</strong>
                  </li>
                ))}
              </ul>
            </details>
          ) : `✗ ${msg.error}`}
        </div>
      )}
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

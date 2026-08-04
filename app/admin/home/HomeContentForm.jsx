'use client';

import { useRef, useState, useTransition } from 'react';
import { saveHomeSection, resetHomeSection, createHomeUploadTicket } from './_actions';
import { HOME_ICON_NAMES } from '@/lib/home-content-defaults';
import { collections as CATEGORY_LIST } from '@/lib/products-constants';
import { supabase } from '@/lib/supabase';

// ─── Subida de archivos (arrastrar/soltar o click) ─────────────────────────
// No asumimos que quien edita tenga acceso al filesystem del proyecto — todo
// se sube a Supabase Storage y el campo se completa solo con la URL pública.

function FileUploadField({ value, onChange, kind = 'image' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isDrag, setIsDrag] = useState(false);
  const accept = kind === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/avif';

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setError('');
    // El archivo va directo del navegador a Supabase Storage con una signed
    // upload URL — Vercel corta cualquier request de Server Action a ~4.5MB,
    // así que un video nunca puede pasar por nuestro propio servidor.
    const ticket = await createHomeUploadTicket(file.type, file.size);
    if (!ticket.ok) {
      setError(ticket.error || 'Error preparando la subida');
      setBusy(false);
      return;
    }
    if (!supabase) {
      setError('Supabase no está configurado en el navegador');
      setBusy(false);
      return;
    }
    const { error: upErr } = await supabase.storage
      .from(ticket.bucket)
      .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
    if (upErr) setError(upErr.message || 'Error subiendo el archivo');
    else onChange(ticket.publicUrl);
    setBusy(false);
  }

  return (
    <div className="hcf-upload">
      {value && (
        <div className="hcf-upload-preview">
          {kind === 'video'
            ? <video src={value} muted loop autoPlay playsInline />
            : <img src={value} alt="" onError={(e) => { e.currentTarget.style.opacity = 0.3; }} />}
          <button type="button" className="hcf-upload-clear" onClick={() => onChange('')} title="Quitar" aria-label="Quitar">×</button>
        </div>
      )}
      <div
        className={`hcf-upload-drop ${isDrag ? 'is-drag' : ''} ${busy ? 'is-busy' : ''}`}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={(e) => { e.preventDefault(); setIsDrag(false); upload(e.dataTransfer.files?.[0]); }}
      >
        {busy ? 'Subiendo…' : value ? 'Cambiar archivo' : `Subir ${kind === 'video' ? 'video' : 'imagen'} (o arrastrar acá)`}
        <input
          ref={inputRef} type="file" accept={accept} hidden
          onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>
      {error && <span className="hcf-upload-error">{error}</span>}
    </div>
  );
}

// ─── Wrappers compartidos (mismo lenguaje visual que EditProductForm) ──────

function Section({ title, desc, section, data, onSave, saving, msg }) {
  return (
    <section className="hcf-section">
      <div className="hcf-section-head">
        <div>
          <h2>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
        <div className="hcf-section-actions">
          {msg && <span className={`hcf-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.ok ? '✓ Guardado' : `✗ ${msg.error}`}</span>}
          <button type="button" className="hcf-btn hcf-btn-ghost" disabled={saving} onClick={() => onSave(section, null, true)}>
            Restaurar default
          </button>
          <button type="button" className="hcf-btn hcf-btn-primary" disabled={saving} onClick={() => onSave(section, data)}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
      <div className="hcf-section-body">{data && <SectionBody section={section} data={data} />}</div>
    </section>
  );
}

function Field({ label, children, hint, wide }) {
  return (
    <label className={`hcf-field ${wide ? 'wide' : ''}`}>
      <span className="hcf-field-label">{label}</span>
      {children}
      {hint && <span className="hcf-field-hint">{hint}</span>}
    </label>
  );
}

// ─── Editor genérico de arrays de objetos (whysix, shoes, trust, testimonios) ──

function ObjectListEditor({ items, fields, onChange, addLabel = '+ Agregar', emptyItem }) {
  const update = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { ...emptyItem }]);

  return (
    <div className="hcf-list">
      {items.map((item, i) => (
        <div key={i} className="hcf-list-row">
          <div className="hcf-list-row-fields">
            {fields.map((f) => (
              <Field key={f.key} label={f.label} wide={f.wide}>
                {f.type === 'select' ? (
                  <select value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: e.target.value })}>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea rows={2} value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: e.target.value })} placeholder={f.placeholder} />
                ) : f.type === 'number' ? (
                  <input type="number" min={f.min} max={f.max} value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: Number(e.target.value) })} />
                ) : f.type === 'color' ? (
                  <div className="hcf-color-row">
                    <input type="color" value={item[f.key] || '#AF1F3A'} onChange={(e) => update(i, { [f.key]: e.target.value })} />
                    <input type="text" value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: e.target.value })} />
                  </div>
                ) : f.type === 'image' ? (
                  <FileUploadField value={item[f.key] ?? ''} onChange={(url) => update(i, { [f.key]: url })} kind="image" />
                ) : (
                  <input type="text" value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: e.target.value })} placeholder={f.placeholder} />
                )}
              </Field>
            ))}
          </div>
          <button type="button" className="hcf-row-del" onClick={() => remove(i)} aria-label="Eliminar" title="Eliminar">×</button>
        </div>
      ))}
      <button type="button" className="hcf-row-add" onClick={add}>{addLabel}</button>
    </div>
  );
}

// Editor de array de strings simples (palabras del hero, frases del graffiti)
function StringListEditor({ items, onChange, placeholder }) {
  const update = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);
  return (
    <div className="hcf-list">
      {items.map((v, i) => (
        <div key={i} className="hcf-list-row">
          <div className="hcf-list-row-fields">
            <input type="text" value={v} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} />
          </div>
          <button type="button" className="hcf-row-del" onClick={() => remove(i)} disabled={items.length <= 1} aria-label="Eliminar">×</button>
        </div>
      ))}
      <button type="button" className="hcf-row-add" onClick={add}>+ Agregar</button>
    </div>
  );
}

// ─── Cuerpo de cada sección (según su forma) ────────────────────────────────

function SectionBody({ section, data }) {
  // `data` viene con setter adjunto vía closure (ver HomeContentForm) — acá
  // solo se usa data.value/data.set para no repetir la firma en cada caso.
  const { value: v, set } = data;

  if (section === 'hero') {
    return (
      <>
        <Field label="Kicker (arriba del título)"><input value={v.kicker} onChange={(e) => set({ ...v, kicker: e.target.value })} /></Field>
        <div className="hcf-row two">
          <Field label="Prefijo del título" hint='Ej: "EN LA CALLE"'><input value={v.titlePrefix} onChange={(e) => set({ ...v, titlePrefix: e.target.value })} /></Field>
          <Field label="Subtítulo"><input value={v.subtitle} onChange={(e) => set({ ...v, subtitle: e.target.value })} /></Field>
        </div>
        <Field label="Palabras rotativas" hint='La palabra que cambia después del prefijo (ej: "MANDAS", "BRILLAS"...)'>
          <StringListEditor items={v.words} onChange={(words) => set({ ...v, words })} placeholder="PALABRA" />
        </Field>
        <div className="hcf-row two">
          <Field label="Botón principal — texto"><input value={v.ctaPrimaryText} onChange={(e) => set({ ...v, ctaPrimaryText: e.target.value })} /></Field>
          <Field label="Botón principal — link"><input value={v.ctaPrimaryHref} onChange={(e) => set({ ...v, ctaPrimaryHref: e.target.value })} /></Field>
        </div>
        <div className="hcf-row two">
          <Field label="Botón secundario — texto"><input value={v.ctaSecondaryText} onChange={(e) => set({ ...v, ctaSecondaryText: e.target.value })} /></Field>
          <Field label="Botón secundario — link"><input value={v.ctaSecondaryHref} onChange={(e) => set({ ...v, ctaSecondaryHref: e.target.value })} /></Field>
        </div>
        <div className="hcf-row two">
          <Field label="Video 1" hint="Se ve con recorte 'cover' — ideal horizontal.">
            <FileUploadField value={v.video1} onChange={(url) => set({ ...v, video1: url })} kind="video" />
          </Field>
          <Field label="Poster video 1 (imagen mientras carga)">
            <FileUploadField value={v.video1Poster} onChange={(url) => set({ ...v, video1Poster: url })} kind="image" />
          </Field>
        </div>
        <div className="hcf-row two">
          <Field label="Video 2" hint="Se ve completo sin recortar — ideal vertical/celular.">
            <FileUploadField value={v.video2} onChange={(url) => set({ ...v, video2: url })} kind="video" />
          </Field>
          <Field label="Poster video 2">
            <FileUploadField value={v.video2Poster} onChange={(url) => set({ ...v, video2Poster: url })} kind="image" />
          </Field>
        </div>
      </>
    );
  }

  if (section === 'graffiti') {
    return (
      <>
        <Field label="Imagen de fondo">
          <FileUploadField value={v.bgImage} onChange={(url) => set({ ...v, bgImage: url })} kind="image" />
        </Field>
        <Field label="Frases de la banda (se repiten en loop)">
          <StringListEditor items={v.phrases} onChange={(phrases) => set({ ...v, phrases })} placeholder="FRASE EN MAYÚSCULAS" />
        </Field>
      </>
    );
  }

  if (section === 'whysix') {
    return (
      <>
        <div className="hcf-row two">
          <Field label="Tag"><input value={v.tag} onChange={(e) => set({ ...v, tag: e.target.value })} /></Field>
          <Field label="Título de sección"><input value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} /></Field>
        </div>
        <Field label="Tarjetas (3 recomendadas)">
          <ObjectListEditor
            items={v.items}
            onChange={(items) => set({ ...v, items })}
            emptyItem={{ icon: 'Sparkles', tag: '', title: '', text: '' }}
            fields={[
              { key: 'icon', label: 'Ícono', type: 'select', options: HOME_ICON_NAMES },
              { key: 'tag', label: 'Tag chico' },
              { key: 'title', label: 'Título' },
              { key: 'text', label: 'Texto', type: 'textarea', wide: true },
            ]}
          />
        </Field>
      </>
    );
  }

  if (section === 'shoes') {
    return (
      <>
        <div className="hcf-row two">
          <Field label="Tag"><input value={v.tag} onChange={(e) => set({ ...v, tag: e.target.value })} /></Field>
          <Field label="Título de sección"><input value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} /></Field>
        </div>
        <div className="hcf-row two">
          <Field label="Link 'ver todo' — texto"><input value={v.linkText} onChange={(e) => set({ ...v, linkText: e.target.value })} /></Field>
          <Field label="Link 'ver todo' — href"><input value={v.linkHref} onChange={(e) => set({ ...v, linkHref: e.target.value })} /></Field>
        </div>
        <Field label="Tenis / drops (tarjetas 3D)">
          <ObjectListEditor
            items={v.items}
            onChange={(items) => set({ ...v, items })}
            emptyItem={{ name: '', img: '', color: '#AF1F3A', href: '/tienda' }}
            fields={[
              { key: 'name', label: 'Nombre' },
              { key: 'img', label: 'Imagen', type: 'image', wide: true },
              { key: 'color', label: 'Color de acento', type: 'color' },
              { key: 'href', label: 'Link "Comprar"' },
            ]}
          />
        </Field>
      </>
    );
  }

  if (section === 'trust') {
    return (
      <Field label="Íconos de confianza (3 recomendados)">
        <ObjectListEditor
          items={v.items}
          onChange={(items) => set({ ...v, items })}
          emptyItem={{ icon: 'ShieldCheck', title: '', subtitle: '' }}
          fields={[
            { key: 'icon', label: 'Ícono', type: 'select', options: HOME_ICON_NAMES },
            { key: 'title', label: 'Título' },
            { key: 'subtitle', label: 'Subtítulo chico' },
          ]}
        />
      </Field>
    );
  }

  if (section === 'categories') {
    return (
      <>
        <p className="hcf-note">Dejá sin subir para usar la imagen default de cada categoría.</p>
        <div className="hcf-row two">
          {CATEGORY_LIST.map((cat) => (
            <Field key={cat.id} label={cat.name}>
              <FileUploadField
                value={v.images?.[cat.id] || ''}
                onChange={(url) => set({ ...v, images: { ...v.images, [cat.id]: url } })}
                kind="image"
              />
            </Field>
          ))}
        </div>
      </>
    );
  }

  if (section === 'lookbook') {
    return (
      <>
        <div className="hcf-row two">
          <Field label="Tag"><input value={v.tag} onChange={(e) => set({ ...v, tag: e.target.value })} /></Field>
          <Field label="Botón"><input value={v.buttonText} onChange={(e) => set({ ...v, buttonText: e.target.value })} /></Field>
        </div>
        <div className="hcf-row two">
          <Field label="Título"><input value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} /></Field>
          <Field label="Título — parte destacada"><input value={v.titleAccent} onChange={(e) => set({ ...v, titleAccent: e.target.value })} /></Field>
        </div>
        <Field label="Subtítulo" wide><input value={v.subtitle} onChange={(e) => set({ ...v, subtitle: e.target.value })} /></Field>
        <Field label="9 fotos de la galería (en orden, 3×3)">
          <div className="hcf-row three">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="hcf-field">
                <span className="hcf-field-label">Foto {i + 1}</span>
                <FileUploadField
                  value={v.images?.[i] || ''}
                  onChange={(url) => {
                    const next = [...(v.images || [])];
                    next[i] = url;
                    set({ ...v, images: next });
                  }}
                  kind="image"
                />
              </div>
            ))}
          </div>
        </Field>
      </>
    );
  }

  if (section === 'campaign') {
    return (
      <>
        <Field label="Imagen de fondo">
          <FileUploadField value={v.image} onChange={(url) => set({ ...v, image: url })} kind="image" />
        </Field>
        <div className="hcf-row two">
          <Field label="Tag"><input value={v.tag} onChange={(e) => set({ ...v, tag: e.target.value })} /></Field>
          <Field label="Botón — texto"><input value={v.buttonText} onChange={(e) => set({ ...v, buttonText: e.target.value })} /></Field>
        </div>
        <div className="hcf-row two">
          <Field label="Título — línea 1"><input value={v.titleLine1} onChange={(e) => set({ ...v, titleLine1: e.target.value })} /></Field>
          <Field label="Título — línea 2"><input value={v.titleLine2} onChange={(e) => set({ ...v, titleLine2: e.target.value })} /></Field>
        </div>
        <Field label="Botón — link"><input value={v.buttonHref} onChange={(e) => set({ ...v, buttonHref: e.target.value })} /></Field>
      </>
    );
  }

  if (section === 'manifesto') {
    return (
      <>
        <div className="hcf-row two">
          <Field label="Palabra del marquee (fondo)"><input value={v.marqueeWord} onChange={(e) => set({ ...v, marqueeWord: e.target.value })} /></Field>
          <Field label="Tag"><input value={v.tag} onChange={(e) => set({ ...v, tag: e.target.value })} /></Field>
        </div>
        <div className="hcf-row two">
          <Field label="Título — línea 1"><input value={v.titleLine1} onChange={(e) => set({ ...v, titleLine1: e.target.value })} /></Field>
          <Field label="Título — línea 2"><input value={v.titleLine2} onChange={(e) => set({ ...v, titleLine2: e.target.value })} /></Field>
        </div>
        <Field label="Texto" wide><textarea rows={3} value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} /></Field>
      </>
    );
  }

  if (section === 'testimonials') {
    return (
      <Field label="Reseñas">
        <ObjectListEditor
          items={v.items}
          onChange={(items) => set({ ...v, items })}
          emptyItem={{ name: '', location: '', product: '', rating: 5, text: '' }}
          fields={[
            { key: 'name', label: 'Nombre' },
            { key: 'location', label: 'Ciudad' },
            { key: 'product', label: 'Producto' },
            { key: 'rating', label: 'Estrellas', type: 'number', min: 1, max: 5 },
            { key: 'text', label: 'Reseña', type: 'textarea', wide: true },
          ]}
        />
      </Field>
    );
  }

  if (section === 'join') {
    return (
      <>
        <div className="hcf-row two">
          <Field label="Tag"><input value={v.tag} onChange={(e) => set({ ...v, tag: e.target.value })} /></Field>
          <Field label="Título"><input value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} /></Field>
        </div>
        <Field label="Texto" wide><textarea rows={2} value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} /></Field>
      </>
    );
  }

  return null;
}

// ─── Componente principal ───────────────────────────────────────────────────

const SECTIONS = [
  { key: 'hero', title: 'Hero', desc: 'Video de fondo, título rotativo y botones principales.' },
  { key: 'graffiti', title: 'Banda de graffiti', desc: 'Franja con marquee animado, justo debajo del hero.' },
  { key: 'whysix', title: 'Por qué 6ix', desc: 'Las 3 tarjetas de filosofía/marca.' },
  { key: 'shoes', title: 'Tenis / Drops', desc: 'Carrusel 3D de productos destacados.' },
  { key: 'trust', title: 'Barra de confianza', desc: 'Envío, pago seguro, cambios — debajo de tenis.' },
  { key: 'categories', title: 'Categorías', desc: 'Fotos de fondo de cada categoría del grid bento.' },
  { key: 'lookbook', title: 'Galería / Lookbook', desc: 'Grid 3×3 interactivo de looks.' },
  { key: 'campaign', title: 'Banner de campaña', desc: 'Sección grande de imagen + título entre galería y destacados.' },
  { key: 'manifesto', title: 'Manifiesto', desc: 'Banda rosa con el texto de marca.' },
  { key: 'testimonials', title: 'Reseñas', desc: 'Carrusel editorial de testimonios de clientes.' },
  { key: 'join', title: 'Únete al 6ix', desc: 'Sección final de newsletter.' },
];

export default function HomeContentForm({ initialContent }) {
  const [state, setState] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [savingKey, setSavingKey] = useState(null);
  const [messages, setMessages] = useState({});

  const handleSave = (section, value, reset = false) => {
    setSavingKey(section);
    setMessages((m) => ({ ...m, [section]: null }));
    startTransition(async () => {
      const res = reset ? await resetHomeSection(section) : await saveHomeSection(section, value);
      if (reset && res.ok) {
        // Recarga visual del default localmente (sin refrescar toda la página).
        const mod = await import('@/lib/home-content-defaults');
        setState((s) => ({ ...s, [section]: mod.HOME_DEFAULTS[section] }));
      }
      setMessages((m) => ({ ...m, [section]: res }));
      setSavingKey(null);
      setTimeout(() => setMessages((m) => ({ ...m, [section]: null })), 3500);
    });
  };

  return (
    <div className="hcf">
      {SECTIONS.map(({ key, title, desc }) => (
        <Section
          key={key}
          section={key}
          title={title}
          desc={desc}
          data={{ value: state[key], set: (value) => setState((s) => ({ ...s, [key]: value })) }}
          onSave={handleSave}
          saving={isPending && savingKey === key}
          msg={messages[key]}
        />
      ))}

      <style jsx>{`
        .hcf { display: flex; flex-direction: column; gap: 1rem; }
      `}</style>
      <GlobalFormStyles />
    </div>
  );
}

function GlobalFormStyles() {
  return (
    <style jsx global>{`
      .hcf-section {
        background: var(--dark-2);
        border: 1px solid var(--dark-4);
        border-radius: 14px;
        padding: 1.5rem 1.6rem;
      }
      .hcf-section-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--dark-4);
      }
      .hcf-section-head h2 { margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; color: var(--white); }
      .hcf-section-head p { margin: 0; font-size: 0.78rem; font-weight: 500; color: var(--gray-light); max-width: 50ch; }
      .hcf-section-actions { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
      .hcf-section-body { display: flex; flex-direction: column; gap: 1rem; }

      .hcf-msg { font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
      .hcf-msg.ok { color: #4ADE80; }
      .hcf-msg.err { color: #FF4D6A; }

      .hcf-btn {
        padding: 0.55rem 1rem;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        border: 1px solid transparent;
        white-space: nowrap;
        transition: background 0.18s, color 0.18s, border-color 0.18s;
      }
      .hcf-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .hcf-btn-primary { background: var(--gold); color: #0B0B0C; }
      .hcf-btn-primary:hover:not(:disabled) { background: var(--gold-dark); color: #fff; }
      .hcf-btn-ghost { background: transparent; color: var(--gray-light); border-color: var(--dark-4); }
      .hcf-btn-ghost:hover:not(:disabled) { background: var(--dark-4); color: var(--white); }

      .hcf-row { display: grid; gap: 1rem; }
      .hcf-row.two { grid-template-columns: 1fr 1fr; }
      .hcf-row.three { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 720px) { .hcf-row.two, .hcf-row.three { grid-template-columns: 1fr; } }

      .hcf-field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
      .hcf-field.wide { grid-column: 1 / -1; }
      .hcf-field-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); }
      .hcf-field-hint { font-size: 0.7rem; font-weight: 500; color: var(--gray); line-height: 1.4; }

      .hcf input, .hcf-list input, .hcf select, .hcf textarea,
      .hcf-field input, .hcf-field select, .hcf-field textarea {
        width: 100%;
        padding: 0.55rem 0.75rem;
        background: var(--dark);
        border: 1px solid var(--dark-4);
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--white);
        font-family: inherit;
      }
      .hcf-field textarea { resize: vertical; min-height: 60px; }
      .hcf-field input:focus, .hcf-field select:focus, .hcf-field textarea:focus {
        outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(238,177,195,.15);
      }

      .hcf-note { margin: 0; font-size: 0.78rem; color: var(--gray); font-style: italic; }

      .hcf-upload { display: flex; flex-direction: column; gap: 0.5rem; }
      .hcf-upload-preview { position: relative; width: 100%; max-width: 220px; }
      .hcf-upload-preview img, .hcf-upload-preview video {
        width: 100%; max-height: 130px; object-fit: cover; border-radius: 8px;
        border: 1px solid var(--dark-4); background: var(--dark); display: block;
      }
      .hcf-upload-clear {
        position: absolute; top: 6px; right: 6px;
        width: 24px; height: 24px; border-radius: 50%;
        background: rgba(0,0,0,.7); color: #fff; border: none; cursor: pointer;
        font-size: 0.9rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;
      }
      .hcf-upload-clear:hover { background: var(--error); }
      .hcf-upload-drop {
        padding: 0.65rem 0.9rem;
        background: rgba(238,177,195,.06);
        border: 1.5px dashed rgba(238,177,195,.35);
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--gold);
        text-align: center;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .hcf-upload-drop:hover { background: rgba(238,177,195,.12); border-color: var(--gold); }
      .hcf-upload-drop.is-drag { background: rgba(238,177,195,.18); border-color: var(--gold); }
      .hcf-upload-drop.is-busy { opacity: 0.6; cursor: wait; }
      .hcf-upload-error { font-size: 0.72rem; font-weight: 500; color: #FF4D6A; }

      .hcf-color-row { display: flex; gap: 0.5rem; align-items: center; }
      .hcf-color-row input[type="color"] { width: 40px; height: 36px; padding: 2px; flex-shrink: 0; cursor: pointer; }
      .hcf-color-row input[type="text"] { flex: 1; }

      .hcf-list { display: flex; flex-direction: column; gap: 0.75rem; }
      .hcf-list-row { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.9rem; background: var(--dark); border: 1px solid var(--dark-4); border-radius: 10px; }
      .hcf-list-row-fields { flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.7rem; }

      .hcf-row-del {
        width: 30px; height: 30px; flex-shrink: 0;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(255,77,106,.1); border: 1px solid rgba(255,77,106,.25); color: #FF4D6A;
        border-radius: 7px; cursor: pointer; font-size: 1rem; line-height: 1;
      }
      .hcf-row-del:hover:not(:disabled) { background: rgba(255,77,106,.2); }
      .hcf-row-del:disabled { opacity: 0.3; cursor: not-allowed; }

      .hcf-row-add {
        align-self: flex-start;
        padding: 0.5rem 0.9rem;
        background: rgba(238,177,195,.1);
        color: var(--gold);
        border: 1px dashed rgba(238,177,195,.4);
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .hcf-row-add:hover { background: rgba(238,177,195,.18); border-color: var(--gold); }
    `}</style>
  );
}

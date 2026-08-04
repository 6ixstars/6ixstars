import { supabaseAdmin } from '@/lib/supabase';
import { HOME_DEFAULTS, HOME_SECTION_KEYS } from '@/lib/home-content-defaults';
import HomeContentForm from './HomeContentForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = {
  title: 'Home',
  robots: { index: false, follow: false },
};

// A diferencia de lib/home-content.js (que usa unstable_cache para el sitio
// público), acá consultamos Supabase directo — el admin siempre debe ver el
// estado real, recién guardado.
async function fetchHomeContent() {
  if (!supabaseAdmin) return { content: HOME_DEFAULTS, configured: false };

  const { data } = await supabaseAdmin.from('home_content').select('section, data');
  const bySection = new Map((data || []).map(r => [r.section, r.data]));

  const content = {};
  for (const key of HOME_SECTION_KEYS) {
    const override = bySection.get(key);
    content[key] = override && typeof override === 'object'
      ? { ...HOME_DEFAULTS[key], ...override }
      : HOME_DEFAULTS[key];
  }
  return { content, configured: true };
}

export default async function AdminHomePage() {
  const { content, configured } = await fetchHomeContent();

  return (
    <div className="homeadm">
      <header className="homeadm-head">
        <p className="homeadm-eyebrow">Contenido</p>
        <h1 className="homeadm-title">Home</h1>
        <p className="homeadm-sub">
          Editá el texto y las imágenes de cada sección de la página de inicio. Los cambios se ven en el sitio apenas guardás.
        </p>
      </header>

      {!configured && (
        <div className="homeadm-warn">Supabase no está configurado — los cambios no se van a poder guardar.</div>
      )}

      <HomeContentForm initialContent={content} />

      <style>{`
        .homeadm {
          padding: 2.25rem 2.25rem 4rem;
          max-width: 1100px;
          margin: 0 auto;
          font-family: var(--font-montserrat), ui-sans-serif, system-ui, sans-serif;
          color: var(--white);
        }
        .homeadm-head { margin-bottom: 2rem; }
        .homeadm-eyebrow {
          margin: 0 0 0.3rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .homeadm-title {
          margin: 0 0 0.5rem;
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--white);
        }
        .homeadm-sub {
          margin: 0;
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--gray-light);
          max-width: 60ch;
        }
        .homeadm-warn {
          margin-bottom: 1.5rem;
          padding: 0.9rem 1.1rem;
          background: rgba(255, 77, 106, 0.1);
          border: 1px solid rgba(255, 77, 106, 0.3);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #FF4D6A;
        }
      `}</style>
    </div>
  );
}

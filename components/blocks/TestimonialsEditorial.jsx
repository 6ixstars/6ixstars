'use client';
// Componente de 21st.dev — "Editorial Testimonial" (convertido TSX→JSX).
// Carousel editorial de una reseña a la vez, con número índice grande,
// selector de líneas y prev/next. Avatar = iniciales (sin fotos de cara).
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials as DATA } from '@/lib/products-constants';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function TestimonialsEditorial() {
  const items = (DATA || []).map(t => ({
    quote: t.text,
    author: t.name,
    role: t.location,
    company: t.product,
  }));
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChange = (index) => {
    if (index === active || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => { setActive(index); setTimeout(() => setIsTransitioning(false), 50); }, 300);
  };
  const handlePrev = () => handleChange(active === 0 ? items.length - 1 : active - 1);
  const handleNext = () => handleChange(active === items.length - 1 ? 0 : active + 1);

  if (!items.length) return null;
  const current = items[active];

  return (
    <section className="container te-21" style={{ paddingTop: 86, paddingBottom: 20 }}>
      <span className="sx6-tag" style={{ display: 'inline-block', fontFamily: 'var(--font-tech)', fontSize: '.64rem', letterSpacing: '.2em', color: 'var(--gold)', border: '1px solid var(--dark-4)', padding: '5px 10px', marginBottom: 12 }}>/// LA GENTE HABLA</span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 7vw, 6rem)', color: 'var(--white)', lineHeight: .88, margin: '0 0 8px', textTransform: 'uppercase' }}>RESEÑAS</h2>

      <div className="w-full max-w-3xl px-0 py-10">
        <div className="flex items-start gap-8">
          <span className="text-[120px] font-light leading-none text-foreground/10 select-none transition-all duration-500" style={{ fontFeatureSettings: '"tnum"' }}>
            {String(active + 1).padStart(2, '0')}
          </span>

          <div className="flex-1 pt-6">
            <blockquote className={`text-2xl md:text-3xl font-light leading-relaxed text-foreground tracking-tight transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
              “{current.quote}”
            </blockquote>

            <div className={`mt-10 group cursor-default transition-all duration-300 delay-100 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden grid place-items-center font-bold ring-2 ring-foreground/10 group-hover:ring-foreground/30 transition-all duration-300" style={{ background: 'var(--gold)', color: '#0B0B0C', fontFamily: 'var(--font-tech)' }}>
                  {initials(current.author)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{current.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {current.role}
                    <span className="mx-2 text-foreground/20">/</span>
                    <span className="group-hover:text-foreground transition-colors duration-300">{current.company}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {items.map((_, index) => (
                <button key={index} onClick={() => handleChange(index)} className="group relative py-4" aria-label={`Reseña ${index + 1}`}>
                  <span className={`block h-px transition-all duration-500 ease-out ${index === active ? 'w-12 bg-foreground' : 'w-6 bg-foreground/20 group-hover:w-8 group-hover:bg-foreground/40'}`} />
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handlePrev} aria-label="Anterior" className="p-2 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all duration-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} aria-label="Siguiente" className="p-2 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all duration-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

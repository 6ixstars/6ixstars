'use client';
import { motion, useScroll, useSpring } from 'framer-motion';

// Barra de progreso de scroll (rosa) fija arriba.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fx-scroll-progress"
    >
      <style>{`
        .fx-scroll-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold-dark));
          transform-origin: 0 50%; z-index: 9998;
        }
      `}</style>
    </motion.div>
  );
}

'use client';
import { motion } from 'framer-motion';

// Reveal al entrar en viewport (una sola vez). `i` permite escalonar
// (stagger) varios reveals consecutivos. Respeta reduced-motion vía Framer.
const variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Reveal({ children, i = 0, className, style, as = 'div' }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      variants={variants}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-70px' }}
    >
      {children}
    </MotionTag>
  );
}

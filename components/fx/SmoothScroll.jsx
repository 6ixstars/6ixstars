'use client';
import { ReactLenis } from 'lenis/react';

// Smooth scroll global (darkroom.engineering Lenis). `root` usa el scroll
// de la ventana. En touch se deja el scroll nativo (smoothTouch off) para
// que no se sienta laggy en móvil.
export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, duration: 1.15, smoothWheel: true, syncTouch: false }}
    >
      {children}
    </ReactLenis>
  );
}

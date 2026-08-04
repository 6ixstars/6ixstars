// Registro chico y explícito de íconos disponibles para whysix/trust —
// a propósito NO se hace `import * as Icons from 'lucide-react'`, porque
// eso evita el tree-shaking y mete los ~1500 íconos de la librería en el
// bundle de la home. Isomorfo: lo usan tanto el admin (selector) como la
// home (resolver nombre → componente). Debe reflejar exactamente
// HOME_ICON_NAMES en lib/home-content-defaults.js.
'use client';
import { Sparkles, BadgeCheck, Flame, Truck, ShieldCheck, RefreshCw, Star, Heart, Zap, Award, Package, Gift, Circle } from 'lucide-react';

export const HOME_ICON_MAP = {
  Sparkles, BadgeCheck, Flame, Truck, ShieldCheck, RefreshCw,
  Star, Heart, Zap, Award, Package, Gift,
};

export function HomeIcon({ name, ...props }) {
  const Cmp = HOME_ICON_MAP[name] || Circle;
  return <Cmp {...props} />;
}

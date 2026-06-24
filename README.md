# 6ixstars

Tienda en línea de **ropa urbana / streetwear** para el público juvenil en Colombia.

Construida sobre Next.js 15 (App Router) + React 19. El sistema base fue adaptado por completo al catálogo de ropa
(tallas S/M/L/XL, colores, categorías como hoodies, camisetas, pantalones, etc.).

## Stack
- **Next.js 15** + React 19 — App Router, SSR/SSG
- **Zustand v5** — carrito y wishlist (persist en localStorage)
- **Supabase (PostgreSQL)** — catálogo, órdenes
- **Wompi** — pasarela de pago (Colombia)
- **Framer Motion** — animaciones
- **CSS variables** globales (sin Tailwind) en `app/globals.css`

## Desarrollo
```bash
npm install
cp .env.local.example .env.local   # completar llaves
npm run dev
```

## Estructura
- `app/` — rutas (App Router), API routes, checkout
- `components/` — UI, layout, páginas cliente
- `lib/` — data layer (`products-db.js`), stores, helpers
- `lib/schema.sql` — schema de Supabase para el catálogo de ropa

## Alcance actual (fase 1 — esencial)
Catálogo · Tienda · Carrito · Checkout (Wompi) · PDP.
Admin, push, newsletter, reseñas y pSEO quedan para fases posteriores.

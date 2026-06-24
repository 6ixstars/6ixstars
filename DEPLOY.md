# 🚀 Despliegue de 6ixstars (cuenta nueva)

Guía paso a paso para montar la tienda en Vercel con dominio propio.
Orden recomendado: **Supabase → Variables → Vercel → Dominio → Wompi**.

> ⚠️ Todo va en cuentas NUEVAS (Vercel, Supabase, Wompi) para 6ixstars.

---

## 0) Cuentas que necesitas crear
- [ ] **Vercel** — https://vercel.com/signup (puedes entrar con tu GitHub nuevo)
- [ ] **Supabase** — https://supabase.com/dashboard (proyecto nuevo)
- [ ] **Wompi** — https://comercios.wompi.co (para cobrar; empieza en modo TEST)
- [ ] *(opcional)* **GitHub** nuevo si quieres deploy automático en cada push

---

## 1) Supabase (base de datos del catálogo)
1. Crea un **proyecto nuevo** en Supabase. Guarda la contraseña de la DB.
2. Ve a **SQL Editor** → New query.
3. Pega y ejecuta **`lib/schema.sql`** (crea tablas products / product_sizes / product_images).
4. Pega y ejecuta **`lib/seed.sql`** (8 productos de ejemplo). *(Borra esto luego cuando tengas productos reales.)*
5. Ve a **Project Settings → API** y copia:
   - `Project URL`            → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key        → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key       → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ **secreta, NUNCA al frontend ni a git**

---

## 2) Variables de entorno (local)
```bash
cp .env.local.example .env.local
```
Edita `.env.local` con las llaves de Supabase y Wompi. Para probar local:
```bash
npm install
npm run dev      # http://localhost:3000  → ya deberías ver los productos del seed
```

---

## 3) Vercel — primer deploy (vía CLI)
El CLI ya está instalado. Cambia a tu cuenta nueva:
```bash
vercel logout                  # cierra sesión de la cuenta anterior
vercel login                   # entra con TU cuenta nueva
vercel link                    # crea/enlaza el proyecto nuevo (acepta defaults)
```
Carga las variables de entorno en Vercel (Production + Preview):
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_WOMPI_PUBLIC_KEY
vercel env add WOMPI_INTEGRITY_SECRET
vercel env add WOMPI_EVENTS_SECRET
vercel env add NEXT_PUBLIC_SITE_URL          # https://6ixstars.com.co
vercel env add NEXT_PUBLIC_USD_TO_COP_RATE   # 1  (precios ya en COP)
```
Despliega a producción:
```bash
vercel --prod
```
Vercel te dará una URL `https://6ixstars-xxxx.vercel.app`.

> 💡 Alternativa GitHub: sube el repo a tu GitHub nuevo y en el dashboard de Vercel
> haz **Add New → Project → Import**. Cada `git push` desplegará solo.

---

## 4) Conectar tu dominio
En el dashboard de Vercel: **Project → Settings → Domains → Add**.
1. Escribe tu dominio (ej. `6ixstars.com.co` y `www.6ixstars.com.co`).
2. Vercel te dará los registros DNS (un `A` a `76.76.21.21` o un `CNAME`).
3. En tu registrador (donde compraste el dominio) crea esos registros DNS.
4. Espera la propagación (minutos–horas) → Vercel emite el SSL automático.
5. Actualiza `lib/site.js` → `SITE_URL` con tu dominio real y vuelve a desplegar.

---

## 5) Wompi (pagos) — post-deploy
1. En el dashboard de Wompi → **Configuración → API**, copia las llaves (empieza con `pub_test_`).
2. Configura el **webhook**: `https://6ixstars.com.co/api/wompi/webhook`
3. Prueba con tarjeta sandbox: `4242 4242 4242 4242` (aprobada).
4. Cuando todo funcione, cambia a llaves `pub_prod_` y vuelve a desplegar.

---

## ✅ Checklist final
- [ ] Productos del seed visibles en la home y `/tienda`
- [ ] Una PDP abre (ej. `/producto/hoodie-oversize-shadow`)
- [ ] Carrito + checkout llegan a la pasarela Wompi
- [ ] Dominio con candado SSL
- [ ] `SITE_URL` actualizado y redeploy hecho

---
*Pendiente de rediseño (no bloquea el deploy): página de producto y tienda todavía
tienen vocabulario de perfumería; el catálogo de seed es de ejemplo.*

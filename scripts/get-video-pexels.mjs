// Descarga un video de fondo (streetwear/urbano) desde Pexels Videos (gratis).
// Usa PEXELS_KEY de .env.local. Salida: public/video/hero.mp4
import fs from 'node:fs';

let KEY = process.env.PEXELS_KEY;
if (!KEY) { try { KEY = (fs.readFileSync('.env.local', 'utf8').match(/^PEXELS_KEY\s*=\s*(.+)$/m) || [])[1]?.trim(); } catch {} }
if (!KEY) { console.error('Falta PEXELS_KEY'); process.exit(1); }

fs.mkdirSync('public/video', { recursive: true });

const QUERIES = ['man streetwear portrait city', 'people walking street fashion night', 'urban nightlife people dancing', 'fashion model walking city street', 'man woman city street night'];

async function search(q) {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&orientation=landscape&per_page=12&size=medium`;
  const res = await fetch(url, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).videos || [];
}

function pickFile(v) {
  const files = (v.video_files || []).filter(f => f.file_type === 'video/mp4');
  // preferimos ~720p para peso razonable
  files.sort((a, b) => Math.abs((a.height || 0) - 720) - Math.abs((b.height || 0) - 720));
  return files[0];
}

let chosen = null, poster = null;
for (const q of QUERIES) {
  try {
    const vids = await search(q);
    for (const v of vids) {
      const f = pickFile(v);
      if (f && (v.duration || 0) >= 6) { chosen = f; poster = v.image; break; }
    }
  } catch (e) { console.log('q fail', q, e.message); }
  if (chosen) break;
}

if (!chosen) { console.error('No se encontró video'); process.exit(1); }

console.log('Descargando', chosen.width + 'x' + chosen.height, chosen.link.slice(0, 80));
const buf = Buffer.from(await (await fetch(chosen.link)).arrayBuffer());
fs.writeFileSync('public/video/hero.mp4', buf);
console.log('✔ public/video/hero.mp4', (buf.length / 1048576).toFixed(1) + 'MB');

if (poster) {
  try {
    const sharp = (await import('sharp')).default;
    const pb = Buffer.from(await (await fetch(poster)).arrayBuffer());
    await sharp(pb).resize({ width: 1280 }).webp({ quality: 70 }).toFile('public/video/hero-poster.webp');
    console.log('✔ poster');
  } catch (e) { console.log('poster fail', e.message); }
}

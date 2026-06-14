// Genera la imaginería de 6ixstars con Pollinations.ai (FLUX, gratis, sin key).
// Uso: node scripts/gen-images-poll.mjs
// Salida: public/img/gen/*.webp

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'public/img/gen';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'editorial streetwear fashion photography, colombian urban youth model, ' +
  'moody studio lighting, deep black background, hot pink rim light, subtle film grain, ' +
  'high-end magazine look, photorealistic, sharp focus, cinematic, ';

const JOBS = [
  ['hero-model',    BASE + 'full body, confident model wearing an oversized black hoodie and cargo pants, hands in pockets, looking at camera, dramatic shadows', 1024, 1280],
  ['look-01',       BASE + 'model wearing a heavyweight black puffer jacket, three quarter view, urban attitude', 1024, 1365],
  ['look-02',       BASE + 'model wearing baggy denim jeans and a cropped jacket, full body, street pose', 1024, 1365],
  ['look-03',       BASE + 'close up of a model wearing a pink and black snapback cap, side profile', 1024, 1365],
  ['cat-bermudas',  BASE + 'model wearing cargo bermuda shorts and a tee, streetwear styling, full body', 1024, 1280],
  ['cat-conjuntos', BASE + 'model wearing a matching black tracksuit set with pink details, full body', 1024, 1280],
  ['cat-camisas',   BASE + 'model wearing an oversized boxy short sleeve shirt, front view', 1024, 1280],
  ['cat-buzos',     BASE + 'model wearing a heavyweight hoodie with the hood up, moody', 1024, 1280],
  ['cat-jeans',     BASE + 'model wearing baggy light wash jeans, full body, street pose', 1024, 1280],
  ['cat-gorras',    BASE + 'product shot of streetwear snapback and trucker caps on a dark surface with pink accent', 1024, 1280],
  ['spotlight',     BASE + 'hero product shot of a single premium oversized hoodie on a model, centered, strong pink rim light', 1024, 1280],
  ['campaign',      BASE + 'wide cinematic group shot of three urban models in streetwear against a concrete graffiti wall', 1280, 720],
];

async function fetchImg(prompt, w, h, seed) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${w}&height=${h}&model=flux&nologo=true&enhance=true&seed=${seed}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('imagen vacía/placeholder');
  return buf;
}

let ok = 0;
for (const [name, prompt, w, h] of JOBS) {
  process.stdout.write(`→ ${name} … `);
  let done = false;
  for (let attempt = 0; attempt < 3 && !done; attempt++) {
    try {
      const buf = await fetchImg(prompt, w, h, 1000 + Math.floor(Math.random() * 9000));
      await sharp(buf).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));
      ok++; done = true; console.log('ok');
    } catch (e) {
      if (attempt === 2) console.log('FALLÓ →', e.message);
      else await new Promise(r => setTimeout(r, 4000));
    }
  }
}
console.log(`\n✔ Generadas ${ok}/${JOBS.length} imágenes en ${OUT}/`);

// Genera la imaginería de 6ixstars con Fal.ai (FLUX.1 [dev]).
//
// Uso:
//   FAL_KEY=xxxx node scripts/gen-images-fal.mjs
//   (o pon FAL_KEY en .env.local)
//
// Key gratis (sin tarjeta) en: https://fal.ai/dashboard/keys
// Salida: public/img/gen/*.webp

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

let KEY = process.env.FAL_KEY;
if (!KEY) {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const m = env.match(/^FAL_KEY\s*=\s*(.+)\s*$/m);
    if (m) KEY = m[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
}
if (!KEY) {
  console.error('✖ Falta FAL_KEY. Consíguela gratis en https://fal.ai/dashboard/keys y ponla en .env.local');
  process.exit(1);
}

const MODEL = 'fal-ai/flux/dev';
const OUT = 'public/img/gen';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'Editorial streetwear fashion photography, Colombian urban youth model, ' +
  'moody studio lighting, deep black background, hot pink rim light, subtle film grain, ' +
  'high-end magazine look, photorealistic, sharp focus, cinematic. ';

const JOBS = [
  ['hero-model',    BASE + 'Full body shot of a confident model wearing an oversized black hoodie and cargo pants, hands in pockets, looking at camera, dramatic shadows.', [4, 5]],
  ['look-01',       BASE + 'Editorial shot, model wearing a heavyweight black puffer jacket, three-quarter view, urban attitude.', [3, 4]],
  ['look-02',       BASE + 'Editorial shot, model wearing baggy denim jeans and a cropped jacket, full body, street pose.', [3, 4]],
  ['look-03',       BASE + 'Close-up editorial shot of a model wearing a pink and black snapback cap, side profile.', [3, 4]],
  ['cat-bermudas',  BASE + 'Model wearing cargo bermuda shorts and a tee, streetwear styling, full body.', [4, 5]],
  ['cat-conjuntos', BASE + 'Model wearing a matching black tracksuit set with pink details, full body.', [4, 5]],
  ['cat-camisas',   BASE + 'Model wearing an oversized boxy short-sleeve shirt, front view.', [4, 5]],
  ['cat-buzos',     BASE + 'Model wearing a heavyweight hoodie with the hood up, moody.', [4, 5]],
  ['cat-jeans',     BASE + 'Model wearing baggy light-wash jeans, full body, street pose.', [4, 5]],
  ['cat-gorras',    BASE + 'Product shot of streetwear caps (snapback, trucker) on a dark surface with pink accent.', [4, 5]],
  ['spotlight',     BASE + 'Hero product shot of a single premium oversized hoodie on a model, centered, strong pink rim light.', [4, 5]],
  ['campaign',      BASE + 'Wide cinematic group shot of three urban models in streetwear against a concrete graffiti wall.', [16, 9]],
];

async function generate(prompt, [aw, ah]) {
  const width = 1024;
  const height = Math.round((width * ah) / aw);
  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width, height },
      num_images: 1,
      num_inference_steps: 30,
      guidance_scale: 3.5,
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error('sin imagen en la respuesta: ' + JSON.stringify(data).slice(0, 160));
  const imgRes = await fetch(url);
  return Buffer.from(await imgRes.arrayBuffer());
}

let ok = 0;
for (const [name, prompt, aspect] of JOBS) {
  process.stdout.write(`→ ${name} … `);
  try {
    const buf = await generate(prompt, aspect);
    await sharp(buf).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));
    ok++;
    console.log('ok');
  } catch (e) {
    console.log('FALLÓ →', e.message);
  }
}
console.log(`\n✔ Generadas ${ok}/${JOBS.length} imágenes en ${OUT}/`);

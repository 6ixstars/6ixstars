// Genera la imaginería de 6ixstars con Nano Banana (Gemini 2.5 Flash Image).
//
// Uso:
//   GEMINI_API_KEY=xxxx node scripts/gen-images.mjs
//   (o pon GEMINI_API_KEY en .env.local)
//
// Salida: public/img/gen/*.webp  (PNG generado → convertido a webp con sharp)
//
// Estilo: fotografía editorial streetwear, fondo negro, luz de borde rosa,
// modelos urbanos colombianos, grano de película. Marca 6ixstars (negro+rosa).

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// --- API key: de env o de .env.local ---
let KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!KEY) {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const m = env.match(/^(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.+)\s*$/m);
    if (m) KEY = m[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
}
if (!KEY) {
  console.error('✖ Falta GEMINI_API_KEY. Consíguela en https://aistudio.google.com/apikey y ponla en .env.local');
  process.exit(1);
}

const MODELS = ['gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
const OUT = 'public/img/gen';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'Editorial streetwear fashion photography, Colombian urban youth model, ' +
  'moody studio lighting, deep black background, hot pink (#FF2E7E) rim light, ' +
  'subtle film grain, high-end magazine look, sharp focus, no text, no watermark, no logo. ';

// name, prompt, aspect (w/h) para el recorte final
const JOBS = [
  ['hero-model',   BASE + 'Full body shot of a confident model wearing an oversized black hoodie and cargo pants, hands in pockets, looking at camera, dramatic shadows.', [4, 5]],
  ['look-01',      BASE + 'Editorial shot, model wearing a heavyweight black puffer / outerwear jacket, three-quarter view, urban attitude.', [3, 4]],
  ['look-02',      BASE + 'Editorial shot, model wearing baggy denim jeans and a cropped jacket, full body, street pose.', [3, 4]],
  ['look-03',      BASE + 'Close-up editorial shot of a model wearing a pink and black snapback cap, side profile, strong jawline.', [3, 4]],
  ['cat-bermudas', BASE + 'Model wearing cargo bermuda shorts and a tee, waist-down focus, streetwear styling.', [4, 5]],
  ['cat-conjuntos',BASE + 'Model wearing a matching black tracksuit set with pink details, full body.', [4, 5]],
  ['cat-camisas',  BASE + 'Model wearing an oversized boxy short-sleeve shirt, front view, minimal.', [4, 5]],
  ['cat-buzos',    BASE + 'Model wearing a heavyweight hoodie with the hood up, moody.', [4, 5]],
  ['cat-jeans',    BASE + 'Model wearing baggy light-wash jeans, full body, street pose.', [4, 5]],
  ['cat-gorras',   BASE + 'Flat-lay / product shot of streetwear caps (snapback, trucker) on a dark surface with pink accent.', [4, 5]],
  ['spotlight',    BASE + 'Hero product shot of a single premium oversized hoodie on a model, centered, strong pink rim light.', [4, 5]],
  ['campaign',     BASE + 'Wide cinematic group shot of three urban models in streetwear against a concrete wall, graffiti energy.', [16, 9]],
];

async function generate(prompt, aspectRatio) {
  let lastErr;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio } },
        }),
      });
      if (!res.ok) { lastErr = `${model}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`; continue; }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const img = parts.find(p => p.inlineData?.data);
      if (img) return Buffer.from(img.inlineData.data, 'base64');
      lastErr = `${model}: sin imagen en la respuesta`;
    } catch (e) { lastErr = `${model}: ${e.message}`; }
  }
  throw new Error(lastErr);
}

let ok = 0;
for (const [name, prompt, [aw, ah]] of JOBS) {
  process.stdout.write(`→ ${name} … `);
  try {
    const png = await generate(prompt, `${aw}:${ah}`);
    await sharp(png).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));
    ok++;
    console.log('ok');
  } catch (e) {
    console.log('FALLÓ →', e.message);
  }
}
console.log(`\n✔ Generadas ${ok}/${JOBS.length} imágenes en ${OUT}/`);

// Quita el fondo gris claro del logo 6ixstars.jpeg → logo.png transparente.
// Estrategia: flood-fill desde los 4 bordes marcando como transparente todo
// pixel "de fondo" conectado. El contorno rojo de las letras corta la
// propagación, así que el interior (rosa/blanco) se conserva intacto.
import sharp from 'sharp';

const INPUT  = 'public/img/6ixstars.jpeg';
const OUTPUT = 'public/img/logo.png';
const TOL = 46; // tolerancia de distancia de color para considerar "fondo"

const { data, info } = await sharp(INPUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const at = (x, y) => (y * width + x) * channels;
const sample = (x, y) => { const i = at(x, y); return [data[i], data[i + 1], data[i + 2]]; };

// Color de fondo = promedio de las 4 esquinas.
const corners = [sample(0, 0), sample(width - 1, 0), sample(0, height - 1), sample(width - 1, height - 1)];
const bg = [0, 1, 2].map(c => Math.round(corners.reduce((s, p) => s + p[c], 0) / corners.length));

const isBg = (i) => {
  const dr = data[i] - bg[0], dg = data[i + 1] - bg[1], db = data[i + 2] - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db) <= TOL;
};

const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push(x, 0, x, height - 1); }
for (let y = 0; y < height; y++) { stack.push(0, y, width - 1, y); }

// stack guarda pares (x,y) aplanados para evitar millones de arrays pequeños.
while (stack.length) {
  const y = stack.pop();
  const x = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (visited[p]) continue;
  const i = p * channels;
  if (!isBg(i)) continue;
  visited[p] = 1;
  data[i + 3] = 0; // alpha → transparente
  stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
}

await sharp(data, { raw: { width, height, channels } })
  .trim({ threshold: 10 })
  .png()
  .toFile(OUTPUT);

console.log(`Logo transparente → ${OUTPUT}  (bg=rgb(${bg.join(',')}), tol=${TOL})`);

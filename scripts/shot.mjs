import { chromium } from 'playwright';

const url = process.argv[2] || 'https://6ixstars.vercel.app';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'public/img/_shot-hero.png' });
// scroll para capturar más secciones
await page.evaluate(() => window.scrollTo(0, 1100));
await page.waitForTimeout(1500);
await page.screenshot({ path: 'public/img/_shot-mid.png' });
await page.evaluate(() => window.scrollTo(0, 2400));
await page.waitForTimeout(1500);
await page.screenshot({ path: 'public/img/_shot-low.png' });
await browser.close();
console.log('shots done');

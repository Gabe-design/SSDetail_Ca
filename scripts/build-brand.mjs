/**
 * Builds the brand assets from vector primitives so every size is crisp:
 *
 *   src/assets/brand/logo-mark.svg   white disc · "SS" · sparkles      (header, favicon)
 *   src/assets/brand/logo-full.svg   … + "Car Detailing"               (footer, OG, print)
 *   public/favicon.svg, favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
 *   public/og.jpg                    1200×630 social preview
 *
 * The client's logo is a white circle with a Didone-style serif "SS", a four-point
 * sparkle on each side and "Car Detailing" beneath. Letterforms are Playfair Display
 * (OFL) converted to paths with opentype.js — see scripts/fonts/README.md.
 *
 * Run:  node scripts/build-brand.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const out = (p) => path.join(root, p);
const font = (file) => opentype.parse(fs.readFileSync(out(`scripts/fonts/${file}`)).buffer);

const playfair = font('PlayfairDisplay-500.ttf');
const playfairText = font('PlayfairDisplay-400.ttf');
const oswald = font('Oswald-600.ttf');
const workSans = font('WorkSans-400.ttf');

const INK = '#0b0b0b';
const DISC = '#ffffff';

/** Path data for `text` horizontally centered on cx with its baseline at y. */
function textPath(f, text, cx, y, size, { tracking = 0 } = {}) {
  // layout glyph by glyph so tracking can be applied
  const glyphs = [...text].map((ch) => f.charToGlyph(ch)); // per-char: avoids GSUB lookups opentype.js can't parse
  const scale = size / f.unitsPerEm;
  let x = 0;
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push({ g, x });
    x += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  const width = x - tracking * size; // no trailing tracking
  const start = cx - width / 2;
  let d = '';
  for (const { g, x } of parts) d += g.getPath(start + x, y, size).toPathData(2);
  return { d, width };
}

/** Four-point sparkle centered at (cx, cy); `r` is the tip radius. */
function sparkle(cx, cy, r) {
  const k = r * 0.22; // waist — smaller = sharper points
  return [
    `M${cx} ${cy - r}`,
    `Q${cx + k} ${cy - k} ${cx + r} ${cy}`,
    `Q${cx + k} ${cy + k} ${cx} ${cy + r}`,
    `Q${cx - k} ${cy + k} ${cx - r} ${cy}`,
    `Q${cx - k} ${cy - k} ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

function mark({ withText }) {
  const size = 200;
  const c = size / 2;
  // "SS": cap height ≈ 37% of the disc; slightly tightened tracking like the original
  const ssSize = 100;
  const ssBaseline = withText ? 121 : 137;
  const ss = textPath(playfair, 'SS', c, ssBaseline, ssSize, { tracking: -0.05 });
  const ssCenterY = ssBaseline - (playfair.charToGlyph('S').getBoundingBox().y2 * ssSize) / playfair.unitsPerEm / 2;
  const sparkR = 10.5;
  const sparkX = ss.width / 2 + 24;
  let body = `<circle cx="${c}" cy="${c}" r="${c - 2}" fill="${DISC}"/>`;
  body += `<path fill="${INK}" d="${ss.d}"/>`;
  body += `<path fill="${INK}" d="${sparkle(c - sparkX, ssCenterY, sparkR)}"/>`;
  body += `<path fill="${INK}" d="${sparkle(c + sparkX, ssCenterY, sparkR)}"/>`;
  if (withText) {
    const t = textPath(playfairText, 'Car Detailing', c, 150, 19, { tracking: 0.01 });
    body += `<path fill="${INK}" d="${t.d}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">${body}</svg>`;
}

/** Wrap PNG buffers in an .ico container (PNG-in-ICO is valid for Vista+). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    dir.push(e);
  }
  return Buffer.concat([header, ...dir, ...pngs.map((p) => p.buf)]);
}

async function ogImage(markSvg) {
  const W = 1200;
  const H = 630;
  const title = textPath(oswald, 'SS DETAIL', 0, 0, 96);
  const sub = textPath(workSans, 'Showroom Shine Auto Detailing', 0, 0, 34);
  const logoSize = 300;
  const logoX = 110;
  const logoY = (H - logoSize) / 2;
  const textX = logoX + logoSize + 70;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#cfcfcf"/><stop offset=".22" stop-color="#ffffff"/>
        <stop offset=".48" stop-color="#9a9a9a"/><stop offset=".74" stop-color="#ffffff"/><stop offset="1" stop-color="#c2c2c2"/>
      </linearGradient>
      <pattern id="brush" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(115)">
        <rect width="2" height="6" fill="rgba(255,255,255,0.05)"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="#0a0a0a"/>
    <rect width="${W}" height="${H}" fill="url(#brush)"/>
    <rect x="0" y="${H - 2}" width="${W}" height="2" fill="url(#metal)" opacity=".6"/>
    <g transform="translate(${logoX} ${logoY}) scale(${logoSize / 200})">${markSvg.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <g transform="translate(${textX} ${H / 2 - 12})"><path fill="url(#metal)" d="${textPath(oswald, 'SS DETAIL', title.width / 2, 0, 96).d}"/></g>
    <g transform="translate(${textX} ${H / 2 + 52})"><path fill="#9c9c9c" d="${textPath(workSans, 'Showroom Shine Auto Detailing', sub.width / 2, 0, 34).d}"/></g>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

async function main() {
  fs.mkdirSync(out('src/assets/brand'), { recursive: true });
  fs.mkdirSync(out('public'), { recursive: true });

  const markSvg = mark({ withText: false });
  const fullSvg = mark({ withText: true });
  fs.writeFileSync(out('src/assets/brand/logo-mark.svg'), markSvg);
  fs.writeFileSync(out('src/assets/brand/logo-full.svg'), fullSvg);
  fs.writeFileSync(out('public/favicon.svg'), markSvg);

  const png = (size, svg = markSvg) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();
  fs.writeFileSync(out('public/favicon-32.png'), await png(32));
  fs.writeFileSync(out('public/apple-touch-icon.png'), await png(180));
  fs.writeFileSync(out('public/icon-192.png'), await png(192));
  fs.writeFileSync(out('public/icon-512.png'), await png(512));
  fs.writeFileSync(
    out('public/favicon.ico'),
    ico([
      { size: 16, buf: await png(16) },
      { size: 32, buf: await png(32) },
      { size: 48, buf: await png(48) },
    ]),
  );
  fs.writeFileSync(out('public/og.jpg'), await ogImage(fullSvg));

  for (const f of ['src/assets/brand/logo-mark.svg', 'src/assets/brand/logo-full.svg', 'public/favicon.ico', 'public/og.jpg']) {
    console.log(`${f.padEnd(34)} ${(fs.statSync(out(f)).size / 1024).toFixed(1)} KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

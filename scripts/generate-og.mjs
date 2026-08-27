// Generates public/og.jpg (1200x630): navy gradient, wordmark, tagline and vessel render.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const W = 1200;
const H = 630;

const background = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a1128"/>
      <stop offset="1" stop-color="#16244c"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.42" r="0.55">
      <stop offset="0" stop-color="#4f7fce" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#4f7fce" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="88" y="330" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#eef3fc">Autonomous Surface</text>
  <text x="88" y="372" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#eef3fc">Vessel Team</text>
  <text x="88" y="410" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#a8b6d6">NTNU Trondheim</text>
  <text x="88" y="440" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#6f7ea6">Njord: The Autonomous Ship Challenge 2026</text>
</svg>`;

// Real Ligmax logo, recoloured white for the dark background and rasterised at high
// resolution so it stays crisp, then trimmed of its transparent margins.
const logoSvg = readFileSync(path.join(root, 'src/assets/ligmax-logo.svg'), 'utf8')
  .replace(/fill="#(203a70|142962|353b44)"/g, 'fill="#ffffff"')
  .replace(/width="300"/, 'width="1200"')
  .replace(/height="148\.3425414364641"/, 'height="593.37"');

const logo = await sharp(Buffer.from(logoSvg))
  .trim()
  .resize({ width: 360 })
  .png()
  .toBuffer();

// Trim the render's transparent padding, then size the vessel as the hero on the
// right, vertically centred and fully in frame. The logo + tagline form one
// cohesive, vertically-centred block on the left, clear of the vessel.
const boat = await sharp(path.join(root, 'src/assets/vessel-render.png'))
  .trim()
  .resize({ width: 700 })
  .png()
  .toBuffer();

const boatMeta = await sharp(boat).metadata();

await sharp(Buffer.from(background))
  .composite([
    {
      input: boat,
      left: W - boatMeta.width - 36,
      top: Math.round(315 - boatMeta.height / 2),
    },
    {
      input: logo,
      left: 88,
      top: 176,
    },
  ])
  .jpeg({ quality: 88 })
  .toFile(path.join(root, 'public/og.jpg'));

console.log('public/og.jpg written');

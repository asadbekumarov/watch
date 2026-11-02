const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'images', 'sample');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 12 products
const products = [
  { id: 1, brand: "AURELIA", model: "Classique 38" },
  { id: 2, brand: "AURELIA", model: "Classique Rose" },
  { id: 3, brand: "NORDEN", model: "Chrono 42" },
  { id: 4, brand: "NORDEN", model: "Diver 300" },
  { id: 5, brand: "HALDEN", model: "Skeleton" },
  { id: 6, brand: "HALDEN", model: "Petite" },
  { id: 7, brand: "CORVUS", model: "Pilot" },
  { id: 8, brand: "CORVUS", model: "Moonphase" },
  { id: 9, brand: "MERIDIANA", model: "Gold 36" },
  { id: 10, brand: "MERIDIANA", model: "Slim" },
  { id: 11, brand: "TASHQIN", model: "Field" },
  { id: 12, brand: "TASHQIN", model: "Automatic 41" },
];

const angles = [
  { sub: "Vue de face", tag: "DIAL &amp; BEZEL" },
  { sub: "Profil &amp; Couronne", tag: "CASE PROFILE" },
  { sub: "Fond de boîte &amp; Détails", tag: "CASEBACK &amp; STRAP" },
];

async function generateAll() {
  for (const p of products) {
    const idStr = String(p.id).padStart(2, '0');
    for (let a = 1; a <= 3; a++) {
      const fileName = `watch-${idStr}-${a}.webp`;
      const filePath = path.join(outDir, fileName);
      const angleInfo = angles[a - 1];

      // SVG watch silhouette
      const svg = `
      <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="1200" fill="#0e0e0e"/>
        <!-- Background subtle circular aura -->
        <circle cx="600" cy="600" r="420" fill="none" stroke="#222222" stroke-width="2"/>
        <circle cx="600" cy="600" r="360" fill="none" stroke="#1a1a1a" stroke-width="1"/>
        <circle cx="600" cy="600" r="480" fill="none" stroke="#161616" stroke-width="1"/>

        <!-- Watch Case Silhouette -->
        <!-- Strap lugs top and bottom -->
        <path d="M 440 220 L 520 320 L 680 320 L 760 220 Z" fill="#141414" stroke="#2a2a2a" stroke-width="3"/>
        <path d="M 440 980 L 520 880 L 680 880 L 760 980 Z" fill="#141414" stroke="#2a2a2a" stroke-width="3"/>

        <!-- Bezel -->
        <circle cx="600" cy="600" r="280" fill="#121212" stroke="#d4af37" stroke-width="4" stroke-opacity="0.8"/>
        <circle cx="600" cy="600" r="260" fill="#0b0b0b" stroke="#333333" stroke-width="2"/>

        <!-- Crown -->
        <rect x="880" y="580" width="30" height="40" rx="4" fill="#181818" stroke="#d4af37" stroke-width="2" stroke-opacity="0.6"/>

        <!-- Dial hour marks -->
        <line x1="600" y1="360" x2="600" y2="390" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>
        <line x1="600" y1="840" x2="600" y2="810" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>
        <line x1="360" y1="600" x2="390" y2="600" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>
        <line x1="840" y1="600" x2="810" y2="600" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>

        <!-- Sub marks -->
        <circle cx="430" cy="430" r="4" fill="#a8a8a8"/>
        <circle cx="770" cy="430" r="4" fill="#a8a8a8"/>
        <circle cx="430" cy="770" r="4" fill="#a8a8a8"/>
        <circle cx="770" cy="770" r="4" fill="#a8a8a8"/>

        <!-- Watch hands -->
        <line x1="600" y1="600" x2="600" y2="440" stroke="#f5ecd5" stroke-width="5" stroke-linecap="round"/>
        <line x1="600" y1="600" x2="720" y2="600" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>
        <line x1="600" y1="600" x2="520" y2="680" stroke="#d4af37" stroke-width="2" stroke-linecap="round"/>
        <circle cx="600" cy="600" r="9" fill="#d4af37"/>

        <!-- Brand and Model Typography -->
        <text x="600" y="510" text-anchor="middle" font-family="serif" font-size="28" font-weight="300" letter-spacing="8" fill="#f5ecd5">${p.brand}</text>
        <text x="600" y="540" text-anchor="middle" font-family="sans-serif" font-size="16" letter-spacing="4" fill="#b5b5b5">${p.model.toUpperCase()}</text>

        <!-- Angle Badge -->
        <rect x="420" y="1040" width="360" height="44" rx="2" fill="#141414" stroke="#262626" stroke-width="1"/>
        <text x="600" y="1068" text-anchor="middle" font-family="monospace" font-size="14" letter-spacing="3" fill="#a8a8a8">${angleInfo.tag}</text>

        <!-- Frame border -->
        <rect x="24" y="24" width="1152" height="1152" fill="none" stroke="#222222" stroke-width="1"/>
        <text x="60" y="80" font-family="monospace" font-size="14" letter-spacing="2" fill="#666666">VAQT SAROYI · N° ${idStr} · VUE 0${a}</text>
      </svg>
      `;

      await sharp(Buffer.from(svg))
        .webp({ quality: 90 })
        .toFile(filePath);
    }
  }
  console.log('Successfully generated 36 placeholder WebP images in public/images/sample/');
}

generateAll().catch(console.error);

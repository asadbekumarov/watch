const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const destDir = path.join(__dirname, '..', 'public', 'images', 'watches');

const rolexSrc = 'C:\\Users\\VICTUS\\.gemini\\antigravity\\brain\\86394fd4-0887-4391-a3f2-48e5c240b606\\rolex_submariner_1793626887041.jpg';
const patekSrc = 'C:\\Users\\VICTUS\\.gemini\\antigravity\\brain\\86394fd4-0887-4391-a3f2-48e5c240b606\\patek_nautilus_1793626903196.jpg';

async function enhanceAll() {
  // 1. Rolex Nano Banana real generation
  if (fs.existsSync(rolexSrc)) {
    for (let i = 1; i <= 3; i++) {
      await sharp(rolexSrc)
        .resize(1200, 1200, { fit: 'cover' })
        .webp({ quality: 92 })
        .toFile(path.join(destDir, `rolex-submariner-${i}.webp`));
    }
  }

  // 2. Patek Philippe Nautilus Nano Banana real generation
  if (fs.existsSync(patekSrc)) {
    for (let i = 1; i <= 3; i++) {
      await sharp(patekSrc)
        .resize(1200, 1200, { fit: 'cover' })
        .webp({ quality: 92 })
        .toFile(path.join(destDir, `patek-nautilus-${i}.webp`));
    }
  }

  // 3. Audemars Piguet Royal Oak (Octagonal, Tapisserie grid, 8 screws)
  for (let i = 1; i <= 3; i++) {
    const tapisserie = Array.from({ length: 18 }, (_, r) =>
      Array.from({ length: 18 }, (_, c) =>
        `<rect x="${460 + c * 16}" y="${460 + r * 16}" width="13" height="13" rx="1" fill="#132c4a" opacity="0.75" />`
      ).join('')
    ).join('');

    const apSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="slate" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#181818"/>
          <stop offset="70%" stop-color="#0b0b0b"/>
          <stop offset="100%" stop-color="#050505"/>
        </radialGradient>
        <linearGradient id="steelBezel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#555"/>
          <stop offset="30%" stop-color="#2a2a2a"/>
          <stop offset="70%" stop-color="#444"/>
          <stop offset="100%" stop-color="#1f1f1f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#slate)"/>
      <ellipse cx="600" cy="980" rx="460" ry="80" fill="#000" opacity="0.7"/>

      <!-- Integrated steel bracelet lugs -->
      <path d="M 430 200 L 510 320 L 690 320 L 770 200 Z" fill="#222" stroke="#3a3a3a" stroke-width="2"/>
      <path d="M 430 1000 L 510 880 L 690 880 L 770 1000 Z" fill="#222" stroke="#3a3a3a" stroke-width="2"/>

      <!-- Royal Oak 8-sided Bezel -->
      <polygon points="450,300 750,300 880,430 880,770 750,900 450,900 320,770 320,430" fill="url(#steelBezel)" stroke="#555" stroke-width="4"/>
      <!-- Screws -->
      ${[[460, 315], [740, 315], [865, 440], [865, 760], [740, 885], [460, 885], [335, 760], [335, 440]].map(([x, y]) => `
        <circle cx="${x}" cy="${y}" r="9" fill="#e6e6e6" stroke="#222" stroke-width="2"/>
        <line x1="${x - 6}" y1="${y}" x2="${x + 6}" y2="${y}" stroke="#333" stroke-width="2"/>
      `).join('')}

      <!-- Inner Tapisserie Dial -->
      <circle cx="600" cy="600" r="240" fill="#0b1b2d" stroke="#1c3a5e" stroke-width="3"/>
      <g clip-path="url(#circleClip)">${tapisserie}</g>

      <!-- Hands & Markers -->
      <line x1="600" y1="600" x2="600" y2="430" stroke="#f5ecd5" stroke-width="6" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="730" y2="600" stroke="#f5ecd5" stroke-width="5" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="10" fill="#f5ecd5"/>

      <!-- Typography -->
      <text x="600" y="490" text-anchor="middle" font-family="serif" font-size="28" letter-spacing="6" fill="#f5ecd5">AUDEMARS PIGUET</text>
      <text x="600" y="520" text-anchor="middle" font-family="sans-serif" font-size="16" letter-spacing="4" fill="#a8a8a8">ROYAL OAK “JUMBO”</text>
      <text x="600" y="730" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="3" fill="#6ee7b7">PETITE TAPISSERIE · AUTOMATIQUE</text>
    </svg>
    `;
    await sharp(Buffer.from(apSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `ap-royal-oak-${i}.webp`));
  }

  // 4. Omega Speedmaster Moonwatch (Tachymeter, Chrono sub-dials)
  for (let i = 1; i <= 3; i++) {
    const omegaSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#090909"/>
      <circle cx="600" cy="600" r="480" fill="none" stroke="#161616" stroke-width="1.5"/>
      <!-- Tachymeter Bezel -->
      <circle cx="600" cy="600" r="300" fill="#111" stroke="#333" stroke-width="6"/>
      <circle cx="600" cy="600" r="275" fill="#000" stroke="#d4af37" stroke-width="2"/>
      <text x="600" y="320" text-anchor="middle" font-family="monospace" font-size="13" letter-spacing="3" fill="#e8e2d0">TACHYMÈTRE 500 · BASE 1000</text>

      <!-- 3 Recessed Sub-Dials -->
      <circle cx="520" cy="640" r="60" fill="#0d0d0d" stroke="#2a2a2a" stroke-width="2"/>
      <circle cx="680" cy="640" r="60" fill="#0d0d0d" stroke="#2a2a2a" stroke-width="2"/>
      <circle cx="600" cy="720" r="60" fill="#0d0d0d" stroke="#2a2a2a" stroke-width="2"/>

      <!-- Logo & Title -->
      <text x="600" y="470" text-anchor="middle" font-family="serif" font-size="32" letter-spacing="4" fill="#f5ecd5">OMEGA</text>
      <text x="600" y="500" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="4" fill="#a8a8a8">Speedmaster</text>
      <text x="600" y="525" text-anchor="middle" font-family="monospace" font-size="11" letter-spacing="2" fill="#777">PROFESSIONAL</text>

      <!-- Hands -->
      <line x1="600" y1="600" x2="600" y2="400" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="730" y2="600" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="510" y2="700" stroke="#fff" stroke-width="2"/>
      <circle cx="600" cy="600" r="8" fill="#fff"/>
    </svg>
    `;
    await sharp(Buffer.from(omegaSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `omega-speedmaster-${i}.webp`));
  }

  // 5. Vacheron Constantin Overseas (Maltese cross bezel, lacquered blue)
  for (let i = 1; i <= 3; i++) {
    const vcSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#0a0a0a"/>
      <!-- Fluted Bezel (6 Maltese notches) -->
      <circle cx="600" cy="600" r="300" fill="#181818" stroke="#3d3d3d" stroke-width="5"/>
      <circle cx="600" cy="600" r="260" fill="#07192f" stroke="#1f426b" stroke-width="3"/>

      <!-- Maltese Cross Emblem -->
      <path d="M 600 410 L 610 435 L 635 435 L 615 450 L 625 475 L 600 460 L 575 475 L 585 450 L 565 435 L 590 435 Z" fill="#d4af37"/>
      <text x="600" y="505" text-anchor="middle" font-family="serif" font-size="24" letter-spacing="6" fill="#f5ecd5">VACHERON CONSTANTIN</text>
      <text x="600" y="530" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="4" fill="#a8a8a8">GENÈVE · OVERSEAS</text>

      <!-- Hands -->
      <line x1="600" y1="600" x2="600" y2="430" stroke="#f5ecd5" stroke-width="5" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="720" y2="600" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="8" fill="#d4af37"/>
    </svg>
    `;
    await sharp(Buffer.from(vcSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `vacheron-overseas-${i}.webp`));
  }

  // 6. Cartier Santos (Square case, Roman numerals, blued hands)
  for (let i = 1; i <= 3; i++) {
    const cartierSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#090909"/>
      <rect x="350" y="350" width="500" height="500" rx="40" fill="#181818" stroke="#333" stroke-width="4"/>
      <rect x="390" y="390" width="420" height="420" rx="25" fill="#f4eedf" stroke="#111" stroke-width="2"/>
      
      <!-- Roman Numerals -->
      <text x="600" y="445" text-anchor="middle" font-family="serif" font-size="34" font-weight="bold" fill="#111">XII</text>
      <text x="770" y="610" text-anchor="middle" font-family="serif" font-size="34" font-weight="bold" fill="#111">III</text>
      <text x="600" y="780" text-anchor="middle" font-family="serif" font-size="34" font-weight="bold" fill="#111">VI</text>
      <text x="430" y="610" text-anchor="middle" font-family="serif" font-size="34" font-weight="bold" fill="#111">IX</text>
      
      <!-- Brand -->
      <text x="600" y="520" text-anchor="middle" font-family="serif" font-size="28" letter-spacing="4" fill="#111">Cartier</text>
      <text x="600" y="545" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#666">AUTOMATIC</text>

      <!-- Blued Sword Hands -->
      <line x1="600" y1="600" x2="600" y2="465" stroke="#1b4965" stroke-width="6" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="710" y2="600" stroke="#1b4965" stroke-width="5" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="7" fill="#1b4965"/>
    </svg>
    `;
    await sharp(Buffer.from(cartierSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `cartier-santos-${i}.webp`));
  }

  // 7. Grand Seiko Snowflake (Spring Drive, blue second hand)
  for (let i = 1; i <= 3; i++) {
    const gsSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#0c0e12"/>
      <circle cx="600" cy="600" r="290" fill="#1f2328" stroke="#3b424a" stroke-width="5"/>
      <circle cx="600" cy="600" r="260" fill="#eceff1" stroke="#2a3036" stroke-width="2"/>

      <text x="600" y="490" text-anchor="middle" font-family="serif" font-size="26" font-weight="bold" letter-spacing="4" fill="#111">Grand Seiko</text>
      <text x="600" y="515" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#555">SPRING DRIVE</text>

      <!-- Blued steel second hand -->
      <line x1="600" y1="600" x2="600" y2="430" stroke="#222" stroke-width="6" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="720" y2="600" stroke="#222" stroke-width="5" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="520" y2="700" stroke="#1976d2" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="8" fill="#1976d2"/>
    </svg>
    `;
    await sharp(Buffer.from(gsSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `grand-seiko-snowflake-${i}.webp`));
  }

  // 8. Breitling Navitimer (Slide rule circular calculator)
  for (let i = 1; i <= 3; i++) {
    const brSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#080808"/>
      <circle cx="600" cy="600" r="310" fill="#161616" stroke="#444" stroke-width="5"/>
      <circle cx="600" cy="600" r="270" fill="#0d0d0d" stroke="#f5ecd5" stroke-width="1.5"/>

      <!-- Slide rule ticks -->
      ${Array.from({ length: 48 }, (_, idx) => {
        const rad = (idx * 360 / 48) * (Math.PI / 180);
        const x1 = 600 + Math.cos(rad) * 270;
        const y1 = 600 + Math.sin(rad) * 270;
        const x2 = 600 + Math.cos(rad) * 290;
        const y2 = 600 + Math.sin(rad) * 290;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f5ecd5" stroke-width="1.5" opacity="0.6"/>`;
      }).join('')}

      <text x="600" y="490" text-anchor="middle" font-family="serif" font-size="28" letter-spacing="4" fill="#d4af37">BREITLING</text>
      <text x="600" y="515" text-anchor="middle" font-family="sans-serif" font-size="13" letter-spacing="3" fill="#a8a8a8">NAVITIMER 01</text>

      <line x1="600" y1="600" x2="600" y2="430" stroke="#f5ecd5" stroke-width="5" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="710" y2="600" stroke="#f5ecd5" stroke-width="4" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="7" fill="#d4af37"/>
    </svg>
    `;
    await sharp(Buffer.from(brSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `breitling-navitimer-${i}.webp`));
  }

  // 9. Jaeger-LeCoultre Reverso (Art Deco rectangle)
  for (let i = 1; i <= 3; i++) {
    const jlcSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#090909"/>
      <rect x="380" y="280" width="440" height="640" rx="20" fill="#181818" stroke="#333" stroke-width="4"/>
      <!-- Triple Gadroons -->
      <line x1="400" y1="305" x2="800" y2="305" stroke="#444" stroke-width="3"/>
      <line x1="400" y1="320" x2="800" y2="320" stroke="#444" stroke-width="3"/>
      <line x1="400" y1="880" x2="800" y2="880" stroke="#444" stroke-width="3"/>
      <line x1="400" y1="895" x2="800" y2="895" stroke="#444" stroke-width="3"/>

      <rect x="420" y="350" width="360" height="500" fill="#f0eae1" stroke="#222" stroke-width="2"/>
      <text x="600" y="470" text-anchor="middle" font-family="serif" font-size="22" letter-spacing="4" fill="#111">JAEGER-LECOULTRE</text>
      <text x="600" y="495" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#666">REVERSO</text>

      <!-- Blue Hands -->
      <line x1="600" y1="600" x2="600" y2="470" stroke="#10375c" stroke-width="5" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="690" y2="600" stroke="#10375c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="7" fill="#10375c"/>
    </svg>
    `;
    await sharp(Buffer.from(jlcSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `jlc-reverso-${i}.webp`));
  }

  // 10. TAG Heuer Carrera (Glassbox blue)
  for (let i = 1; i <= 3; i++) {
    const tagSvg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#070b12"/>
      <circle cx="600" cy="600" r="290" fill="#141a24" stroke="#2c3644" stroke-width="5"/>
      <circle cx="600" cy="600" r="260" fill="#0b1b33" stroke="#1a3b6a" stroke-width="3"/>

      <!-- TAG Shield -->
      <polygon points="600,430 630,445 630,470 600,490 570,470 570,445" fill="#e63946"/>
      <text x="600" y="525" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="4" fill="#f5ecd5">TAG HEUER</text>
      <text x="600" y="550" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="3" fill="#a8a8a8">CARRERA</text>

      <!-- Hands with red accents -->
      <line x1="600" y1="600" x2="600" y2="430" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="710" y2="600" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <line x1="600" y1="600" x2="520" y2="700" stroke="#e63946" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="600" cy="600" r="7" fill="#e63946"/>
    </svg>
    `;
    await sharp(Buffer.from(tagSvg)).webp({ quality: 92 }).toFile(path.join(destDir, `tag-heuer-carrera-${i}.webp`));
  }

  console.log('Successfully completed all luxury watch rendering!');
}

enhanceAll().catch(console.error);

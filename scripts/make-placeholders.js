const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const watches = [
  { slug: "west-end-watch-32mm", title: "West End Watch", sub: "Automatic 32 mm", detail: "Diamond Edition", color: "#161616", accent: "#D4AF37" },
  { slug: "west-end-watch-41mm-tiffany", title: "West End Watch", sub: "Automatic 41 mm", detail: "Tiffany Blue Dial", color: "#0c3b38", accent: "#2ee6d6" },
  { slug: "west-end-watch-41mm-green", title: "West End Watch", sub: "Automatic 41 mm", detail: "Emerald Green Dial", color: "#0e2e1a", accent: "#48bb78" },
  { slug: "west-end-watch-41mm-champagne", title: "West End Watch", sub: "Automatic 41 mm", detail: "Champagne Sunburst Dial", color: "#2d230d", accent: "#ecc94b" },
  { slug: "west-end-watch-37mm-onyx", title: "West End Watch", sub: "Automatic 37 mm", detail: "Onyx Deep Black Dial", color: "#111111", accent: "#a0aec0" },
  { slug: "west-end-watch-41mm-zircon", title: "West End Watch", sub: "Automatic 41 mm", detail: "Zircon Set Bezel", color: "#1a202c", accent: "#cbd5e0" },
  { slug: "jacques-philippe-39mm", title: "Jacques Philippe", sub: "Swiss Made Quartz 39 mm", detail: "Water Resistant 50M", color: "#171923", accent: "#D4AF37" },
  { slug: "jacques-philippe-41mm", title: "Jacques Philippe", sub: "Swiss Made Quartz 41 mm", detail: "Water Resistant 50M", color: "#14171f", accent: "#D4AF37" },
  { slug: "jacques-philippe-31mm", title: "Jacques Philippe", sub: "Swiss Made Quartz 31 mm", detail: "Water Resistant 50M", color: "#1c1917", accent: "#D4AF37" },
];

const dest = path.join(__dirname, "..", "public", "images", "watches");
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

async function run() {
  for (const w of watches) {
    const svg = `
      <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#141414"/>
            <stop offset="100%" stop-color="#080808"/>
          </radialGradient>
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${w.color}"/>
            <stop offset="85%" stop-color="#070707"/>
          </radialGradient>
          <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4a4a4a"/>
            <stop offset="35%" stop-color="#1a1a1a"/>
            <stop offset="70%" stop-color="#555555"/>
            <stop offset="100%" stop-color="#111111"/>
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F3E7C4"/>
            <stop offset="50%" stop-color="#D4AF37"/>
            <stop offset="100%" stop-color="#997A15"/>
          </linearGradient>
        </defs>

        <!-- Outer Background -->
        <rect width="800" height="800" fill="url(#bgGrad)"/>

        <!-- Ambient Luxury Radial Glow -->
        <circle cx="400" cy="380" r="280" fill="${w.accent}" opacity="0.08"/>

        <!-- Outer Watch Bezel -->
        <circle cx="400" cy="380" r="290" fill="url(#bezelGrad)" stroke="#2d2d2d" stroke-width="2"/>
        <circle cx="400" cy="380" r="275" fill="#0d0d0d" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.8"/>

        <!-- Dial Face -->
        <circle cx="400" cy="380" r="255" fill="url(#dialGrad)"/>

        <!-- Inner Concentric Track -->
        <circle cx="400" cy="380" r="210" fill="none" stroke="#ffffff" stroke-width="0.75" stroke-dasharray="2,8" opacity="0.25"/>
        <circle cx="400" cy="380" r="140" fill="none" stroke="${w.accent}" stroke-width="0.5" opacity="0.2"/>

        <!-- 12 Hour Markers -->
        <g stroke="${w.accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.85">
          <line x1="400" y1="145" x2="400" y2="175"/>
          <line x1="400" y1="585" x2="400" y2="615"/>
          <line x1="165" y1="380" x2="195" y2="380"/>
          <line x1="605" y1="380" x2="635" y2="380"/>
          <!-- Minor Markers -->
          <circle cx="520" cy="260" r="3" fill="${w.accent}"/>
          <circle cx="280" cy="260" r="3" fill="${w.accent}"/>
          <circle cx="520" cy="500" r="3" fill="${w.accent}"/>
          <circle cx="280" cy="500" r="3" fill="${w.accent}"/>
          <circle cx="590" cy="380" r="2" fill="${w.accent}"/>
          <circle cx="210" cy="380" r="2" fill="${w.accent}"/>
        </g>

        <!-- Brand Emblem & Logo on Dial -->
        <text x="400" y="275" font-family="'Times New Roman', Georgia, serif" font-size="20" font-weight="500" fill="#f5f5f5" text-anchor="middle" letter-spacing="3">${w.title.toUpperCase()}</text>
        <text x="400" y="298" font-family="sans-serif" font-size="11" fill="${w.accent}" text-anchor="middle" letter-spacing="2">SWISS COLLECTION</text>

        <!-- Model Subtext on Dial -->
        <text x="400" y="465" font-family="monospace" font-size="12" fill="#a1a1aa" text-anchor="middle" letter-spacing="1">${w.sub}</text>
        <text x="400" y="485" font-family="sans-serif" font-size="11" fill="#71717a" text-anchor="middle">${w.detail}</text>

        <!-- Hands -->
        <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.8))">
          <!-- Hour Hand -->
          <polygon points="396,380 398,255 400,245 402,255 404,380" fill="url(#goldGrad)"/>
          <!-- Minute Hand -->
          <polygon points="397,380 399,190 400,180 401,190 403,380" fill="#f8fafc"/>
          <!-- Seconds Needle -->
          <line x1="400" y1="420" x2="400" y2="160" stroke="${w.accent}" stroke-width="1.2"/>
          <circle cx="400" cy="380" r="7" fill="url(#goldGrad)"/>
          <circle cx="400" cy="380" r="3" fill="#111111"/>
        </g>

        <!-- Bottom Showroom Emblem (Clean & Customer-Facing) -->
        <g transform="translate(160, 685)">
          <rect width="480" height="42" rx="21" fill="#090909" fill-opacity="0.9" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.4"/>
          <text x="240" y="26" font-family="monospace" font-size="11" font-weight="500" fill="#D4AF37" text-anchor="middle" letter-spacing="2">SWISSWATCH PREMIUM · SHOWROOM MODEL</text>
        </g>
      </svg>
    `;
    const outPath = path.join(dest, `${w.slug}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(outPath);
  }
  console.log("Successfully generated 9 polished luxury watch placeholder images.");
}

run().catch(console.error);

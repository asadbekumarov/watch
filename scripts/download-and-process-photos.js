const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'watches');
const brainDir = 'C:\\Users\\VICTUS\\.gemini\\antigravity\\brain\\86394fd4-0887-4391-a3f2-48e5c240b606';

// Direct high-res photo sources
const sources = {
  'rolex-submariner': {
    local: path.join(brainDir, 'rolex_submariner_1793626887041.jpg'),
  },
  'patek-nautilus': {
    local: path.join(brainDir, 'patek_nautilus_1793626903196.jpg'),
  },
  'ap-royal-oak': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Audemars_Piguet_Royal_Oak_ref._15202.jpg',
  },
  'omega-speedmaster': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Omega_speedmaster_reduced_351050.jpg',
  },
  'vacheron-overseas': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Vacheron_Constantin_Patrimony_gold_watch.jpg',
  },
  'cartier-santos': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Cartier_Santos_wristwatch.jpg',
  },
  'grand-seiko-snowflake': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Grand_Seiko_Automatic_Hi-Beat.jpg',
  },
  'breitling-navitimer': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Breitling_Navitimer_chronograph_watch.jpg',
  },
  'jlc-reverso': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Jaeger-LeCoultre-Reverso.jpg',
  },
  'tag-heuer-carrera': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/TAG_Heuer_Carrera_chronograph_CV2010_retusche.jpg',
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(
      url,
      {
        headers: {
          'User-Agent': 'WatchPortfolioApp/1.0 (contact@vaqtsaroyi.uz)',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(dest));
        });
      }
    ).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function processWatch(slug, config) {
  let sourcePath;
  if (config.local && fs.existsSync(config.local)) {
    sourcePath = config.local;
    console.log(`[${slug}] Using Nano Banana source: ${sourcePath}`);
  } else if (config.url) {
    const tempFile = path.join(__dirname, `temp_${slug}.jpg`);
    console.log(`[${slug}] Downloading photo from ${config.url}...`);
    try {
      await download(config.url, tempFile);
      sourcePath = tempFile;
      await delay(1200);
    } catch (e) {
      console.error(`Failed to download ${slug}:`, e.message);
      return;
    }
  }

  if (!sourcePath || !fs.existsSync(sourcePath)) {
    console.error(`No source for ${slug}`);
    return;
  }

  const meta = await sharp(sourcePath).metadata();
  const width = meta.width;
  const height = meta.height;

  // View 1: Full watch, luxury dark frame
  const out1 = path.join(targetDir, `${slug}-1.webp`);
  await sharp(sourcePath)
    .resize(1200, 1200, {
      fit: 'contain',
      background: { r: 9, g: 9, b: 9, alpha: 1 },
    })
    .webp({ quality: 92 })
    .toFile(out1);

  // View 2: Close-up Dial / Face Macro
  const cropSize = Math.min(width, height) * 0.65;
  const left = Math.max(0, Math.floor((width - cropSize) / 2));
  const top = Math.max(0, Math.floor((height - cropSize) / 2));

  const out2 = path.join(targetDir, `${slug}-2.webp`);
  await sharp(sourcePath)
    .extract({
      left,
      top,
      width: Math.floor(cropSize),
      height: Math.floor(cropSize),
    })
    .resize(1200, 1200)
    .webp({ quality: 92 })
    .toFile(out2);

  // View 3: Detail / Angle (Slightly offset macro)
  const detailSize = Math.min(width, height) * 0.55;
  const detailLeft = Math.max(0, Math.floor((width - detailSize) / 2 + detailSize * 0.08));
  const detailTop = Math.max(0, Math.floor((height - detailSize) / 2 - detailSize * 0.08));
  const validLeft = Math.min(width - detailSize, Math.max(0, detailLeft));
  const validTop = Math.min(height - detailSize, Math.max(0, detailTop));

  const out3 = path.join(targetDir, `${slug}-3.webp`);
  await sharp(sourcePath)
    .extract({
      left: Math.floor(validLeft),
      top: Math.floor(validTop),
      width: Math.floor(detailSize),
      height: Math.floor(detailSize),
    })
    .resize(1200, 1200)
    .webp({ quality: 92 })
    .toFile(out3);

  console.log(`[${slug}] Successfully generated 3 views!`);

  // Clean up temp file
  if (sourcePath.includes('temp_')) {
    try { fs.unlinkSync(sourcePath); } catch (_) {}
  }
}

async function run() {
  for (const [slug, cfg] of Object.entries(sources)) {
    await processWatch(slug, cfg);
  }
  console.log('All 10 luxury watches processed successfully into WebP!');
}

run().catch(console.error);
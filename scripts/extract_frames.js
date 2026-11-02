const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function extractAllFrames() {
  const inputFile = path.join(__dirname, '../public/frames/watch.webp');
  const outputDir = path.join(__dirname, '../public/frames');

  console.log('Reading metadata from:', inputFile);
  const metadata = await sharp(inputFile, { animated: true, limitInputPixels: false }).metadata();
  const totalPages = metadata.pages || 239;
  console.log(`Found ${totalPages} pages. Starting extraction...`);

  const startTime = Date.now();
  const concurrency = 8;
  let completed = 0;

  for (let i = 0; i < totalPages; i += concurrency) {
    const chunk = [];
    for (let j = i; j < Math.min(i + concurrency, totalPages); j++) {
      const frameNum = String(j + 1).padStart(4, '0');
      const outputPath = path.join(outputDir, `frame_${frameNum}.webp`);

      const task = sharp(inputFile, { page: j, limitInputPixels: false })
        .webp({ quality: 85 })
        .toFile(outputPath)
        .then(() => {
          completed++;
        });
      chunk.push(task);
    }
    await Promise.all(chunk);
    process.stdout.write(`\rProgress: ${completed}/${totalPages} frames (${Math.round((completed / totalPages) * 100)}%)`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nSuccessfully extracted ${completed} frames in ${duration}s!`);
}

extractAllFrames().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});


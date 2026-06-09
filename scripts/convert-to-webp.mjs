/**
 * convert-to-webp.mjs
 * Converts all .jpg / .jpeg images in /public to .webp (quality 85, lossless=false).
 * Keeps the originals untouched. Prints a before/after size table.
 */
import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const images = readdirSync(publicDir).filter(f =>
  [".jpg", ".jpeg"].includes(extname(f).toLowerCase())
);

console.log(`\nConverting ${images.length} image(s) to WebP...\n`);
console.log("File".padEnd(30), "Before".padEnd(12), "After".padEnd(12), "Saved");
console.log("-".repeat(70));

for (const file of images) {
  const inputPath  = join(publicDir, file);
  const outputName = basename(file, extname(file)) + ".webp";
  const outputPath = join(publicDir, outputName);

  const before = statSync(inputPath).size;

  await sharp(inputPath)
    .webp({ quality: 85 })
    .toFile(outputPath);

  const after = statSync(outputPath).size;
  const saved = (((before - after) / before) * 100).toFixed(1);

  console.log(
    file.padEnd(30),
    `${(before / 1024).toFixed(0)} KB`.padEnd(12),
    `${(after / 1024).toFixed(0)} KB`.padEnd(12),
    `${saved}% smaller`
  );
}

console.log("\n✅ Done! WebP files created alongside originals in /public");
console.log("   Next step: update component image references from .jpg → .webp\n");

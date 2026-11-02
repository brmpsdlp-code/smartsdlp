import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = "src/imports/nft";

const files = ["alif.jpg", "frans.jpg", "haikal.jpg", "rehan.jpg"];

for (const file of files) {
  const filePath = path.join(dir, file);
  const tempPath = filePath + ".tmp.jpg";

  await sharp(filePath)
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(tempPath);

  fs.renameSync(tempPath, filePath);

  console.log(`Re-encoded: ${file}`);
}
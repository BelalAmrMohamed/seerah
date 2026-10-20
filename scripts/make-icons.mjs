// One-off: node scripts/make-icons.mjs  (source: public/shamsah-icon-1024.png, the site logo)
import sharp from "sharp";
const BG = "#0b0f1e", SRC = "public/shamsah-icon-1024.png";
const make = async (size, inner, out) => {
  const logo = await sharp(SRC).resize(inner, inner, { fit: "contain", background: BG }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: "center" }]).png().toFile(out);
};
await make(192, 192, "public/icons/icon-192.png");
await make(512, 512, "public/icons/icon-512.png");
await make(512, 360, "public/icons/maskable-512.png"); // logo inside 70% safe zone
await make(180, 180, "public/icons/apple-touch-icon.png");
console.log("icons done");

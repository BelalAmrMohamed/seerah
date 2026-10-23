// Copies the website's data into the app so the content has ONE source of truth
// (../src/data/stations.json). The copies are committed, so the app also works
// when this script cannot find the website folder (e.g. when mobile/ is built alone).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const pairs = [
  [resolve(root, "../src/data/stations.json"), resolve(root, "src/data/stations.json")],
  [resolve(root, "../public/data/arabia-dots.json"), resolve(root, "src/data/arabia-dots.json")],
];
mkdirSync(resolve(root, "src/data"), { recursive: true });
for (const [from, to] of pairs) {
  if (existsSync(from)) { copyFileSync(from, to); console.log("synced", from.replace(root, "")); }
  else console.log("skip (website file not found, using committed copy):", to.replace(root, ""));
}

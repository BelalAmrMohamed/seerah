// Builds a dot-matrix Arabian Peninsula (lng/lat pairs) from Natural Earth land data.
import { readFileSync, writeFileSync } from "node:fs";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
const topo = JSON.parse(readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const land = feature(topo, topo.objects.land);
const STEP = 0.3, dots = [];
for (let lat = 10; lat <= 36; lat += STEP)
  for (let lng = 30; lng <= 52; lng += STEP)
    if (geoContains(land, [lng, lat])) dots.push([+lng.toFixed(2), +lat.toFixed(2)]);
writeFileSync("public/data/arabia-dots.json", JSON.stringify(dots));
console.log("dots:", dots.length);

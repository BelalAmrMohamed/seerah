"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { stage } from "@/lib/store";
import { eraHex } from "@/lib/stations";

const K = 0.9; // world units per degree

/** Realistic topographical elevation for the Arabian Peninsula and Levant */
export function getElevation(lng: number, lat: number): number {
  // Western mountain spine (Hejaz & As-Sarawat ranges)
  const spineLng = 43.0 - ((lat - 15.0) / 14.0) * 6.8;
  const distSpine = Math.abs(lng - spineLng);
  let mountain = 0;
  if (distSpine < 2.6 && lat >= 14.5 && lat <= 29.5) {
    mountain = Math.max(0, 1 - distSpine / 2.6) * 0.62;
    // Extra elevation in high peaks of Asir and Taif
    if (lat >= 17.0 && lat <= 22.0) mountain *= 1.35;
  }
  // Levant & Jordanian highlands (lat 30..34, lng 35..37.5)
  if (lat >= 30.0 && lat <= 34.0 && lng >= 35.0 && lng <= 37.5) {
    mountain += Math.max(0, 1 - Math.abs(lng - 36.2) / 1.6) * 0.48;
  }
  // Central Najd Plateau (Jabal Tuwayq)
  if (lng >= 43.0 && lng <= 47.5 && lat >= 20.0 && lat <= 26.5) {
    mountain += 0.16 + 0.06 * Math.sin(lat * 1.5 + lng * 1.2);
  }
  return Math.max(0.02, mountain);
}

export const toXY = ([lat, lng]: [number, number]) => {
  const z = getElevation(lng, lat);
  return new THREE.Vector3((lng - 41) * K, (lat - 23) * K, z + 0.1);
};

function createGlowTexture(feather = 0.35) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(feather, "rgba(255,255,255,0.75)");
  r.addColorStop(0.7, "rgba(255,255,255,0.2)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function createRingTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 128, 128);
  g.strokeStyle = "rgba(255,255,255,0.95)";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(64, 64, 48, 0, Math.PI * 2);
  g.stroke();
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 48);
  grad.addColorStop(0, "rgba(255,255,255,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fill();
  return new THREE.CanvasTexture(c);
}

function Scene({ light }: { light: boolean }) {
  const { camera, size } = useThree();
  const tex = useMemo(() => createGlowTexture(0.35), []);
  const ringTex = useMemo(() => createRingTexture(), []);
  const mobile = size.width < 768;

  const color = useRef(new THREE.Color(eraHex.dawn.dark));
  const target = useRef(new THREE.Color());
  const look = useRef(new THREE.Vector3());
  const camPos = useRef(new THREE.Vector3(0, 0, 10));
  const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;

  // Drifting ambient starfield / sacred light motes
  const field = useMemo(() => {
    const n = mobile ? 600 : 1400;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 36;
      p[i * 3 + 1] = (Math.random() - 0.5) * 22;
      p[i * 3 + 2] = -Math.random() * 14;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [mobile]);
  const fieldMat = useRef<THREE.PointsMaterial>(null!);

  // 3D Topographic Dot-Matrix Terrain
  const mapGeo = useRef(new THREE.BufferGeometry());
  const mapMat = useRef<THREE.PointsMaterial>(null!);

  // Coastline Silhouette
  const coastGeo = useRef(new THREE.BufferGeometry());
  const coastMat = useRef<THREE.PointsMaterial>(null!);

  useEffect(() => {
    fetch("/data/arabia-dots.json")
      .then((r) => r.json())
      .then((d: [number, number][]) => {
        // Grid set to detect coastlines
        const dotSet = new Set(d.map(([lng, lat]) => `${lng.toFixed(1)},${lat.toFixed(1)}`));
        const coastPoints: number[] = [];
        const positions = new Float32Array(d.length * 3);
        const colors = new Float32Array(d.length * 3);

        const baseCol = new THREE.Color(light ? "#9a7428" : "#e0b658");
        const peakCol = new THREE.Color(light ? "#6b4408" : "#fff2c8");
        const cTmp = new THREE.Color();

        d.forEach(([lng, lat], i) => {
          const elev = getElevation(lng, lat);
          const x = (lng - 41) * K;
          const y = (lat - 23) * K;
          const z = elev * 0.95;

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;

          // Vertex color based on elevation
          const t = Math.min(1, elev / 0.7);
          cTmp.copy(baseCol).lerp(peakCol, t);
          colors[i * 3] = cTmp.r;
          colors[i * 3 + 1] = cTmp.g;
          colors[i * 3 + 2] = cTmp.b;

          // Check if coastline
          const neighbors = [
            `${(lng + 0.3).toFixed(1)},${lat.toFixed(1)}`,
            `${(lng - 0.3).toFixed(1)},${lat.toFixed(1)}`,
            `${lng.toFixed(1)},${(lat + 0.3).toFixed(1)}`,
            `${lng.toFixed(1)},${(lat - 0.3).toFixed(1)}`,
          ];
          const isCoast = neighbors.some((k) => !dotSet.has(k));
          if (isCoast) {
            coastPoints.push(x, y, z + 0.02);
          }
        });

        mapGeo.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        mapGeo.current.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        mapGeo.current.computeBoundingSphere();

        coastGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(coastPoints), 3));
        coastGeo.current.computeBoundingSphere();
      })
      .catch(() => {});
  }, [light]);

  // Route paths: full trace (ghost path) + progress line (active beam)
  const N = 200;
  const traceLine = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.28, linewidth: 1 }));
  }, []);

  const progressLine = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setDrawRange(0, 0);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95, linewidth: 2 }));
  }, []);

  // Animated laser comet pulse along route
  const PULSE_COUNT = 16;
  const pulseGeo = useRef(new THREE.BufferGeometry());
  const pulseMat = useRef<THREE.PointsMaterial>(null!);
  useEffect(() => {
    pulseGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PULSE_COUNT * 3), 3));
  }, []);

  // Celestial Waypoint Beacons (Pillars of Light)
  const BEACON_SEGS = 24;
  const beaconLine = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BEACON_SEGS * 2 * 3), 3));
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.8 }));
  }, []);

  // Waypoint rings & core points
  const routePts = useRef<THREE.Vector3[]>([]);
  const routeId = useRef(0);
  const wpGeo = useRef(new THREE.BufferGeometry());
  const wpMat = useRef<THREE.PointsMaterial>(null!);
  const ringGeo = useRef(new THREE.BufferGeometry());
  const ringMat = useRef<THREE.PointsMaterial>(null!);
  const markGeo = useRef(new THREE.BufferGeometry());
  const markMat = useRef<THREE.PointsMaterial>(null!);
  markGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.001, dt);
    const map = stage.mode === "map";
    const time = state.clock.getElapsedTime();

    target.current.set(light ? eraHex[stage.era].light : eraHex[stage.era].dark);
    color.current.lerp(target.current, k * 0.6);

    // Color propagation
    fieldMat.current.color.copy(color.current);
    mapMat.current.color.copy(color.current);
    coastMat.current.color.copy(color.current);
    wpMat.current.color.copy(color.current);
    ringMat.current.color.copy(color.current);
    markMat.current.color.copy(color.current);
    pulseMat.current.color.copy(color.current);
    (traceLine.material as THREE.LineBasicMaterial).color.copy(color.current);
    (progressLine.material as THREE.LineBasicMaterial).color.copy(color.current);
    (beaconLine.material as THREE.LineBasicMaterial).color.copy(color.current);

    // Opacity targets
    const fo = (map ? 0 : 1) * (light ? 0.55 : 0.85) * (0.55 + 0.45 * stage.hero);
    fieldMat.current.opacity += (fo - fieldMat.current.opacity) * k;
    const targetMapOp = map ? (light ? 0.85 : 0.65) : 0;
    mapMat.current.opacity += (targetMapOp - mapMat.current.opacity) * k;
    coastMat.current.opacity = mapMat.current.opacity * 1.5;
    wpMat.current.opacity = mapMat.current.opacity * 2.0;
    ringMat.current.opacity = mapMat.current.opacity * (0.4 + 0.3 * Math.sin(time * 3));
    pulseMat.current.opacity = map ? 0.95 : 0;

    (traceLine.material as THREE.LineBasicMaterial).opacity = map ? (light ? 0.25 : 0.35) : 0;
    (progressLine.material as THREE.LineBasicMaterial).opacity = map ? 0.95 : 0;
    (beaconLine.material as THREE.LineBasicMaterial).opacity = map ? 0.75 + 0.25 * Math.sin(time * 4) : 0;

    // Drifting star field motion
    const pos = field.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + dt * (0.12 + (i % 7) * 0.02);
      if (y > 11) y = -11;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    // Build route when stage.route changes
    if (map && stage.route.id !== routeId.current && stage.route.pts.length > 1) {
      routeId.current = stage.route.id;
      const wp = stage.route.pts.map(toXY);

      // Generate smooth CatmullRom path lifted slightly above terrain
      const curve = new THREE.CatmullRomCurve3(
        wp.map((v, i) => {
          const arch = Math.sin((i / Math.max(wp.length - 1, 1)) * Math.PI) * 0.35;
          return new THREE.Vector3(v.x, v.y, v.z + arch);
        }),
        false,
        "catmullrom",
        0.35
      );

      routePts.current = curve.getPoints(N - 1);

      // Set trace line (full path)
      const traceAttr = traceLine.geometry.attributes.position as THREE.BufferAttribute;
      const progAttr = progressLine.geometry.attributes.position as THREE.BufferAttribute;
      routePts.current.forEach((v, i) => {
        traceAttr.setXYZ(i, v.x, v.y, v.z);
        progAttr.setXYZ(i, v.x, v.y, v.z);
      });
      traceAttr.needsUpdate = true;
      progAttr.needsUpdate = true;

      // Waypoint beacons
      const wpFloats = wp.flatMap((v) => [v.x, v.y, v.z]);
      wpGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(wpFloats), 3));
      ringGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(wpFloats), 3));

      // Light pillars reaching up into the heavens from each stop
      const beaconVerts: number[] = [];
      wp.forEach((v) => {
        beaconVerts.push(v.x, v.y, v.z, v.x, v.y, v.z + 1.8);
      });
      beaconLine.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(beaconVerts), 3));
    }

    const pts = routePts.current;
    let focus = new THREE.Vector3(0, 0, 0);

    if (map && pts.length) {
      const idx = Math.min(N - 1, Math.floor(stage.route.progress * (N - 1)));
      progressLine.geometry.setDrawRange(0, idx + 1);

      // Moving cursor / head beacon
      const m = markGeo.current.attributes.position as THREE.BufferAttribute;
      m.setXYZ(0, pts[idx].x, pts[idx].y, pts[idx].z);
      m.needsUpdate = true;
      focus = pts[idx];

      // Laser comet pulse particles trailing behind the cursor
      const pulseAttr = pulseGeo.current.attributes.position as THREE.BufferAttribute;
      if (pulseAttr) {
        for (let pIdx = 0; pIdx < PULSE_COUNT; pIdx++) {
          const trailIdx = Math.max(0, idx - pIdx);
          const pt = pts[trailIdx];
          pulseAttr.setXYZ(pIdx, pt.x, pt.y, pt.z);
        }
        pulseAttr.needsUpdate = true;
      }
    }

    // Dynamic camera placement with 3D elevation and slight banking
    const wantPos = map
      ? new THREE.Vector3(focus.x + (mobile ? 0 : 0.8), focus.y - (mobile ? 4.8 : 4.4), focus.z + (mobile ? 6.2 : 5.4))
      : new THREE.Vector3(0, 0, 10);
    const wantLook = map ? new THREE.Vector3(focus.x, focus.y + 0.4, focus.z) : new THREE.Vector3(0, 0, 0);

    camPos.current.lerp(wantPos, k * 0.45);
    look.current.lerp(wantLook, k * 0.45);
    camera.position.copy(camPos.current);
    camera.lookAt(look.current);
  });

  return (
    <>
      {/* Drifting Sacred Light Field */}
      <points geometry={field}>
        <pointsMaterial ref={fieldMat} map={tex} size={0.16} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>

      {/* 3D Topographic Terrain Point Cloud with Vertex Colors */}
      <points geometry={mapGeo.current}>
        <pointsMaterial ref={mapMat} map={tex} size={0.14} vertexColors sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>

      {/* Luminous Coastline Edge */}
      <points geometry={coastGeo.current}>
        <pointsMaterial ref={coastMat} map={tex} size={0.22} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>

      {/* Full Route Trace (Ghost Trail) */}
      <primitive object={traceLine} />

      {/* Traveled Route Path (Vibrant Laser) */}
      <primitive object={progressLine} />

      {/* Animated Laser Pulse Comet */}
      <points geometry={pulseGeo.current}>
        <pointsMaterial ref={pulseMat} map={tex} size={0.35} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>

      {/* Celestial Pillars of Light at Waypoints */}
      <primitive object={beaconLine} />

      {/* Waypoint Core Beacons */}
      <points geometry={wpGeo.current}>
        <pointsMaterial ref={wpMat} map={tex} size={0.65} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>

      {/* Pulsing Concentric Halos at Waypoints */}
      <points geometry={ringGeo.current}>
        <pointsMaterial ref={ringMat} map={ringTex} size={1.4} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>

      {/* Head Navigation Beacon (Current Location) */}
      <points geometry={markGeo.current}>
        <pointsMaterial ref={markMat} map={tex} size={1.2} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} />
      </points>
    </>
  );
}

export default function Stage() {
  const { resolvedTheme } = useTheme();
  return (
    <div dir="ltr" aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} camera={{ fov: 48, position: [0, 0, 10] }}>
        <Scene light={resolvedTheme === "light"} />
      </Canvas>
    </div>
  );
}

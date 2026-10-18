"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { stage } from "@/lib/store";
import { eraHex } from "@/lib/stations";

const K = 0.9; // world units per degree
const toXY = ([lat, lng]: [number, number]) => new THREE.Vector3((lng - 41) * K, (lat - 23) * K, 0.05);

function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!; const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function Scene({ light }: { light: boolean }) {
  const { camera, size } = useThree();
  const tex = useMemo(glowTexture, []);
  const mobile = size.width < 768;
  const color = useRef(new THREE.Color(eraHex.dawn.dark));
  const target = useRef(new THREE.Color());
  const look = useRef(new THREE.Vector3());
  const camPos = useRef(new THREE.Vector3(0, 0, 10));
  const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;

  // Drifting light field
  const field = useMemo(() => {
    const n = mobile ? 500 : 1300, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 30; p[i * 3 + 1] = (Math.random() - 0.5) * 18; p[i * 3 + 2] = -Math.random() * 12; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); return g;
  }, [mobile]);
  const fieldMat = useRef<THREE.PointsMaterial>(null!);

  // Dot-matrix map
  const mapGeo = useRef(new THREE.BufferGeometry());
  const mapMat = useRef<THREE.PointsMaterial>(null!);
  useEffect(() => {
    fetch("/data/arabia-dots.json").then((r) => r.json()).then((d: [number, number][]) => {
      const p = new Float32Array(d.length * 3);
      d.forEach(([lng, lat], i) => { p[i * 3] = (lng - 41) * K; p[i * 3 + 1] = (lat - 23) * K; });
      mapGeo.current.setAttribute("position", new THREE.BufferAttribute(p, 3)); mapGeo.current.computeBoundingSphere();
    }).catch(() => {});
  }, []);

  // Route
  const N = 160;
  const lineObj = useMemo(() => {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setDrawRange(0, 0);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95 }));
  }, []);
  const routePts = useRef<THREE.Vector3[]>([]);
  const routeId = useRef(0);
  const wpGeo = useRef(new THREE.BufferGeometry());
  const wpMat = useRef<THREE.PointsMaterial>(null!);
  const markGeo = useRef(new THREE.BufferGeometry());
  const markMat = useRef<THREE.PointsMaterial>(null!);
  markGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing
    const map = stage.mode === "map";
    target.current.set(light ? eraHex[stage.era].light : eraHex[stage.era].dark);
    color.current.lerp(target.current, k * 0.6);
    fieldMat.current.color.copy(color.current); mapMat.current.color.copy(color.current);
    wpMat.current.color.copy(color.current); markMat.current.color.copy(color.current);
    (lineObj.material as THREE.LineBasicMaterial).color.copy(color.current);

    const fo = (map ? 0 : 1) * (light ? 0.55 : 0.85) * (0.55 + 0.45 * stage.hero);
    fieldMat.current.opacity += (fo - fieldMat.current.opacity) * k;
    mapMat.current.opacity += ((map ? (light ? 0.7 : 0.5) : 0) - mapMat.current.opacity) * k;
    wpMat.current.opacity = markMat.current.opacity = mapMat.current.opacity * 1.8;
    (lineObj.material as THREE.LineBasicMaterial).opacity = map ? 0.95 : 0;

    const pos = field.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) { let y = pos.getY(i) + dt * (0.12 + (i % 7) * 0.02); if (y > 9) y = -9; pos.setY(i, y); }
    pos.needsUpdate = true;

    if (map && stage.route.id !== routeId.current && stage.route.pts.length > 1) {
      routeId.current = stage.route.id;
      const wp = stage.route.pts.map(toXY);
      const curve = wp.length === 2
        ? new THREE.QuadraticBezierCurve3(wp[0], wp[0].clone().lerp(wp[1], 0.5).add(new THREE.Vector3(0, 0, 1.2)), wp[1])
        : new THREE.CatmullRomCurve3(wp.map((v) => v.clone().setZ(0.3)), false, "catmullrom", 0.3);
      routePts.current = curve.getPoints(N - 1);
      const a = lineObj.geometry.attributes.position as THREE.BufferAttribute;
      routePts.current.forEach((v, i) => a.setXYZ(i, v.x, v.y, v.z)); a.needsUpdate = true;
      wpGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(wp.flatMap((v) => [v.x, v.y, v.z])), 3));
    }
    const pts = routePts.current;
    let focus = new THREE.Vector3(0, 0, 0);
    if (map && pts.length) {
      const idx = Math.min(N - 1, Math.floor(stage.route.progress * (N - 1)));
      lineObj.geometry.setDrawRange(0, idx + 1);
      const m = markGeo.current.attributes.position as THREE.BufferAttribute; m.setXYZ(0, pts[idx].x, pts[idx].y, pts[idx].z); m.needsUpdate = true;
      focus = pts[idx];
    }
    const wantPos = map ? new THREE.Vector3(focus.x, focus.y - 5.2, 6.2) : new THREE.Vector3(0, 0, 10);
    camPos.current.lerp(wantPos, k * 0.5); look.current.lerp(map ? focus : new THREE.Vector3(0, 0, 0), k * 0.5);
    camera.position.copy(camPos.current); camera.lookAt(look.current);
  });

  return (
    <>
      <points geometry={field}><pointsMaterial ref={fieldMat} map={tex} size={0.16} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} /></points>
      <points geometry={mapGeo.current}><pointsMaterial ref={mapMat} map={tex} size={0.1} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} /></points>
      <primitive object={lineObj} />
      <points geometry={wpGeo.current}><pointsMaterial ref={wpMat} map={tex} size={0.5} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} /></points>
      <points geometry={markGeo.current}><pointsMaterial ref={markMat} map={tex} size={0.9} sizeAttenuation transparent opacity={0} depthWrite={false} blending={blending} /></points>
    </>
  );
}

export default function Stage() {
  const { resolvedTheme } = useTheme();
  return (
    <div dir="ltr" aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }} camera={{ fov: 50, position: [0, 0, 10] }}>
        <Scene light={resolvedTheme === "light"} />
      </Canvas>
    </div>
  );
}

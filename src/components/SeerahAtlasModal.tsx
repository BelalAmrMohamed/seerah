"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";
import { stations, ar, arYear, eraHex, eraNames, type Era, eraOf } from "@/lib/stations";
import { geo, geoMeta, allStationsAtlas, type Pt } from "@/data/geo";
import { getElevation } from "@/components/three/Stage";
import {
  X,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  Navigation,
  Mountain,
  BookOpen,
  Sun,
  Moon,
  Sunset,
  ArrowRight,
  Route as RouteIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const K = 0.9;
const to3D = ([lat, lng]: [number, number], elevMultiplier = 1) => {
  const z = getElevation(lng, lat) * elevMultiplier;
  return new THREE.Vector3((lng - 41) * K, (lat - 23) * K, z + 0.1);
};

type LightingMode = "night" | "dawn" | "day";

const LIGHTING_CONFIG: Record<LightingMode, {
  bg: string;
  fieldColor: string;
  dotBaseColor: string;
  dotPeakColor: string;
  coastColor: string;
  routeColor: string;
  haloColor: string;
  label: string;
}> = {
  night: {
    bg: "#040814",
    fieldColor: "#7d97ff",
    dotBaseColor: "#8f7035",
    dotPeakColor: "#fff4d0",
    coastColor: "#4be1bd",
    routeColor: "#f7cf68",
    haloColor: "#e6b85c",
    label: "ليل الصحراء المرصع بالنجوم",
  },
  dawn: {
    bg: "#150b10",
    fieldColor: "#ffaa70",
    dotBaseColor: "#a36630",
    dotPeakColor: "#ffe8bd",
    coastColor: "#e88f54",
    routeColor: "#ffd67a",
    haloColor: "#ff9f43",
    label: "شروق فجر الرسالة",
  },
  day: {
    bg: "#18140e",
    fieldColor: "#e3b878",
    dotBaseColor: "#9c7638",
    dotPeakColor: "#ffffff",
    coastColor: "#38bdf8",
    routeColor: "#ffd43f",
    haloColor: "#f59e0b",
    label: "صفاء ضحى الحجاز",
  },
};

const MAJOR_ROUTES = [
  { id: 4, name: "رحلة الشام وبحيرى", from: "مكة", to: "بصرى الشام", dist: "١,٢٥٠ كم" },
  { id: 11, name: "الهجرة إلى الحبشة", from: "مكة", to: "أكسوم", dist: "٨٥٠ كم" },
  { id: 15, name: "الإسراء والمعراج", from: "مكة", to: "بيت المقدس", dist: "١,٢٤٠ كم" },
  { id: 17, name: "طريق الهجرة المباركة", from: "مكة", to: "المدينة", dist: "٤٨٠ كم" },
  { id: 19, name: "غزوة بدر الكبرى", from: "المدينة", to: "بدر", dist: "١٦٠ كم" },
  { id: 20, name: "غزوة أحد", from: "المدينة", to: "جبل أحد", dist: "٥ كم" },
  { id: 22, name: "صلح الحديبية", from: "المدينة", to: "الحديبية", dist: "٤٢٠ كم" },
  { id: 23, name: "غزوة خيبر", from: "المدينة", to: "خيبر", dist: "١٧٠ كم" },
  { id: 24, name: "غزوة مؤتة", from: "المدينة", to: "مؤتة", dist: "٩٥٠ كم" },
  { id: 25, name: "فتح مكة الأعظم", from: "المدينة", to: "مكة", dist: "٤٥٠ كم" },
  { id: 26, name: "غزوة حنين والطائف", from: "مكة", to: "الطائف", dist: "١٢٠ كم" },
  { id: 27, name: "غزوة تبوك", from: "المدينة", to: "تبوك", dist: "٧٠٠ كم" },
  { id: 29, name: "حجة الوداع الكبرى", from: "المدينة", to: "المشاعر", dist: "٤٥٠ كم" },
];

function AtlasCanvasContent({
  lighting,
  selectedStationId,
  selectedRouteId,
  onSelectStation,
  cameraTrigger,
}: {
  lighting: LightingMode;
  selectedStationId: number | null;
  selectedRouteId: number | null;
  onSelectStation: (id: number) => void;
  cameraTrigger: number;
}) {
  const { camera, gl } = useThree();
  const cfg = LIGHTING_CONFIG[lighting];

  // Orbit state
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const spherical = useRef({ radius: 12, theta: 0, phi: Math.PI / 3.4 });
  const targetLook = useRef(new THREE.Vector3(-1.15, -0.05, 0.3));
  const currentLook = useRef(new THREE.Vector3(-1.15, -0.05, 0.3));
  const currentCamPos = useRef(new THREE.Vector3(-1.15, -6.5, 9.5));

  // Glow textures
  const dotTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.35, "rgba(255,255,255,0.7)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  const ringTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 128, 128);
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 6;
    g.beginPath();
    g.arc(64, 64, 48, 0, Math.PI * 2);
    g.stroke();
    return new THREE.CanvasTexture(c);
  }, []);

  // Topographic dots
  const mapGeo = useRef(new THREE.BufferGeometry());
  const coastGeo = useRef(new THREE.BufferGeometry());

  useEffect(() => {
    fetch("/data/arabia-dots.json")
      .then((r) => r.json())
      .then((d: [number, number][]) => {
        const dotSet = new Set(d.map(([lng, lat]) => `${lng.toFixed(1)},${lat.toFixed(1)}`));
        const coastPoints: number[] = [];
        const positions = new Float32Array(d.length * 3);
        const colors = new Float32Array(d.length * 3);

        const baseCol = new THREE.Color(cfg.dotBaseColor);
        const peakCol = new THREE.Color(cfg.dotPeakColor);
        const cTmp = new THREE.Color();

        d.forEach(([lng, lat], i) => {
          const elev = getElevation(lng, lat);
          const x = (lng - 41) * K;
          const y = (lat - 23) * K;
          const z = elev * 1.1;

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;

          const t = Math.min(1, elev / 0.65);
          cTmp.copy(baseCol).lerp(peakCol, t);
          colors[i * 3] = cTmp.r;
          colors[i * 3 + 1] = cTmp.g;
          colors[i * 3 + 2] = cTmp.b;

          const neighbors = [
            `${(lng + 0.3).toFixed(1)},${lat.toFixed(1)}`,
            `${(lng - 0.3).toFixed(1)},${lat.toFixed(1)}`,
            `${lng.toFixed(1)},${(lat + 0.3).toFixed(1)}`,
            `${lng.toFixed(1)},${(lat - 0.3).toFixed(1)}`,
          ];
          if (neighbors.some((k) => !dotSet.has(k))) {
            coastPoints.push(x, y, z + 0.02);
          }
        });

        mapGeo.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        mapGeo.current.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        mapGeo.current.computeBoundingSphere();

        coastGeo.current.setAttribute("position", new THREE.BufferAttribute(new Float32Array(coastPoints), 3));
        coastGeo.current.computeBoundingSphere();
      });
  }, [cfg]);

  // Handle fly-to station or route
  useEffect(() => {
    if (selectedRouteId) {
      const pts = geo[selectedRouteId];
      if (pts && pts.length > 0) {
        // Average midpoint
        const midLat = pts.reduce((acc, p) => acc + p.p[0], 0) / pts.length;
        const midLng = pts.reduce((acc, p) => acc + p.p[1], 0) / pts.length;
        const pos = to3D([midLat, midLng]);
        targetLook.current.set(pos.x, pos.y, pos.z);
        spherical.current.radius = Math.max(7, Math.min(14, pts.length * 1.8));
      }
    } else if (selectedStationId) {
      const s = allStationsAtlas.find((st) => st.id === selectedStationId);
      if (s) {
        const pos = to3D(s.p);
        targetLook.current.set(pos.x, pos.y, pos.z);
        spherical.current.radius = 6.2;
      }
    }
  }, [selectedStationId, selectedRouteId, cameraTrigger]);

  // Pointer drag controls
  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevPointer.current.x;
      const dy = e.clientY - prevPointer.current.y;
      prevPointer.current = { x: e.clientX, y: e.clientY };

      spherical.current.theta -= dx * 0.006;
      spherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2.1, spherical.current.phi - dy * 0.005));
    };
    const onUp = () => {
      isDragging.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.current.radius = Math.max(3.5, Math.min(22, spherical.current.radius + e.deltaY * 0.01));
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  // Route lines
  const activeRoutePts = useMemo(() => {
    if (!selectedRouteId) return [];
    const pts = geo[selectedRouteId];
    if (!pts || pts.length < 2) return [];

    const wp = pts.map((p) => to3D(p.p));
    const curve = new THREE.CatmullRomCurve3(
      wp.map((v, i) => {
        const arch = Math.sin((i / (wp.length - 1)) * Math.PI) * 0.35;
        return new THREE.Vector3(v.x, v.y, v.z + arch);
      }),
      false,
      "catmullrom",
      0.35
    );
    return curve.getPoints(120);
  }, [selectedRouteId]);

  const routeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    if (activeRoutePts.length > 0) {
      const arr = new Float32Array(activeRoutePts.length * 3);
      activeRoutePts.forEach((p, i) => {
        arr[i * 3] = p.x;
        arr[i * 3 + 1] = p.y;
        arr[i * 3 + 2] = p.z;
      });
      g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    }
    return g;
  }, [activeRoutePts]);

  // Waypoints for selected route
  const routeWaypoints = useMemo(() => {
    if (!selectedRouteId) return [];
    return geo[selectedRouteId] ?? [];
  }, [selectedRouteId]);

  // Animation frame
  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.001, dt);
    const time = state.clock.getElapsedTime();

    // Smooth spherical camera calculation
    currentLook.current.lerp(targetLook.current, k * 0.25);
    const { radius, theta, phi } = spherical.current;
    const wantX = currentLook.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const wantY = currentLook.current.y - radius * Math.sin(phi) * Math.cos(theta);
    const wantZ = currentLook.current.z + radius * Math.cos(phi);

    currentCamPos.current.lerp(new THREE.Vector3(wantX, wantY, wantZ), k * 0.25);
    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLook.current);
  });

  return (
    <>
      <ambientLight intensity={0.6} />

      {/* 3D Topographic Terrain Point Cloud */}
      <points geometry={mapGeo.current}>
        <pointsMaterial map={dotTex} size={0.16} vertexColors sizeAttenuation transparent opacity={0.88} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Luminous Coastline Glow */}
      <points geometry={coastGeo.current}>
        <pointsMaterial map={dotTex} size={0.25} color={cfg.coastColor} sizeAttenuation transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Active Route Laser Line */}
      {activeRoutePts.length > 0 && (
        <>
          <primitive
            object={
              new THREE.Line(
                routeGeo,
                new THREE.LineBasicMaterial({
                  color: cfg.routeColor,
                  transparent: true,
                  opacity: 0.95,
                  linewidth: 2,
                })
              )
            }
          />
          {/* Luminous Waypoint Light Pillars */}
          {routeWaypoints.map((wp, i) => {
            const v = to3D(wp.p);
            const lineG = new THREE.BufferGeometry().setFromPoints([
              v,
              new THREE.Vector3(v.x, v.y, v.z + 1.8),
            ]);
            return (
              <primitive
                key={i}
                object={
                  new THREE.Line(
                    lineG,
                    new THREE.LineBasicMaterial({
                      color: cfg.routeColor,
                      transparent: true,
                      opacity: 0.8,
                    })
                  )
                }
              />
            );
          })}
        </>
      )}

      {/* Station Markers in 3D Space */}
      {allStationsAtlas.map((st) => {
        const v = to3D(st.p);
        const isSelected = selectedStationId === st.id;
        const eraColor = eraHex[eraOf(st.category)]?.dark ?? "#e6b85c";

        return (
          <group key={st.id} position={[v.x, v.y, v.z]}>
            {/* Core glowing marker */}
            <mesh onClick={() => onSelectStation(st.id)}>
              <sphereGeometry args={[isSelected ? 0.22 : 0.14, 16, 16]} />
              <meshBasicMaterial color={isSelected ? "#ffffff" : eraColor} transparent opacity={0.95} />
            </mesh>

            {/* Pulsing beacon halo */}
            <mesh position={[0, 0, 0.02]}>
              <ringGeometry args={[isSelected ? 0.35 : 0.22, isSelected ? 0.48 : 0.32, 24]} />
              <meshBasicMaterial color={isSelected ? "#ffffff" : eraColor} transparent opacity={isSelected ? 0.85 : 0.4} side={THREE.DoubleSide} />
            </mesh>

            {/* Vertical Sacred Beacon for Selected */}
            {isSelected && (
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(0, 0, 2.5),
                    ]),
                    new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9 })
                  )
                }
              />
            )}
          </group>
        );
      })}
    </>
  );
}

export default function SeerahAtlasModal() {
  const isOpen = useAppStore((s) => s.atlasModalOpen);
  const initialStationId = useAppStore((s) => s.atlasStationId);
  const closeAtlasModal = useAppStore((s) => s.closeAtlasModal);
  const openReadingDrawer = useAppStore((s) => s.openReadingDrawer);

  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era | "all">("all");
  const [lighting, setLighting] = useState<LightingMode>("night");
  const [cameraTrigger, setCameraTrigger] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialStationId) {
        setSelectedStationId(initialStationId);
        // If station has route, activate its route
        if (geo[initialStationId] && geo[initialStationId].length > 1) {
          setSelectedRouteId(initialStationId);
        } else {
          setSelectedRouteId(null);
        }
      } else {
        setSelectedStationId(4); // Default to Bahira route
        setSelectedRouteId(4);
      }
      setCameraTrigger((c) => c + 1);
    }
  }, [isOpen, initialStationId]);

  if (!isOpen) return null;

  const currentStation = selectedStationId ? stations.find((s) => s.id === selectedStationId) : null;
  const currentMeta = selectedStationId ? geoMeta[selectedStationId] : null;
  const currentWaypoints = selectedStationId ? geo[selectedStationId] ?? [] : [];

  const filteredStations = allStationsAtlas.filter((s) => {
    if (selectedEra === "all") return true;
    return eraOf(s.category) === selectedEra;
  });

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-300"
      style={{ background: LIGHTING_CONFIG[lighting].bg }}
    >
      {/* Top Header HUD Bar */}
      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 shadow-md"
        style={{
          background: "rgba(6, 10, 22, 0.95)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border shrink-0"
            style={{
              borderColor: "rgba(230, 184, 92, 0.5)",
              background: "radial-gradient(circle, rgba(230, 184, 92, 0.3), transparent)",
              color: "#e6b85c",
            }}
          >
            <Compass size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-wide" style={{ color: "#ffffff" }}>
                أطلس السيرة النبوية ثلاثي الأبعاد
              </h1>
              <span className="hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-ui border border-amber-500/40 text-amber-300 bg-amber-500/20">
                خريطة تفاعلية حية
              </span>
            </div>
            <p className="text-xs font-ui hidden sm:block" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              استكشف دروب قوافل الجزيرة العربية ومسارات الهجرة والغزوات الكبرى مع التضاريس الحقيقية
            </p>
          </div>
        </div>

        {/* Lighting Atmosphere Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setLighting("night")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-ui transition-all ${
              lighting === "night" ? "bg-indigo-600/60 text-white shadow-sm" : "text-white/60 hover:text-white"
            }`}
            title="ليل الصحراء المرصع بالنجوم"
          >
            <Moon size={14} />
            <span className="hidden md:inline">ليل الصحراء</span>
          </button>
          <button
            onClick={() => setLighting("dawn")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-ui transition-all ${
              lighting === "dawn" ? "bg-amber-600/60 text-white shadow-sm" : "text-white/60 hover:text-white"
            }`}
            title="شروق فجر الرسالة"
          >
            <Sunset size={14} />
            <span className="hidden md:inline">الفجر الذهبي</span>
          </button>
          <button
            onClick={() => setLighting("day")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-ui transition-all ${
              lighting === "day" ? "bg-amber-500/70 text-black font-semibold shadow-sm" : "text-white/60 hover:text-white"
            }`}
            title="صفاء ضحى الحجاز"
          >
            <Sun size={14} />
            <span className="hidden md:inline">الضحى والصفاء</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={closeAtlasModal}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
          title="إغلاق الخريطة (Esc)"
        >
          <X size={20} />
        </button>
      </header>

      {/* Era filter bar */}
      <div
        className="relative z-10 flex overflow-x-auto border-b px-4 py-2 scrollbar-none gap-2"
        style={{
          background: "rgba(5, 10, 20, 0.65)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255, 255, 255, 0.06)",
        }}
      >
        <button
          onClick={() => setSelectedEra("all")}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-ui transition-all ${
            selectedEra === "all"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold"
              : "text-white/60 hover:text-white border border-transparent"
          }`}
        >
          كافة الحِقب ({allStationsAtlas.length})
        </button>
        {(["dawn", "night", "hijra", "madina", "victory", "farewell"] as Era[]).map((e) => (
          <button
            key={e}
            onClick={() => setSelectedEra(e)}
            className={`shrink-0 rounded-lg px-3 py-1 text-xs font-ui transition-all ${
              selectedEra === e
                ? "bg-white/15 text-white border border-white/20 font-semibold"
                : "text-white/60 hover:text-white border border-transparent"
            }`}
          >
            {eraNames[e]}
          </button>
        ))}
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative flex-1 w-full min-h-0 overflow-hidden">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 45, position: [-1.15, -6.5, 9.5] }}
        >
          <AtlasCanvasContent
            lighting={lighting}
            selectedStationId={selectedStationId}
            selectedRouteId={selectedRouteId}
            onSelectStation={(id) => {
              setSelectedStationId(id);
              if (geo[id] && geo[id].length > 1) {
                setSelectedRouteId(id);
              }
              setCameraTrigger((c) => c + 1);
            }}
            cameraTrigger={cameraTrigger}
          />
        </Canvas>

        {/* Floating Instruction Overlay (shows subtly at top left) */}
        <div className="absolute top-4 start-4 z-10 pointer-events-none hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-ui text-white/70 backdrop-blur-md">
          <RotateCcw size={13} className="text-amber-400" />
          <span>اسحب للتدوير · عجلة الفأرة للتكبير والاقتراب · انقر على أي محطة</span>
        </div>

        {/* On-Screen Camera Controls (Right Side) */}
        <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => {
              setSelectedStationId(null);
              setSelectedRouteId(null);
              setCameraTrigger((c) => c + 1);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/50 text-white/80 transition-all hover:bg-white/20 hover:text-white backdrop-blur-md"
            title="إعادة ضبط الرؤية الشاملة"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Station Detail Floating Glass Card (When a station is active) */}
        {currentStation && (
          <div
            className="absolute top-4 start-4 md:start-6 z-20 w-[92vw] sm:w-[380px] md:w-[410px] max-h-[82vh] overflow-y-auto rounded-3xl border p-5 md:p-6 shadow-2xl transition-all backdrop-blur-2xl"
            style={{
              background: "rgba(12, 18, 34, 0.88)",
              borderColor: "rgba(230, 184, 92, 0.35)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-ui font-semibold border border-amber-400/30 text-amber-300 bg-amber-400/10">
                <Sparkles size={12} />
                المحطة {ar(currentStation.id)} · {eraNames[eraOf(currentStation.category)]}
              </span>
              <span className="font-ui text-xs text-white/60">
                {arYear(currentStation.year)} ({ar(currentStation.hijriYear)})
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-white mb-2">
              {currentStation.title}
            </h2>

            {/* Location subtitle */}
            <p className="flex items-center gap-1.5 font-ui text-xs text-amber-200/80 mb-4">
              <MapPin size={14} className="text-amber-400 shrink-0" />
              <span>{currentStation.location}</span>
            </p>

            {/* Travel Telemetry Strip */}
            {currentMeta && (currentMeta.distance || currentMeta.terrain) && (
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-ui">
                {currentMeta.distance && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/50 flex items-center gap-1">
                      <Navigation size={11} className="text-amber-400" />
                      المسافة المقدرة
                    </span>
                    <span className="font-bold text-white text-sm">{currentMeta.distance}</span>
                  </div>
                )}
                {currentMeta.duration && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/50 flex items-center gap-1">
                      <Clock size={11} className="text-amber-400" />
                      مدة المسير
                    </span>
                    <span className="font-bold text-white text-sm">{currentMeta.duration}</span>
                  </div>
                )}
                {currentMeta.terrain && (
                  <div className="col-span-2 pt-1.5 border-t border-white/10 flex flex-col gap-0.5">
                    <span className="text-white/50 flex items-center gap-1">
                      <Mountain size={11} className="text-amber-400" />
                      طبيعة التضاريس والمسار
                    </span>
                    <span className="text-white/90 leading-relaxed">{currentMeta.terrain}</span>
                  </div>
                )}
              </div>
            )}

            {/* Waypoint Stepper for Routes */}
            {currentWaypoints.length > 1 && (
              <div className="mb-4">
                <p className="text-xs font-ui text-white/50 mb-2 flex items-center gap-1.5">
                  <RouteIcon size={13} className="text-amber-400" />
                  المحطات المرحلية على الدرب ({ar(currentWaypoints.length)} محطات):
                </p>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pe-1 scrollbar-thin">
                  {currentWaypoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/5 p-2 text-xs"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                        {ar(idx + 1)}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{wp.n}</span>
                        {wp.desc && <span className="text-white/60 text-[11px] leading-tight block mt-0.5">{wp.desc}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description excerpt */}
            <p className="font-text text-sm leading-relaxed text-white/85 mb-5 line-clamp-3">
              {currentStation.description}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  closeAtlasModal();
                  openReadingDrawer(currentStation.id);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-ui font-semibold text-black transition-all hover:brightness-110 shadow-lg shadow-amber-500/20"
              >
                <BookOpen size={15} />
                اقرأ نص ابن هشام كاملاً
              </button>
            </div>
          </div>
        )}

        {/* Bottom Historical Routes Carousel Tray */}
        <div
          className="absolute bottom-4 inset-x-4 md:inset-x-8 z-20 rounded-2xl border p-3 backdrop-blur-xl"
          style={{
            background: "rgba(8, 14, 28, 0.82)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-ui text-xs font-semibold text-white/70 flex items-center gap-1.5">
              <RouteIcon size={14} className="text-amber-400" />
              أبرز مسارات وقوافل السيرة النبوية (انقر لتتبع المسار ثلاثي الأبعاد):
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {MAJOR_ROUTES.map((r) => {
              const isSelected = selectedRouteId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRouteId(r.id);
                    setSelectedStationId(r.id);
                    setCameraTrigger((c) => c + 1);
                  }}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-start transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/20 text-white shadow-md shadow-amber-400/10 font-bold"
                      : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? "bg-amber-400 text-black" : "bg-white/10 text-amber-300"
                    }`}
                  >
                    <Navigation size={13} />
                  </div>
                  <div className="flex flex-col text-xs font-ui leading-tight">
                    <span className="text-white font-medium">{r.name}</span>
                    <span className="text-white/50 text-[10px]">
                      {r.from} ⟵ {r.to} ({r.dist})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

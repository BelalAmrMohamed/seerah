import React, { useMemo, useState } from "react";
import { I18nManager, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import dots from "@/data/arabia-dots.json";
import { geo } from "@/data/geo";
import { alpha, useTheme } from "@/lib/theme";
import { Txt } from "./ui";

const DOTS = dots as [number, number][];
// RN swaps left/right in RTL; the map is geographic, so we want PHYSICAL left.
const physLeft = (x: number) => (I18nManager.isRTL ? { right: x } : { left: x });

/** Native stand-in for the website's 3D dot-matrix map: dotted Arabia + the station's route. */
export default function RouteMap({ stationId, color, height = 230 }: { stationId: number; color: string; height?: number }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const pts = geo[stationId] ?? [];

  const view = useMemo(() => {
    const lngs = pts.map((p) => p.p[1]);
    const lats = pts.map((p) => p.p[0]);
    const cx = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const cy = (Math.min(...lats) + Math.max(...lats)) / 2;
    const span = Math.max(Math.max(...lngs) - Math.min(...lngs), Math.max(...lats) - Math.min(...lats));
    const degW = Math.max(span * 1.5, 5);
    return { cx, cy, degW };
  }, [pts]);

  const onLayout = (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width));
  const degH = (view.degW * height) / Math.max(w, 1);
  const px = (lng: number) => ((lng - (view.cx - view.degW / 2)) / view.degW) * w;
  const py = (lat: number) => ((view.cy + degH / 2 - lat) / degH) * height;

  const dotPath = useMemo(() => {
    if (!w) return "";
    const x0 = view.cx - view.degW / 2 - 0.5, x1 = view.cx + view.degW / 2 + 0.5;
    const y0 = view.cy - degH / 2 - 0.5, y1 = view.cy + degH / 2 + 0.5;
    let d = "";
    for (const [lng, lat] of DOTS) {
      if (lng < x0 || lng > x1 || lat < y0 || lat > y1) continue;
      d += `M${px(lng).toFixed(1)} ${py(lat).toFixed(1)}h0`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, view, height]);

  if (!pts.length) return null;
  const xy = pts.map((p) => ({ x: px(p.p[1]), y: py(p.p[0]), n: p.n }));
  let line = "";
  if (w && xy.length === 2) {
    const mx = (xy[0].x + xy[1].x) / 2, my = (xy[0].y + xy[1].y) / 2 - 28;
    line = `M${xy[0].x} ${xy[0].y} Q${mx} ${my} ${xy[1].x} ${xy[1].y}`;
  } else if (w && xy.length > 2) {
    line = xy.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  }

  return (
    <View onLayout={onLayout} style={{ height, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: c.glassBorder, backgroundColor: alpha(c.bg, 0.5) }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Path d={dotPath} stroke={color} strokeOpacity={0.4} strokeWidth={2.4} strokeLinecap="round" />
          {line ? <Path d={line} stroke={color} strokeWidth={2} strokeDasharray="6 5" fill="none" /> : null}
          {xy.map((p, i) => (
            <React.Fragment key={i}>
              <Circle cx={p.x} cy={p.y} r={9} fill={color} fillOpacity={0.2} />
              <Circle cx={p.x} cy={p.y} r={4.5} fill={color} />
            </React.Fragment>
          ))}
        </Svg>
      )}
      {w > 0 && xy.map((p, i) => (
        <Txt key={`l${i}`} v="uiMedium" size={11.5} color={c.ink} style={{ position: "absolute", ...physLeft(Math.min(Math.max(p.x - 40, 4), w - 84)), top: Math.min(p.y + 10, height - 24), width: 80, textAlign: "center", lineHeight: 16 }}>
          {p.n}
        </Txt>
      ))}
    </View>
  );
}

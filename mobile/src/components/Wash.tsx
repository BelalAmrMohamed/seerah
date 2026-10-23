import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { alpha } from "@/lib/theme";

/** The website's era "wash" + radial glow, approximated with two gradients. */
export default function Wash({ wash, era, height = 360 }: { wash: string; era: string; height?: number }) {
  return (
    <>
      <LinearGradient pointerEvents="none" colors={[wash, "transparent"]} style={[StyleSheet.absoluteFill, { height }]} />
      <LinearGradient pointerEvents="none" colors={[alpha(era, 0.16), "transparent"]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.8 }} style={[StyleSheet.absoluteFill, { height }]} />
    </>
  );
}

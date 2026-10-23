import React, { useEffect } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { alpha, useEra, useTheme } from "@/lib/theme";
import { Txt } from "./ui";

export default function Hero() {
  const { c } = useTheme();
  const { era: col, wash } = useEra("dawn");
  const { height } = useWindowDimensions();
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.12, { duration: 2600, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) })), -1);
  }, [pulse]);
  const orb = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <View style={{ minHeight: Math.max(height * 0.74, 480), alignItems: "center", justifyContent: "center", overflow: "hidden", paddingHorizontal: 24 }}>
      <LinearGradient pointerEvents="none" colors={[wash, "transparent"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: "70%" }} />
      <Animated.View style={[{ position: "absolute", width: 280, height: 280, borderRadius: 140, backgroundColor: alpha(col, 0.16), shadowColor: col, shadowOpacity: 0.8, shadowRadius: 60 }, orb]} />
      <View style={{ alignItems: "center", gap: 18 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {["رحلة", "في", "السيرة"].map((w, i) => (
            <Animated.View key={w} entering={FadeInDown.delay(300 + i * 220).duration(900)}>
              <Txt v="display" size={52} color={c.ink} style={{ lineHeight: 84 }}>{w}</Txt>
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={FadeIn.delay(1300).duration(900)}>
          <Txt v="text" size={21} color={c.muted} center style={{ maxWidth: 300 }}>ثلاثون محطة من السيرة النبوية لابن هشام، من عام الفيل إلى الرفيق الأعلى</Txt>
        </Animated.View>
      </View>
      <Animated.View entering={FadeIn.delay(1700).duration(900)} style={{ position: "absolute", bottom: 24, alignItems: "center", gap: 8 }}>
        <Txt v="ui" size={13} color={c.muted}>انزل لتبدأ الرحلة</Txt>
        <View style={{ width: 1, height: 36, backgroundColor: c.accent, opacity: 0.7 }} />
      </Animated.View>
    </View>
  );
}

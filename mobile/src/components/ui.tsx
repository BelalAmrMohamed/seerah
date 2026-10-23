import React from "react";
import { Pressable, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { alpha, fonts, useTheme } from "@/lib/theme";

type Variant = "display" | "text" | "textBold" | "ui" | "uiMedium" | "uiSemi" | "uiBold";
const lh: Record<Variant, number> = { display: 1.65, text: 1.9, textBold: 1.9, ui: 1.7, uiMedium: 1.7, uiSemi: 1.7, uiBold: 1.7 };

export type TxtProps = TextProps & { v?: Variant; size?: number; color?: string; center?: boolean };
export function Txt({ v = "ui", size = 15, color, center, style, ...rest }: TxtProps) {
  const { c } = useTheme();
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fonts[v], fontSize: size, lineHeight: Math.round(size * lh[v]), color: color ?? c.ink, writingDirection: "rtl" }, center && { textAlign: "center" }, style]}
    />
  );
}

export function Card({ children, style, era }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; era?: string }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: c.panel, borderColor: era ? alpha(era, 0.35) : c.glassBorder, borderWidth: 1, borderRadius: 20, padding: 18 }, style]}>
      {children}
    </View>
  );
}

export function Chip({ label, color, active, onPress, dot, style }: { label: string; color?: string; active?: boolean; onPress?: () => void; dot?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const col = color ?? c.accent;
  const body = (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1,
          borderColor: active ? col : c.line, backgroundColor: active ? alpha(col, 0.22) : "transparent" },
        style,
      ]}
    >
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />}
      <Txt v={active ? "uiSemi" : "ui"} size={12.5} color={active ? col : c.muted}>{label}</Txt>
    </View>
  );
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button">{body}</Pressable> : body;
}

export function Btn({ label, icon, onPress, primary, color, small, disabled, style }: {
  label: string; icon?: keyof typeof Feather.glyphMap; onPress?: () => void; primary?: boolean; color?: string; small?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const col = color ?? c.accent;
  const fg = primary ? c.onAccent : col;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, paddingHorizontal: small ? 14 : 20, paddingVertical: small ? 8 : 12,
          borderWidth: 1, borderColor: primary ? col : alpha(col, 0.45), backgroundColor: primary ? col : "transparent", opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {icon && <Feather name={icon} size={small ? 14 : 16} color={fg} />}
      <Txt v="uiSemi" size={small ? 12.5 : 14} color={fg}>{label}</Txt>
    </Pressable>
  );
}

export function IconBtn({ name, onPress, label, color, size = 20, active, style, ...rest }: {
  name: keyof typeof Feather.glyphMap; onPress?: () => void; label: string; color?: string; size?: number; active?: boolean; style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, "style" | "onPress">) {
  const { c } = useTheme();
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: active ? alpha(c.accent, 0.18) : pressed ? alpha(c.ink, 0.08) : "transparent" }, style]}
    >
      <Feather name={name} size={size} color={color ?? (active ? c.accent : c.ink)} />
    </Pressable>
  );
}

export function SectionTitle({ icon, children, color }: { icon: keyof typeof Feather.glyphMap; children: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Feather name={icon} size={20} color={color} />
      <Txt v="display" size={22} color={color}>{children}</Txt>
    </View>
  );
}

export const textStyle = (s: TextStyle) => s;

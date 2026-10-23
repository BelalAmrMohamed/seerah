import React from "react";
import { Linking, View } from "react-native";
import { router } from "expo-router";
import { alpha, useEra, useTheme } from "@/lib/theme";
import { SHAMELA_BOOK_URL } from "@/lib/env";
import { Btn, Card, Txt } from "./ui";
import Wash from "./Wash";

export default function JourneyFooter({ onTop }: { onTop: () => void }) {
  const { c } = useTheme();
  const { era: col, wash } = useEra("farewell");
  return (
    <View style={{ overflow: "hidden", paddingVertical: 56, paddingHorizontal: 20, alignItems: "center", gap: 26 }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: alpha(col, 0.7) }} />
      <Wash wash={wash} era={col} height={380} />
      <Txt v="display" size={36} center style={{ lineHeight: 62 }}>انتهت الرحلة، وبقي الأثر</Txt>
      <Txt v="text" size={17} color={c.muted} center>
        النصوص مأخوذة من كتاب «السيرة النبوية» لابن هشام، وروابط كل محطة تفتح صفحتها في{" "}
        <Txt v="text" size={17} color={col} style={{ textDecorationLine: "underline" }} onPress={() => Linking.openURL(SHAMELA_BOOK_URL)}>المكتبة الشاملة</Txt>.
      </Txt>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
        <Btn primary icon="arrow-up" label="العودة إلى البداية" color={col} onPress={onTop} />
        <Btn icon="book-open" label="استكشف المحطات" color={col} onPress={() => router.navigate("/explore")} />
      </View>
      <View style={{ width: 96, height: 1, backgroundColor: c.line }} />
      <Card style={{ alignSelf: "stretch", alignItems: "center", gap: 6, padding: 14 }}>
        <Txt v="ui" size={12} color={c.muted}>فكرة وتصميم وتطوير</Txt>
        <Txt v="display" size={19} color={c.accent}>بلال عمرو محمد · Belal Amr Mohamed</Txt>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 14 }}>
          <Txt v="ui" size={12} style={{ textDecorationLine: "underline" }} onPress={() => Linking.openURL("https://belal-amr.vercel.app")}>belal-amr.vercel.app</Txt>
          <Txt v="ui" size={12} color={c.line}>|</Txt>
          <Txt v="ui" size={12} style={{ textDecorationLine: "underline" }} onPress={() => Linking.openURL("mailto:belalamrofficial@gmail.com")}>belalamrofficial@gmail.com</Txt>
        </View>
      </Card>
      <Txt v="ui" size={11.5} color={c.muted}>© {new Date().getFullYear()} رحلة في السيرة</Txt>
    </View>
  );
}

import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import Screen, { AppBar } from "@/components/Screen";
import { Btn, Card, Txt } from "@/components/ui";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";
import { useAppStore } from "@/lib/appStore";
import { toast } from "@/lib/toast";
import { alpha, fonts, useTheme } from "@/lib/theme";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { c } = useTheme();
  const setUser = useAppStore((s) => s.setUser);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "info" | "warning"; text: string } | null>(null);

  const input = { fontFamily: fonts.ui, fontSize: 15, color: c.ink, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 } as const;

  const submit = async () => {
    if (!supabaseConfigured) { setAlert({ type: "error", text: "لم يتم ضبط إعدادات Supabase في التطبيق." }); return; }
    setLoading(true); setAlert(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setAlert({ type: "warning", text: "هذا البريد الإلكتروني مسجل مسبقاً! إذا كنت قد سجلت عبر Google سابقاً، يرجى تسجيل الدخول بالضغط على «المتابعة مع Google» بالأسفل." });
          setMode("login"); return;
        }
        if (data.user && !data.session) {
          setAlert({ type: "info", text: "تم إنشاء الحساب بنجاح! أرسلنا رابط تأكيد إلى بريدك الإلكتروني. تنبيه: قد تتأخر الرسالة بسبب قيود مزود البريد (Rate Limit) أو تصل لمجلد الرسائل غير المرغوب فيها (Spam). كما يمكنك الدخول فوراً عبر Google." });
          setMode("login"); return;
        }
        if (data.session && data.user) { setUser({ id: data.user.id, email: data.user.email!, name }); toast.success("تم إنشاء الحساب بنجاح"); router.replace("/"); }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) { setUser({ id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.full_name }); toast.success("تم تسجيل الدخول بنجاح"); router.replace("/"); }
      }
    } catch (e) {
      const t = getFriendlyAuthErrorMessage(e); setAlert({ type: "error", text: t }); toast.error(t);
    } finally { setLoading(false); }
  };

  // Needs "seerah://auth/callback" in Supabase → Auth → URL Configuration → Redirect URLs.
  const google = async () => {
    if (!supabaseConfigured) { setAlert({ type: "error", text: "لم يتم ضبط إعدادات Supabase في التطبيق." }); return; }
    setAlert(null);
    try {
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } });
      if (error || !data.url) throw error ?? new Error("oauth");
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type === "success") {
        const code = new URL(res.url).searchParams.get("code");
        if (code) {
          const { error: e2 } = await supabase.auth.exchangeCodeForSession(code);
          if (e2) throw e2;
          toast.success("تم تسجيل الدخول بنجاح"); router.replace("/");
        } else { setAlert({ type: "error", text: "لم يتم استلام رمز الدخول من Google. تأكد من إضافة seerah://auth/callback في Supabase." }); }
      } else { toast.info("تم إلغاء تسجيل الدخول"); }
    } catch (e) { const t = getFriendlyAuthErrorMessage(e); setAlert({ type: "error", text: t }); toast.error(t); }
  };

  const tint = alert?.type === "error" ? c.error : alert?.type === "warning" ? c.warning : c.accent;
  return (
    <Screen>
      <AppBar back showTools={false} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
          <Txt v="display" size={36} color={c.accent} center style={{ lineHeight: 58 }}>رحلة في السيرة</Txt>
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", gap: 4, backgroundColor: c.bg, borderRadius: 14, padding: 4 }}>
              {(["login", "signup"] as const).map((m) => (
                <Pressable key={m} onPress={() => { setMode(m); setAlert(null); }} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: mode === m ? c.solid : "transparent" }}>
                  <Txt v="uiMedium" size={14} center color={mode === m ? c.ink : c.muted}>{m === "login" ? "تسجيل الدخول" : "حساب جديد"}</Txt>
                </Pressable>
              ))}
            </View>
            {alert && (
              <View style={{ borderWidth: 1, borderColor: alpha(tint, 0.45), backgroundColor: alpha(tint, 0.12), borderRadius: 16, padding: 12 }}>
                <Txt v="ui" size={13}>{alert.text}</Txt>
              </View>
            )}
            {mode === "signup" && (<View style={{ gap: 6 }}><Txt v="uiMedium" size={13} color={c.muted}>الاسم</Txt><TextInput style={input} value={name} onChangeText={setName} placeholder="اسمك الكريم" placeholderTextColor={c.muted} /></View>)}
            <View style={{ gap: 6 }}><Txt v="uiMedium" size={13} color={c.muted}>البريد الإلكتروني</Txt>
              <TextInput style={[input, { textAlign: "left" }]} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={c.muted} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /></View>
            <View style={{ gap: 6 }}><Txt v="uiMedium" size={13} color={c.muted}>كلمة المرور</Txt>
              <TextInput style={[input, { textAlign: "left" }]} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={c.muted} secureTextEntry autoCapitalize="none" /></View>
            <Btn primary label={loading ? "…" : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"} disabled={loading || !email || password.length < 6} onPress={submit} />
            <Txt v="ui" size={12} color={c.muted} center>أو</Txt>
            <Btn icon="log-in" label="المتابعة مع Google" onPress={google} />
            <Txt v="ui" size={13} color={c.muted} center style={{ textDecorationLine: "underline" }} onPress={() => router.replace("/")}>تصفح كزائر بدون حساب</Txt>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

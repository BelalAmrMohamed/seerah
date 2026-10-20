import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react-native";
import { supabase } from "../src/lib/supabase";
import { colors, fonts } from "../src/lib/theme";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "info" | "success";
    text: string;
  } | null>(null);

  const getFriendlyAuthErrorMessage = (err: unknown): string => {
    if (!(err instanceof Error))
      return "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.";
    const msg = err.message || "";
    const lower = msg.toLowerCase();

    if (
      lower.includes("rate limit") ||
      lower.includes("rate_limit") ||
      lower.includes("too many requests") ||
      lower.includes("over_email_send_rate_limit")
    ) {
      return "تم تجاوز الحد المسموح لإرسال الرسائل. يرجى الانتظار بضع دقائق والمحاولة ثانية.";
    }
    if (
      lower.includes("for security purposes") ||
      lower.includes("once every")
    ) {
      return "لدواعي الأمان، يسمح بطلب واحد كل 60 ثانية. يرجى الانتظار دقيقة.";
    }
    if (lower.includes("invalid login credentials")) {
      return "بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.";
    }
    if (lower.includes("email not confirmed")) {
      return "لم يتم تفعيل هذا الحساب بعد. يرجى مراجعة بريدك الإلكتروني والضغط على رابط التفعيل.";
    }
    if (
      lower.includes("user already registered") ||
      lower.includes("already registered")
    ) {
      return "هذا البريد الإلكتروني مسجل بالفعل. يرجى التبديل إلى «تسجيل الدخول».";
    }
    if (
      lower.includes("password should be at least") ||
      lower.includes("password is too short")
    ) {
      return "كلمة المرور قصيرة جداً؛ يجب أن تتكون من 6 أحرف أو أرقام على الأقل.";
    }
    if (lower.includes("failed to fetch") || lower.includes("network")) {
      return "تعذر الاتصال بخوادم المصادقة. يرجى التأكد من اتصال الإنترنت.";
    }
    if (
      lower.includes("invalid email") ||
      lower.includes("unable to validate email address")
    ) {
      return "صيغة البريد الإلكتروني غير صالحة.";
    }

    return msg || "حدث خطأ أثناء المصادقة.";
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setAlert({
        type: "error",
        text: "يرجى ملء البريد الإلكتروني وكلمة المرور.",
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          router.back();
        } else {
          setAlert({
            type: "info",
            text: "تم إرسال رابط تأكيد الحساب إلى بريدك الإلكتروني. يرجى تفعيله ثم تسجيل الدخول.",
          });
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.back();
      }
    } catch (err) {
      setAlert({
        type: "error",
        text: getFriendlyAuthErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityLabel="إغلاق"
        >
          <X size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mode Switch Tabs */}
          <View style={styles.tabsWrapper}>
            <TouchableOpacity
              style={[styles.tab, mode === "login" && styles.tabActive]}
              onPress={() => {
                setMode("login");
                setAlert(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "login" && styles.tabTextActive,
                ]}
              >
                تسجيل الدخول
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, mode === "signup" && styles.tabActive]}
              onPress={() => {
                setMode("signup");
                setAlert(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signup" && styles.tabTextActive,
                ]}
              >
                حساب جديد
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alert Message Box */}
          {alert && (
            <View
              style={[
                styles.alertBox,
                alert.type === "error"
                  ? styles.alertError
                  : styles.alertInfo,
              ]}
            >
              {alert.type === "error" ? (
                <AlertCircle size={18} color={colors.danger} />
              ) : (
                <CheckCircle size={18} color={colors.emerald} />
              )}
              <Text style={styles.alertText}>{alert.text}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {mode === "signup" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>الاسم الكامل</Text>
                <View style={styles.inputWrap}>
                  <User size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="الاسم الكريم"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    textAlign="right"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  textAlign="right"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0c0a09" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === "login" ? "دخول" : "إنشاء الحساب"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.guestBtnText}>
                المتابعة بدون حساب (القراءة محفوظة محلياً)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  tabsWrapper: {
    flexDirection: "row-reverse",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  tabText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  tabTextActive: {
    color: colors.gold,
    fontFamily: fonts.bold,
  },
  alertBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertError: {
    backgroundColor: "rgba(255, 92, 92, 0.1)",
    borderColor: colors.danger,
  },
  alertInfo: {
    backgroundColor: "rgba(63, 201, 160, 0.1)",
    borderColor: colors.emerald,
  },
  alertText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
  },
  inputWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 12,
    writingDirection: "rtl",
  },
  submitBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#0c0a09",
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  guestBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  guestBtnText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});

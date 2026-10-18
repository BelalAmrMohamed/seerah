"use client";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { ScrollProvider } from "@/lib/scroll";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";

function AuthInit() {
  const setUser = useAppStore((s) => s.setUser);
  useEffect(() => {
    const supabase = createClient();
    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name,
          avatarUrl: user.user_metadata?.avatar_url,
        });
      }
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [setUser]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <ScrollProvider>
        <AuthInit />
        {children}
      </ScrollProvider>
    </ThemeProvider>
  );
}

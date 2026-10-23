import { Image } from "expo-image";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { T } from "@/components/ui/Text";

const SUN = require("@/assets/images/aapka-sun-mark.png");

export function AuthHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.head}>
      <Pressable style={({ pressed }) => [styles.back, pressed && { backgroundColor: "#e9e9e9" }]} onPress={onBack} accessibilityLabel="Back">
        <ChevronLeft size={18} strokeWidth={2.5} color="#111" />
      </Pressable>
      <Image source={SUN} style={styles.logo} contentFit="contain" accessibilityLabel="Aapka" />
    </View>
  );
}

export function Cta({ children, disabled, busy, onPress }: { children: ReactNode; disabled?: boolean; busy?: boolean; onPress: () => void }) {
  const off = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(off) }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [styles.cta, disabled && !busy ? styles.ctaOff : styles.ctaOn, pressed && { transform: [{ scale: 0.985 }] }]}
    >
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <T weight="medium" style={[styles.ctaText, disabled && { color: "#a3a3a3" }]}>
          {children}
        </T>
      )}
    </Pressable>
  );
}

export const loginStyles = StyleSheet.create({
  title: { marginTop: 30, marginBottom: 6, fontSize: 26, letterSpacing: -0.5, color: "#111" },
  sub: { fontSize: 13, lineHeight: 19.5, color: "#8a8a8a" },
  strong: { color: "#111" },
  error: { marginTop: 8, fontSize: 13, lineHeight: 18, color: "#e5372b" },
  foot: { marginTop: 20, fontSize: 13, textAlign: "center", color: "#555" },
  footStrong: { color: "#111" },
});

const styles = StyleSheet.create({
  head: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f3f3" },
  logo: { width: 36, height: 18 },
  cta: { height: 54, marginTop: 30, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  ctaOn: {
    backgroundColor: "#1c1c1c",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  ctaOff: { backgroundColor: "#ececec" },
  ctaText: { fontSize: 15, color: "#fff" },
});

import type { TodaySummary } from "@aapka/shared";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { hrefFor } from "@/lib/routes";

const SUN = require("@/assets/images/aapka-sun-mark.png");

export function TodayCard({ summary }: { summary: TodaySummary }) {
  return (
    <LinearGradient
      colors={["#1d4f9a", "#2f77c6", "#7cc3ee", "#a9e0f8"]}
      locations={[0, 0.45, 0.8, 1]}
      start={{ x: 0, y: 0.4 }}
      end={{ x: 1, y: 0.6 }}
      style={styles.banner}
    >
      <View style={styles.copy}>
        <T weight="semibold" style={styles.eyebrow}>
          {summary.eyebrow.toUpperCase()}
        </T>
        <View style={styles.titleBox}>
          {summary.title.map((line) => (
            <T key={line} weight="medium" style={styles.title}>
              {line}
            </T>
          ))}
        </View>
        <PopButton variant="light" size="small" arrow onPress={() => router.navigate(hrefFor(summary.cta.module))}>
          {summary.cta.label}
        </PopButton>
      </View>

      <View style={styles.art} pointerEvents="none">
        <View style={styles.orbit} />
        <LinearGradient colors={["#fb923c", "#f97316", "#c2410c"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <LinearGradient colors={["#fde68a", "#f59e0b"]} style={styles.chip} />
          <Image source={SUN} style={styles.mark} tintColor="#fff" contentFit="contain" />
          <T style={styles.digits}>1042 2026 0817</T>
        </LinearGradient>
        <View style={[styles.coin, { top: 14, right: 6, width: 22, height: 22 }]} />
        <View style={[styles.coin, { bottom: 12, right: 74, width: 26, height: 26 }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: { minHeight: 118, borderRadius: 4, overflow: "hidden", flexDirection: "row" },
  copy: { zIndex: 1, maxWidth: "64%", paddingTop: 16, paddingBottom: 14, paddingLeft: 16, alignItems: "flex-start" },
  eyebrow: { marginBottom: 5, fontSize: 8.5, letterSpacing: 1.2, color: "#fff" },
  titleBox: { marginBottom: 11 },
  title: { fontSize: 14, lineHeight: 18, color: "#fff" },
  art: { position: "absolute", top: 0, right: 0, bottom: 0, width: "46%" },
  orbit: {
    position: "absolute",
    top: 28,
    right: -8,
    width: 128,
    height: 54,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: 64,
    transform: [{ rotate: "-24deg" }],
  },
  card: {
    position: "absolute",
    top: 26,
    right: 22,
    width: 84,
    height: 53,
    borderRadius: 8,
    transform: [{ rotate: "-32deg" }, { skewX: "8deg" }],
    shadowColor: "#0f2850",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  chip: { position: "absolute", top: 18, left: 10, width: 15, height: 11, borderRadius: 2 },
  mark: { position: "absolute", top: 8, right: 8, width: 22, height: 11, opacity: 0.9 },
  digits: { position: "absolute", bottom: 8, left: 10, fontSize: 6, letterSpacing: 0.5, color: "rgba(255,255,255,0.85)" },
  coin: {
    position: "absolute",
    borderRadius: 20,
    backgroundColor: "#d1d5db",
    borderWidth: 1,
    borderColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
});

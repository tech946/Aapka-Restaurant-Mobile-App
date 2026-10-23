import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { T } from "@/components/ui/Text";

type Slide = { tag: string; headline: string[]; body: string };

const SLIDES: Slide[] = [
  {
    tag: "For the Aapka team",
    headline: ["Run the", "kitchen", "together"],
    body: "Orders, mess, stock and deliveries — your whole shift in one app.",
  },
  {
    tag: "Live orders",
    headline: ["Every order", "right on", "time"],
    body: "See new orders the moment they land and keep the kitchen moving.",
  },
  {
    tag: "On the road",
    headline: ["Deliver", "with a", "smile"],
    body: "Drivers get their stops, mark deliveries and track their day.",
  },
];

const AVATARS = [
  { initials: "RK", color: "#f97316" },
  { initials: "SA", color: "#16a34a" },
  { initials: "MI", color: "#2563eb" },
];

const BACKGROUND = require("@/assets/images/pwa/onboarding-bg.jpg");

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const track = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const goTo = (i: number) => track.current?.scrollTo({ x: i * width, animated: true });

  return (
    <View style={styles.root}>
      <ScrollView
        ref={track}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => (
          <View key={slide.tag} style={[styles.slide, { width, paddingBottom: insets.bottom + 132 }]}>
            <Image source={BACKGROUND} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.22)", "rgba(0,0,0,0.42)"]}
              locations={[0.38, 0.64, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.copy}>
              <View style={styles.tag}>
                <View style={styles.avatars}>
                  {AVATARS.map((a, i) => (
                    <View key={a.initials} style={[styles.avatar, { backgroundColor: a.color, marginLeft: i ? -6 : 0 }]}>
                      <T weight="bold" style={styles.avatarText}>
                        {a.initials}
                      </T>
                    </View>
                  ))}
                </View>
                <T weight="bold" style={styles.tagText}>
                  {slide.tag.toUpperCase()}
                </T>
              </View>
              <View style={styles.titleBox}>
                {slide.headline.map((line) => (
                  <T key={line} weight="display" style={styles.title}>
                    {line.toUpperCase()}
                  </T>
                ))}
              </View>
              <T style={styles.body}>{slide.body}</T>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={[styles.skip, { top: insets.top + 16 }]} onPress={onDone} hitSlop={8}>
        <T weight="medium" style={styles.skipText}>
          Skip
        </T>
      </Pressable>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <Pressable
              key={slide.tag}
              onPress={() => goTo(i)}
              accessibilityLabel={`Slide ${i + 1}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.98 }] }]}
          onPress={() => (last ? onDone() : goTo(index + 1))}
          accessibilityRole="button"
        >
          <T weight="semibold" style={styles.ctaText}>
            Continue
          </T>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2f5d2a" },
  slide: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 24 },
  copy: { alignItems: "center" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 26,
    paddingLeft: 4,
    paddingRight: 9,
    borderRadius: 6,
    backgroundColor: "rgba(20,40,18,0.42)",
  },
  avatars: { flexDirection: "row" },
  avatar: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 7, color: "#fff" },
  tagText: { fontSize: 11, letterSpacing: 0.33, color: "#fff" },
  titleBox: { marginTop: 16, marginBottom: 12, alignItems: "center" },
  title: {
    fontSize: 44,
    lineHeight: 46,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 2 },
  },
  body: { maxWidth: 300, textAlign: "center", fontSize: 13.5, lineHeight: 19.5, color: "rgba(255,255,255,0.92)" },
  skip: { position: "absolute", right: 18, paddingVertical: 6, paddingHorizontal: 4 },
  skipText: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center", gap: 22, paddingHorizontal: 16 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 20, height: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { width: 24, backgroundColor: "#fff" },
  cta: {
    alignSelf: "stretch",
    height: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  ctaText: { fontSize: 16, color: "#111" },
});

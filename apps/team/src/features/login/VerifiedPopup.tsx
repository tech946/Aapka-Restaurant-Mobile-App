import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { T } from "@/components/ui/Text";
import { Cta } from "./parts";

const ART = require("@/assets/images/pwa/verified.webp");

export function VerifiedPopup({ onContinue }: { onContinue: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onContinue} statusBarTranslucent>
      <View style={[styles.scrim, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.close} onPress={onContinue} accessibilityLabel="Close">
          <X size={18} strokeWidth={2.5} color="#111" />
        </Pressable>
        <View style={styles.card}>
          <T weight="bold" style={styles.title}>
            Verified!
          </T>
          <T style={styles.sub}>Your email verification has been complete</T>
          <Image source={ART} style={styles.art} contentFit="contain" />
          <Cta onPress={onContinue}>Let’s Explore</Cta>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 12, backgroundColor: "rgba(245,245,245,0.85)" },
  close: {
    width: 38,
    height: 38,
    marginBottom: 14,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: {
    alignSelf: "stretch",
    paddingTop: 26,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
    elevation: 10,
  },
  title: { textAlign: "center", fontSize: 24, letterSpacing: -0.5, color: "#111" },
  sub: { marginTop: 8, marginBottom: 18, textAlign: "center", fontSize: 13, color: "#8a8a8a" },
  art: { width: "100%", aspectRatio: 900 / 617 },
});

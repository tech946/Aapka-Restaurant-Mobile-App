import { router, type Href } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { Arrow } from "@/components/art/Art";

export function BackButton({ fallback, size = 26, label = "Back" }: { fallback: Href; size?: number; label?: string }) {
  return (
    <Pressable
      style={styles.back}
      onPress={() => (router.canGoBack() ? router.back() : router.navigate(fallback))}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Arrow name="navLeft" size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { width: 36, height: 40, marginLeft: -4, alignItems: "center", justifyContent: "center" },
});

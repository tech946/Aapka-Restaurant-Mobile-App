import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Arrow } from "@/components/art/Art";
import { T } from "@/components/ui/Text";

type Props = {
  children: ReactNode;
  variant?: "dark" | "light" | "stroked";
  size?: "big" | "small";
  arrow?: boolean;
  block?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const LOOK = {
  dark: { bg: "#f97316", fg: "#fff", line: "transparent" },
  light: { bg: "rgb(235,235,235)", fg: "#111", line: "transparent" },
  stroked: { bg: "#fff", fg: "#111", line: "#d4d4d4" },
} as const;

export function PopButton({
  children,
  variant = "dark",
  size = "big",
  arrow,
  block,
  disabled,
  busy,
  onPress,
  style,
  accessibilityLabel,
}: Props) {
  const look = disabled ? { bg: "#7d7d7d", fg: "#fff", line: "transparent" } : LOOK[variant];
  const small = size === "small";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled || busy) }}
      disabled={disabled || busy || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.big,
        block && styles.block,
        { backgroundColor: look.bg, borderColor: look.line },
        pressed && styles.pressed,
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={look.fg} size="small" />
      ) : (
        <View style={[styles.row, { gap: small ? 8 : 10 }]}>
          {typeof children === "string" ? (
            <T weight="medium" numberOfLines={1} style={{ color: look.fg, fontSize: small ? 13.5 : 14.5, letterSpacing: 0.15 }}>
              {children}
            </T>
          ) : (
            children
          )}
          {arrow ? <Arrow name="button" color={look.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  big: { height: 46, paddingHorizontal: 22, borderRadius: 12 },
  small: { height: 38, paddingHorizontal: 16, borderRadius: 10 },
  block: { alignSelf: "stretch" },
  pressed: { transform: [{ scale: 0.97 }] },
  row: { flexDirection: "row", alignItems: "center" },
});

import { Text as RNText, type TextProps } from "react-native";

import { colors, fonts } from "@/theme";

type Weight = "regular" | "medium" | "semibold" | "bold" | "display" | "serif";

export function T({ weight = "regular", style, ...props }: TextProps & { weight?: Weight }) {
  return <RNText {...props} style={[{ fontFamily: fonts[weight], color: colors.text }, style]} />;
}

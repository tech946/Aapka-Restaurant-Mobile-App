export const colors = {
  brand: "#f97316",
  cta: "#ea580c",
  orange: "#f26b3a",
  orangeText: "#f0592a",
  brandSoft: "#fff1e7",
  brandText: "#c2410c",

  ink: "#111111",
  ink2: "#1c1c1c",
  text: "#2d2d2d",
  muted: "#696969",
  grey: "#8a8a8a",
  faint: "#9c9c9c",
  placeholder: "#b0b0b0",
  line: "#e5e5e5",
  lineStrong: "#d4d4d4",
  surface: "#ffffff",
  surface2: "#f4f4f6",
  field: "#f6f6f6",
  bar: "#0d0d0d",
  backdrop: "#e9e7e4",

  danger: "#d92d20",
  dangerText: "#e5372b",
  dangerSoft: "#fef3f2",
  success: "#1c6b3c",
  successSoft: "#e6f4ec",
  veg: "#1a8f3c",
  nonVeg: "#c0392b",
} as const;

export const fonts = {
  regular: "GoogleSans_400Regular",
  medium: "GoogleSans_500Medium",
  semibold: "GoogleSans_600SemiBold",
  bold: "GoogleSans_700Bold",
  display: "ArchivoBlack_400Regular",
  serif: "DMSerifDisplay_400Regular",
} as const;

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cta: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

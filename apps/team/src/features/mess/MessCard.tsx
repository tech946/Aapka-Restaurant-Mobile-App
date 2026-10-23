import { aed, avatarColour, type MessRow } from "@aapka/shared";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { T } from "@/components/ui/Text";
import { mealLine } from "./filters";

const PILL = {
  due: { bg: "#ffe2cc", fg: "#b4400b" },
  paid: { bg: "rgb(235,235,235)", fg: "#3c4043" },
  inactive: { bg: "rgb(235,235,235)", fg: "#80868b" },
} as const;

export const MessCard = memo(function MessCard({ row, first }: { row: MessRow; first: boolean }) {
  const status = !row.active ? "inactive" : row.paid ? "paid" : "due";
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/mess/[id]", params: { id: row.id } })}
      style={({ pressed }) => [styles.card, !first && styles.next, !row.active && styles.inactive, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.avatar, { backgroundColor: avatarColour(row.name) }]}>
        <T style={styles.avatarText}>{row.name.trim().charAt(0).toUpperCase()}</T>
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <T weight="medium" numberOfLines={1} style={styles.name}>
            {row.name}
            {row.persons > 1 ? <T style={styles.persons}> ×{row.persons}</T> : null}
          </T>
          <T weight="semibold" style={styles.amount}>
            {row.amount ? aed(row.amount) : "—"}
          </T>
          {status === "due" ? <View style={styles.dueDot} accessibilityLabel="Payment due" /> : null}
        </View>
        <T weight="medium" numberOfLines={1} style={styles.subject}>
          {[row.zone, row.place].filter(Boolean).join(" · ") || "no address"}
        </T>
        <View style={styles.bottom}>
          <T numberOfLines={1} style={styles.snippet}>
            {mealLine(row)}
          </T>
          <View style={[styles.pill, { backgroundColor: PILL[status].bg }]}>
            <T weight="medium" style={[styles.pillText, { color: PILL[status].fg }]}>
              {status}
            </T>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 16 },
  next: { borderTopWidth: 1, borderTopColor: "#efefef" },
  inactive: { opacity: 0.6 },
  pressed: { backgroundColor: "#fafafa" },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, color: "#fff" },
  body: { flex: 1, minWidth: 0, gap: 3 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1, fontSize: 16.5, color: "#1f1f1f" },
  persons: { fontSize: 13, color: "#5f6368" },
  amount: { fontSize: 12.5, color: "#1f1f1f" },
  dueDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#f97316" },
  subject: { fontSize: 14, color: "#1f1f1f" },
  bottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  snippet: { flex: 1, fontSize: 14, color: "#5f6368" },
  pill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontSize: 12 },
});

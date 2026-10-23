import type { ModuleKey } from "@aapka/shared";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Arrow, ModuleArt, type ModuleArtName } from "@/components/art/Art";
import { T } from "@/components/ui/Text";
import { hrefFor } from "@/lib/routes";

export type GlanceChip = {
  key: string;
  art: ModuleArtName;
  label: string;
  value: string;
  positive?: boolean;
  module?: ModuleKey;
};

export function GlanceChips({ chips }: { chips: GlanceChip[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={styles.rowContent}>
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          disabled={!chip.module}
          onPress={() => chip.module && router.navigate(hrefFor(chip.module))}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
        >
          <ModuleArt name={chip.art} size={22} />
          <T style={styles.label}>{chip.label}</T>
          <T weight={chip.positive ? "medium" : "regular"} style={[styles.value, chip.positive && styles.positive]}>
            {chip.value}
          </T>
          {chip.module ? (
            <View style={styles.go}>
              <Arrow name="small" size={9} color="#333" />
            </View>
          ) : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: -18 },
  rowContent: { gap: 10, paddingHorizontal: 18, paddingBottom: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 34,
    paddingLeft: 12,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 999,
    backgroundColor: "#fff",
    shadowColor: "#dadada",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressed: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 1 } },
  label: { fontSize: 13, color: "#111" },
  value: { fontSize: 13, color: "#8a8a8a" },
  positive: { color: "#d9531f" },
  go: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#bdbdbd",
    alignItems: "center",
    justifyContent: "center",
  },
});

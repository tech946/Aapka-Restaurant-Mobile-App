import type { MealType } from "@aapka/shared";
import { StyleSheet, View } from "react-native";

import { RowIcon } from "@/components/art/Art";
import { T } from "@/components/ui/Text";

export function FoodTag({ food }: { food: MealType }) {
  return (
    <View style={styles.tag}>
      <RowIcon name="FoodMark" size={14} color={food === "Veg" ? "#1a8f3c" : "#c0392b"} />
      <T weight="medium" style={styles.text}>
        {food.toLowerCase()}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 999,
  },
  text: { fontSize: 12, color: "#333" },
});

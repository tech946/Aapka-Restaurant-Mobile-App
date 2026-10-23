import { DELIVERY_UNIT_LABELS, fmtMessTime, planMeals, type MessRow, type MessSubscriptionRecord } from "@aapka/shared";
import { Pressable, StyleSheet, View } from "react-native";

import { Arrow, RowIcon } from "@/components/art/Art";
import { BackButton } from "@/components/ui/BackButton";
import { T } from "@/components/ui/Text";
import { FoodTag } from "../FoodTag";

type Props = {
  rec: MessSubscriptionRecord;
  row: MessRow;
  zoneName: string;
  hideMoney: boolean;
  editable: boolean;
  onMenu: () => void;
  onProfile: () => void;
  onMeals: () => void;
  onPayment: () => void;
};

export function Hero({ rec, row, zoneName, hideMoney, editable, onMenu, onProfile, onMeals, onPayment }: Props) {
  const meals = planMeals(rec);
  const mealNames = meals.length ? meals.map((u) => DELIVERY_UNIT_LABELS[u].toLowerCase()).join(", ") : "no meals";
  const mealTimes = meals
    .map((u) => row.times[u])
    .filter((t): t is string => Boolean(t))
    .map((t) => fmtMessTime(t).toLowerCase())
    .join(", ");
  const amount = rec.subscription_amount ? (hideMoney ? "••••" : rec.subscription_amount.toLocaleString("en-AE")) : "—";

  return (
    <View style={styles.hero}>
      <View style={styles.bar}>
        <BackButton fallback="/mess" size={30} label="Back to mess" />
        <View style={styles.actions}>
          <View style={styles.status}>
            <View style={[styles.statusDot, rec.is_active && styles.statusDotOn]} />
            <T weight="medium" style={[styles.statusText, rec.is_active && styles.statusTextOn]}>
              {rec.is_active ? "active" : "inactive"}
            </T>
          </View>
          <Pressable onPress={onMenu} style={styles.dots} accessibilityRole="button" accessibilityLabel="More options">
            <RowIcon name="Dots" size={22} />
          </Pressable>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.info}>
          <Pressable style={styles.name} onPress={onProfile} disabled={!editable} accessibilityLabel={`${rec.customer_name}, edit profile`}>
            <T weight="bold" numberOfLines={2} style={styles.nameText}>
              {rec.customer_name}
            </T>
            {editable ? <RowIcon name="Info" size={19} color="#71717a" /> : null}
          </Pressable>
          <View style={styles.line}>
            <RowIcon name="Pin" size={17} color="#71717a" />
            <T numberOfLines={1} style={styles.lineText}>
              {[zoneName, rec.building, rec.flat].filter(Boolean).join(" · ") || "no address"}
            </T>
          </View>
          <Pressable style={styles.line} onPress={onMeals} disabled={!editable}>
            <RowIcon name="Timer" size={17} color="#71717a" />
            <T numberOfLines={1} style={styles.lineText}>
              {mealTimes || `${rec.meal_time_count} a day`} · {mealNames}
            </T>
            {editable ? <Arrow name="chevronDown" size={10} color="#71717a" /> : null}
          </Pressable>
          <View style={styles.tag}>
            <FoodTag food={rec.meal_type} />
          </View>
        </View>

        <Pressable style={styles.amount} onPress={onPayment} disabled={!editable} accessibilityLabel="Payment">
          <View style={styles.amountPill}>
            <View style={styles.coin}>
              <RowIcon name="Wallet" size={13} color="#ea580c" />
            </View>
            <T weight="semibold" style={styles.amountText}>
              {amount}
            </T>
          </View>
          <T style={styles.amountBy}>AED a month</T>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18, borderBottomWidth: 1, borderStyle: "dashed", borderBottomColor: "#dcdcdc" },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, height: 26, paddingLeft: 9, paddingRight: 10, borderRadius: 999, backgroundColor: "rgb(235,235,235)" },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#71717a" },
  statusDotOn: { backgroundColor: "#f97316" },
  statusText: { fontSize: 12, color: "#71717a" },
  statusTextOn: { color: "#111" },
  dots: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  main: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  info: { flex: 1, minWidth: 0 },
  name: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameText: { flexShrink: 1, fontSize: 22, lineHeight: 30, color: "#111" },
  line: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  lineText: { flexShrink: 1, fontSize: 14, lineHeight: 20, color: "#3f3f46" },
  tag: { marginTop: 10 },
  amount: { alignItems: "center", gap: 5, marginTop: 1 },
  amountPill: { flexDirection: "row", alignItems: "center", gap: 6, height: 28, paddingLeft: 4, paddingRight: 10, borderRadius: 8, backgroundColor: "#f97316" },
  coin: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  amountText: { fontSize: 15, color: "#fff" },
  amountBy: { fontSize: 11, color: "#71717a", textDecorationLine: "underline", textDecorationStyle: "dashed" },
});

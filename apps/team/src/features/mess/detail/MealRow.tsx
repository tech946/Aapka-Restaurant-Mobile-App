import { DELIVERY_UNIT_LABELS, errorMessage, fmtMessTime, type DeliveryUnit, type MessRow } from "@aapka/shared";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { api } from "@/lib/api";
import { CredButton } from "../form";
import { RowText, rowStyles } from "./rows";

type Props = {
  row: MessRow;
  unit: DeliveryUnit;
  today: string;
  first: boolean;
  canMark: boolean;
  onDone: () => void;
};

export function MealRow({ row, unit, today, first, canMark, onDone }: Props) {
  const done = row.delivered.includes(unit);
  const due = !done && row.dueToday.includes(unit);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mark() {
    if (!confirm) return setConfirm(true);
    setBusy(true);
    setError(null);
    try {
      await api.markDelivered(row.id, today, unit);
      onDone();
    } catch (e) {
      setError(errorMessage(e, "couldn’t mark it").toLowerCase());
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  const status = done ? "delivered" : due ? "pending" : "not today";

  return (
    <View style={[rowStyles.row, !first && rowStyles.rowNext]}>
      <View style={[styles.mark, done && styles.done]}>{done ? <Check size={13} strokeWidth={3} color="#fff" /> : null}</View>
      <RowText title={DELIVERY_UNIT_LABELS[unit].toLowerCase()} sub={error ?? `${fmtMessTime(row.times[unit]).toLowerCase()} · ${status}`} error={Boolean(error)} />
      {due && canMark ? (
        <CredButton small busy={busy} onPress={() => void mark()}>
          {confirm ? "Confirm" : "Delivered"}
        </CredButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#c4c4c4", alignItems: "center", justifyContent: "center" },
  done: { borderColor: "#1f9d55", backgroundColor: "#1f9d55" },
});

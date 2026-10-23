import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { T } from "@/components/ui/Text";

export type DateTimeFieldProps = {
  mode: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

function toDate(mode: "date" | "time", value: string): Date {
  if (mode === "date") {
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 12, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

function fromDate(mode: "date" | "time", d: Date): string {
  return mode === "date" ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimeField({ mode, value, onChange, disabled, label }: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);

  function picked(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") setOpen(false);
    if (event.type === "set" && date) onChange(fromDate(mode, date));
  }

  return (
    <View>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen((o) => !o)}
        style={[styles.box, disabled && { opacity: 0.5 }]}
        accessibilityRole="button"
      >
        <T style={[styles.text, !value && { color: "#9c9c9c" }]}>{label ?? (value || (mode === "date" ? "pick a date" : "pick a time"))}</T>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={toDate(mode, value)}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={picked}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 52,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d6d6d6",
    borderRadius: 4,
    backgroundColor: "#fafafa",
  },
  text: { fontSize: 16, color: "#111" },
});

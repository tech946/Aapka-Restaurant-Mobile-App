import { Minus, Plus } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { T } from "@/components/ui/Text";
import { fonts } from "@/theme";

export function SectionTitle({ children }: { children: string }) {
  return (
    <T weight="semibold" style={styles.sectionTitle}>
      {children.toUpperCase()}
    </T>
  );
}

export function Options({ label, children, first = true }: { label: string; children: ReactNode; first?: boolean }) {
  return (
    <View style={[styles.options, !first && styles.optionsNext]}>
      <SectionTitle>{label}</SectionTitle>
      {children}
    </View>
  );
}

export function Radio({ label, on, onPress, first }: { label: string; on: boolean; onPress: () => void; first?: boolean }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.radio, !first && styles.radioNext]}
    >
      <T style={styles.radioLabel}>{label}</T>
      <View style={[styles.radioDot, on && styles.radioDotOn]}>{on ? <View style={styles.radioFill} /> : null}</View>
    </Pressable>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <SectionTitle>{label}</SectionTitle>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor="#9c9c9c" {...props} style={[styles.input, props.multiline && styles.textarea, props.style]} />;
}

export function MoneyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View>
      <T weight="medium" style={styles.moneyTag}>
        AED
      </T>
      <Input value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" style={{ paddingLeft: 48 }} />
    </View>
  );
}

export function Chips({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

export function Chip({ on, onPress, children }: { on: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      {typeof children === "string" ? <T style={[styles.chipText, on && { color: "#fff" }]}>{children}</T> : children}
    </Pressable>
  );
}

export function Stepper({ value, onChange, unit }: { value: number; onChange: (n: number) => void; unit?: [string, string] }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepBtn} disabled={value <= 1} onPress={() => onChange(Math.max(1, value - 1))} accessibilityLabel="One less">
        <Minus size={18} strokeWidth={2} color={value <= 1 ? "#c4c4c4" : "#111"} />
      </Pressable>
      <T weight="medium" style={styles.stepValue}>
        {value}
        {unit ? ` ${value === 1 ? unit[0] : unit[1]}` : ""}
      </T>
      <Pressable style={styles.stepBtn} onPress={() => onChange(value + 1)} accessibilityLabel="One more">
        <Plus size={18} strokeWidth={2} color="#111" />
      </Pressable>
    </View>
  );
}

export function CredButton({
  children,
  outline,
  small,
  disabled,
  busy,
  onPress,
}: {
  children: ReactNode;
  outline?: boolean;
  small?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
}) {
  const fg = outline ? "#ea580c" : "#fff";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.crb,
        small ? styles.crbSmall : styles.crbBig,
        outline && styles.crbOutline,
        pressed && (outline ? { backgroundColor: "#fff4ec" } : { backgroundColor: "#ea580c" }),
        (disabled || busy) && { opacity: 0.55 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <T weight="medium" style={{ color: fg, fontSize: small ? 13 : 15 }}>
          {children}
        </T>
      )}
    </Pressable>
  );
}

export function FormError({ children }: { children: string | null }) {
  return children ? <T style={styles.error}>{children}</T> : null;
}

export const formStyles = StyleSheet.create({
  two: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
});

const styles = StyleSheet.create({
  sectionTitle: { marginBottom: 2, fontSize: 11, letterSpacing: 1.9, color: "#6f6f6f" },
  options: { gap: 10 },
  optionsNext: { marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#dcdcdc" },
  radio: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  radioNext: { borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#e2e2e2" },
  radioLabel: { fontSize: 16, color: "#111" },
  radioDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#c9c9c9", alignItems: "center", justifyContent: "center" },
  radioDotOn: { borderColor: "#f97316" },
  radioFill: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#f97316" },
  field: { gap: 8 },
  input: {
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d6d6d6",
    borderRadius: 4,
    backgroundColor: "#fafafa",
    color: "#111",
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  textarea: { height: 110, paddingTop: 12, textAlignVertical: "top" },
  moneyTag: { position: "absolute", left: 14, top: 17, zIndex: 1, fontSize: 13, color: "#8a8a8a" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { height: 40, paddingHorizontal: 16, justifyContent: "center", borderWidth: 1, borderColor: "#d6d6d6", borderRadius: 4, backgroundColor: "#fff" },
  chipOn: { borderColor: "#f97316", backgroundColor: "#f97316" },
  chipText: { fontSize: 14, color: "#111" },
  stepper: { height: 56, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d6d6d6", borderRadius: 4 },
  stepBtn: { width: 56, height: "100%", alignItems: "center", justifyContent: "center" },
  stepValue: { flex: 1, textAlign: "center", fontSize: 16, color: "#111" },
  crb: { alignItems: "center", justifyContent: "center", backgroundColor: "#f97316" },
  crbBig: { height: 46, paddingHorizontal: 20, borderRadius: 5, alignSelf: "stretch" },
  crbSmall: { minWidth: 78, height: 34, paddingHorizontal: 12, borderRadius: 4 },
  crbOutline: { borderWidth: 1.5, borderColor: "#f97316", backgroundColor: "#fff" },
  error: { marginBottom: 6, textAlign: "center", fontSize: 13, color: "#d92d20" },
});

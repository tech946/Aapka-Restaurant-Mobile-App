import type { DateTimeFieldProps } from "./DateTimeField";

export type { DateTimeFieldProps };

export function DateTimeField({ mode, value, onChange, disabled }: DateTimeFieldProps) {
  return (
    <input
      type={mode}
      value={mode === "time" ? value.slice(0, 5) : value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 52,
        padding: "0 14px",
        border: "1px solid #d6d6d6",
        borderRadius: 4,
        background: "#fafafa",
        color: "#111",
        fontSize: 16,
        fontFamily: "GoogleSans_400Regular",
        opacity: disabled ? 0.5 : 1,
        boxSizing: "border-box",
        width: "100%",
      }}
    />
  );
}

import { DELIVERY_UNIT_ORDER, MEAL_NAME, cap, type DeliveryUnit, type MessRow, type Zone } from "@aapka/shared";
import { Check } from "lucide-react-native";
import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { FullScreen } from "@/components/ui/Overlays";
import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { NO_FILTERS, matches, type Filters, type Tab } from "./filters";

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  draft: Filters;
  setDraft: (update: (d: Filters) => Filters) => void;
  rows: MessRow[];
  zones: Zone[];
  tab: Tab;
  query: string;
};

const PAY = [
  ["", "All"],
  ["due", "Due"],
  ["paid", "Paid"],
] as const;

const FOOD = [
  ["", "All", undefined],
  ["Veg", "Veg", "#2f9e44"],
  ["Non Veg", "Non veg", "#d92d20"],
] as const;

const TYPES = [
  ["", "All"],
  ["new", "New mess"],
  ["old", "Old mess"],
] as const;

export function MessFilters({ open, onClose, onApply, draft, setDraft, rows, zones, tab, query }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const toggleZone = (id: string) =>
    setDraft((d) => ({ ...d, zoneIds: d.zoneIds.includes(id) ? d.zoneIds.filter((z) => z !== id) : [...d.zoneIds, id] }));

  const total = useMemo(() => rows.filter((r) => matches(r, tab, draft, query)).length, [rows, tab, draft, query]);
  const mealCounts = useMemo(() => {
    const counts = {} as Record<DeliveryUnit, number>;
    for (const u of DELIVERY_UNIT_ORDER) counts[u] = rows.filter((r) => matches(r, tab, { ...draft, meal: u }, query)).length;
    return counts;
  }, [rows, tab, draft, query]);

  return (
    <FullScreen
      open={open}
      onClose={onClose}
      title="filters"
      footer={
        <>
          <PopButton variant="light" onPress={() => setDraft(() => NO_FILTERS)}>
            Clear
          </PopButton>
          <View style={styles.grow}>
            <PopButton block arrow onPress={() => onApply(draft)}>
              {`Show ${total} ${tab} mess`}
            </PopButton>
          </View>
        </>
      }
    >
      <Group title="meals">
        <Opt on={!draft.meal} onPress={() => set("meal", "")}>
          All
        </Opt>
        {DELIVERY_UNIT_ORDER.map((u) => (
          <Opt key={u} on={draft.meal === u} onPress={() => set("meal", u)} count={mealCounts[u]}>
            {cap(MEAL_NAME[u])}
          </Opt>
        ))}
      </Group>
      <Group title="payment">
        {PAY.map(([v, label]) => (
          <Opt key={label} on={draft.pay === v} onPress={() => set("pay", v)}>
            {label}
          </Opt>
        ))}
      </Group>
      <Group title="food">
        {FOOD.map(([v, label, dot]) => (
          <Opt key={label} on={draft.food === v} onPress={() => set("food", v)} dot={dot}>
            {label}
          </Opt>
        ))}
      </Group>
      <Group title="mess type">
        {TYPES.map(([v, label]) => (
          <Opt key={label} on={draft.type === v} onPress={() => set("type", v)}>
            {label}
          </Opt>
        ))}
      </Group>

      <T weight="semibold" style={styles.groupTitle}>
        ZONES{draft.zoneIds.length ? <T style={styles.picked}> · {draft.zoneIds.length} PICKED</T> : null}
      </T>
      {zones.map((z) => {
        const on = draft.zoneIds.includes(z.id);
        return (
          <Pressable key={z.id} style={styles.zone} onPress={() => toggleZone(z.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
            <View style={[styles.tick, on && styles.tickOn]}>{on ? <Check size={12} strokeWidth={3} color="#fff" /> : null}</View>
            <T style={styles.zoneText}>{z.name}</T>
          </Pressable>
        );
      })}
      {!zones.length ? <T style={styles.none}>No zones yet.</T> : null}
    </FullScreen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <T weight="semibold" style={styles.groupTitle}>
        {title.toUpperCase()}
      </T>
      <View style={styles.opts}>{children}</View>
    </View>
  );
}

function Opt({ on, onPress, count, dot, children }: { on: boolean; onPress: () => void; count?: number; dot?: string; children: string }) {
  return (
    <Pressable style={[styles.opt, on && styles.optOn]} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }}>
      {dot ? <View style={[styles.foodDot, { backgroundColor: dot }]} /> : null}
      <T weight="medium" style={[styles.optText, on && styles.onText]}>
        {children}
      </T>
      {count !== undefined ? <T style={[styles.optCount, on && styles.onCount]}>{count}</T> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  groupTitle: { marginTop: 22, marginBottom: 10, fontSize: 11, letterSpacing: 1.5, color: "#6f6f6f" },
  picked: { color: "#e2622f" },
  opts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opt: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "rgb(235,235,235)" },
  optOn: { backgroundColor: "#f97316" },
  optText: { fontSize: 13.5, color: "#2b2b2b" },
  onText: { color: "#fff" },
  optCount: { fontSize: 12, color: "#8a8a8a" },
  onCount: { color: "rgba(255,255,255,0.8)" },
  foodDot: { width: 8, height: 8, borderRadius: 4 },
  zone: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  zoneText: { fontSize: 14, color: "#111" },
  tick: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: "#c4c4c4", alignItems: "center", justifyContent: "center" },
  tickOn: { borderColor: "#f97316", backgroundColor: "#f97316" },
  none: { color: "#8a8a8a" },
});

import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Arrow, ContactIcon, RowIcon, type ContactIconName, type RowIconName } from "@/components/art/Art";
import { T } from "@/components/ui/Text";
import { openLink } from "@/lib/links";

export function Section({ title, first, children }: { title: string; first?: boolean; children: ReactNode }) {
  return (
    <View style={[styles.section, !first && styles.sectionNext]}>
      <T weight="semibold" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </T>
      {children}
    </View>
  );
}

export function RowText({ title, sub, error }: { title: string; sub?: string; error?: boolean }) {
  return (
    <View style={styles.text}>
      <T weight="medium" style={styles.title}>
        {title}
      </T>
      {sub ? (
        <T weight="medium" numberOfLines={1} style={[styles.sub, error && styles.subError]}>
          {sub.toUpperCase()}
        </T>
      ) : null}
    </View>
  );
}

export function ContactBadge({ icon, label, url }: { icon: ContactIconName; label: string; url: string | null }) {
  return (
    <Pressable style={[styles.badge, !url && styles.muted]} disabled={!url} onPress={() => openLink(url)} accessibilityRole="link">
      <ContactIcon name={icon} size={18} />
      <T style={styles.badgeText}>{label}</T>
    </Pressable>
  );
}

type ValueRowProps = {
  icon: RowIconName;
  title: string;
  sub?: string;
  value: string;
  due?: boolean;
  first?: boolean;
  editable: boolean;
  onPress: () => void;
};

export function ValueRow({ icon, title, sub, value, due, first, editable, onPress }: ValueRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, !first && styles.rowNext, pressed && editable && styles.pressed]}
      onPress={onPress}
      disabled={!editable}
      accessibilityRole={editable ? "button" : "text"}
    >
      <RowIcon name={icon} size={22} />
      <RowText title={title} sub={sub} />
      <T weight="medium" numberOfLines={1} style={[styles.value, due && styles.due]}>
        {value}
      </T>
      {editable ? <Arrow name="chevronRight" size={12} color="#9c9c9c" /> : null}
    </Pressable>
  );
}

export function MoreRow({ icon, title, sub, first, onPress }: { icon: RowIconName; title: string; sub: string; first?: boolean; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.more, !first && styles.rowNext, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      <View style={styles.moreIcon}>
        <RowIcon name={icon} size={20} />
      </View>
      <View style={styles.text}>
        <T weight="medium" style={styles.title}>
          {title}
        </T>
        <T numberOfLines={1} style={styles.moreSub}>
          {sub}
        </T>
      </View>
      <Arrow name="navRight" size={30} />
    </Pressable>
  );
}

export const rowStyles = StyleSheet.create({
  row: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  rowNext: { borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#e2e2e2" },
});

const styles = StyleSheet.create({
  ...rowStyles,
  section: { paddingTop: 18, paddingBottom: 4 },
  sectionNext: { marginHorizontal: -20, paddingHorizontal: 20, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#dcdcdc" },
  sectionTitle: { marginBottom: 2, fontSize: 11, letterSpacing: 2, color: "#6f6f6f" },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, color: "#111" },
  sub: { fontSize: 10.5, letterSpacing: 1, color: "#8a8a8a" },
  subError: { color: "#d92d20" },
  value: { maxWidth: "46%", fontSize: 14, color: "#111" },
  due: { color: "#c2410c" },
  pressed: { backgroundColor: "#fafafa" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 35,
    paddingLeft: 12,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: "#c5c5c5",
    borderRadius: 999,
    backgroundColor: "#fafafa",
    shadowColor: "#e7e7e7",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  muted: { opacity: 0.6 },
  badgeText: { fontSize: 14, color: "#111" },
  more: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  moreIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: "#d4d4d4", alignItems: "center", justifyContent: "center" },
  moreSub: { fontSize: 13, color: "#8a8a8a" },
});

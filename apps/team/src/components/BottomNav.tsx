import { NAV_BAR, moduleInfo, type ModuleKey } from "@aapka/shared";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavIcon, type NavIconName } from "@/components/art/Art";
import { T } from "@/components/ui/Text";
import { useViewer } from "@/lib/auth";
import { hrefFor } from "@/lib/routes";

type Current = ModuleKey | "more";

export const BAR_HEIGHT = 74;

export function BottomNav({ current }: { current: Current }) {
  const viewer = useViewer();
  const insets = useSafeAreaInsets();
  const items = NAV_BAR.filter((item) => viewer.modules.includes(item.key));
  const go = (key: Current) => {
    if (key !== current) router.navigate(key === "more" ? "/more" : hrefFor(key));
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12), height: BAR_HEIGHT + Math.max(insets.bottom, 12) }]}>
      {items.map(({ key, centre }) => {
        const active = key === current;
        const label = moduleInfo(key)?.label ?? key;
        if (centre) {
          return (
            <Pressable key={key} style={styles.centre} onPress={() => go(key)} accessibilityRole="button" accessibilityLabel={label}>
              <View style={[styles.orb, active && styles.orbActive]}>
                <NavIcon name={key as NavIconName} active={active} size={30} />
              </View>
            </Pressable>
          );
        }
        return <Tab key={key} label={label} icon={key as NavIconName} active={active} onPress={() => go(key)} />;
      })}
      <Tab label="More" icon="more" active={current === "more"} onPress={() => go("more")} />
    </View>
  );
}

function Tab({ label, icon, active, onPress }: { label: string; icon: NavIconName; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tab} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <View style={[styles.iconWrap, active && styles.iconGlow]}>
        <NavIcon name={icon} active={active} />
      </View>
      <T weight="semibold" numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
        {label.toUpperCase()}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 15,
    backgroundColor: "#0d0d0d",
  },
  tab: { flex: 1, alignItems: "center", paddingTop: 20, gap: 10, minWidth: 0 },
  iconWrap: { width: 40, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  iconGlow: { backgroundColor: "rgba(255,255,255,0.08)" },
  label: { maxWidth: "100%", fontSize: 9.5, letterSpacing: 1.9, color: "#8a8a8a" },
  labelActive: { color: "#fff" },
  centre: { flex: 1, alignItems: "center", paddingTop: 8 },
  orb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#3a3a3a",
    backgroundColor: "#1a1a1a",
    shadowColor: "#fff",
    shadowOpacity: 0.12,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 0 },
  },
  orbActive: { borderColor: "#6b6b6b", shadowOpacity: 0.2 },
});

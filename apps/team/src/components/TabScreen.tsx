import type { ModuleKey } from "@aapka/shared";
import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "@/components/BottomNav";

type Props = {
  current: ModuleKey | "more";
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  overlay?: ReactNode;
};

export function TabScreen({ current, children, refreshing = false, onRefresh, overlay }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
        >
          {children}
        </ScrollView>
      </View>
      <BottomNav current={current} />
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d0d0d" },
  page: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
});

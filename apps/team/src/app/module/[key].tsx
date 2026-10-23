import { moduleInfo, type ModuleKey } from "@aapka/shared";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ModuleArt, type ModuleArtName } from "@/components/art/Art";
import { TabScreen } from "@/components/TabScreen";
import { BackButton } from "@/components/ui/BackButton";
import { T } from "@/components/ui/Text";
import { useViewer } from "@/lib/auth";

export default function ModulePlaceholder() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const viewer = useViewer();
  const mod = moduleInfo(key);
  const allowed = mod && viewer.modules.includes(mod.key);

  return (
    <TabScreen current={(allowed ? mod.key : "home") as ModuleKey}>
      <View style={styles.bar}>
        <BackButton fallback="/" label="Back to home" />
        <T weight="semibold" style={styles.title}>
          {allowed ? mod.label : "Not available"}
        </T>
      </View>
      <View style={styles.body}>
        {allowed && mod.key !== "home" ? <ModuleArt name={mod.key as ModuleArtName} size={64} /> : null}
        <T weight="semibold" style={styles.h2}>
          {allowed ? "Coming soon" : "You can’t open this"}
        </T>
        <T style={styles.text}>
          {allowed ? `${mod.description} will appear here in the next update.` : "Your role doesn’t include this module."}
        </T>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, color: "#111" },
  body: { alignItems: "center", gap: 10, paddingTop: 120, paddingHorizontal: 24 },
  h2: { marginTop: 8, fontSize: 20, color: "#111" },
  text: { textAlign: "center", fontSize: 14, lineHeight: 21, color: "#696969" },
});

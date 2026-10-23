import { WifiOff } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { useAuth } from "@/lib/auth";

export function OfflineScreen() {
  const { retry } = useAuth();
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <WifiOff size={28} strokeWidth={2} color="#c2410c" />
      </View>
      <T weight="semibold" style={styles.title}>
        No connection
      </T>
      <T style={styles.text}>Aapka can’t reach the server. Check the internet and try again.</T>
      <PopButton onPress={retry}>Try again</PopButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32, backgroundColor: "#fff" },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: "#fff1e7" },
  title: { fontSize: 22, color: "#111" },
  text: { textAlign: "center", color: "#696969", fontSize: 14, lineHeight: 21 },
});

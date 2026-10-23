import { LogOut, ShieldAlert } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { useAuth } from "@/lib/auth";

export default function NoAccessScreen() {
  const { state, signOut } = useAuth();
  const name = state.status === "signedIn" ? state.viewer.displayName : "";
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <ShieldAlert size={28} strokeWidth={2} color="#c2410c" />
      </View>
      <T weight="semibold" style={styles.title}>
        No access yet
      </T>
      <T style={styles.text}>
        {name}, your account doesn’t have a role in the Aapka app. Ask your admin to assign one, then sign in again.
      </T>
      <PopButton onPress={() => void signOut()}>
        <LogOut size={18} strokeWidth={2} color="#fff" />
        <T weight="medium" style={{ color: "#fff", fontSize: 14.5 }}>
          Sign out
        </T>
      </PopButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32, backgroundColor: "#fff" },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: "#fff1e7" },
  title: { fontSize: 22, color: "#111" },
  text: { textAlign: "center", color: "#696969", fontSize: 14, lineHeight: 21 },
});

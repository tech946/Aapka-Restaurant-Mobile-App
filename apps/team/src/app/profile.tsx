import { SUPPORT_WHATSAPP_URL, errorMessage, moduleInfo, type ModuleInfo } from "@aapka/shared";
import { router } from "expo-router";
import { BadgeCheck, LogOut, Monitor, ShieldCheck } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { Arrow, ModuleArt, SupportMark, type ModuleArtName } from "@/components/art/Art";
import { BackButton } from "@/components/ui/BackButton";
import { Sheet } from "@/components/ui/Overlays";
import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { API_URL, api } from "@/lib/api";
import { useAuth, useViewer } from "@/lib/auth";
import { openLink } from "@/lib/links";
import { hrefFor } from "@/lib/routes";
import { fonts } from "@/theme";

function PencilIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M12.55 1.95C13.2 1.3 14.25 1.3 14.9 1.95L16.05 3.1C16.7 3.75 16.7 4.8 16.05 5.45L14.7 6.8L11.2 3.3L12.55 1.95Z" fill="#111" />
      <Path d="M10.25 4.25L13.75 7.75L6.05 15.45L1.9 16.55C1.6 16.63 1.37 16.4 1.45 16.1L2.55 11.95L10.25 4.25Z" fill="#111" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const viewer = useViewer();
  const { setViewer, signOut } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(viewer.displayName);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const roleKey = viewer.role?.key;
  const workModules = viewer.modules
    .filter((k) => k !== "home")
    .map((k) => moduleInfo(k))
    .filter((m): m is ModuleInfo => Boolean(m));

  const feature =
    roleKey === "super_admin"
      ? {
          title: "Full dashboard",
          body: "manage menu, stock and reports on a big screen",
          icon: <Monitor size={28} strokeWidth={1.6} color="#111" />,
          open: () => openLink(`${API_URL}/dashboard`),
        }
      : (() => {
          const key = roleKey === "driver" ? "deliveries" : "customers";
          const mod = moduleInfo(key)!;
          return {
            title: mod.label,
            body: mod.description.toLowerCase(),
            icon: <ModuleArt name={key} size={36} />,
            open: () => router.navigate(hrefFor(key)),
          };
        })();

  async function saveName() {
    const fullName = name.trim();
    if (!fullName) return;
    setSaving(true);
    setSaveError(null);
    try {
      setViewer(await api.updateName(fullName));
      setEditOpen(false);
    } catch (e) {
      setSaveError(errorMessage(e, "Couldn’t save. Try again."));
    } finally {
      setSaving(false);
    }
  }

  const support = () => openLink(SUPPORT_WHATSAPP_URL);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <BackButton fallback="/" />
          <Pressable style={styles.supportPill} onPress={support}>
            <SupportMark size={26} />
            <T style={{ fontSize: 14, color: "#7a7a7a" }}>Support</T>
          </Pressable>
        </View>

        <View style={styles.id}>
          <View style={styles.avatar}>
            <T style={{ fontSize: 30, color: "#fff" }}>{viewer.displayName.trim().charAt(0).toUpperCase() || "?"}</T>
            <View style={styles.avatarBadge}>
              <BadgeCheck size={12} strokeWidth={2.25} color="#fff" />
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T weight="semibold" numberOfLines={1} style={styles.name}>
              {viewer.displayName}
            </T>
            <View style={styles.since}>
              <ShieldCheck size={15} strokeWidth={1.6} color="#9a9a9a" />
              <T style={{ fontSize: 13, color: "#8a8a8a" }}>{viewer.memberSince ? `Member since ${viewer.memberSince}` : viewer.role?.label}</T>
            </View>
          </View>
          <Pressable
            style={styles.edit}
            onPress={() => {
              setName(viewer.displayName);
              setSaveError(null);
              setEditOpen(true);
            }}
            accessibilityLabel="Edit name"
          >
            <PencilIcon />
          </Pressable>
        </View>

        <View style={styles.feature}>
          <View style={{ width: 40, alignItems: "center" }}>{feature.icon}</View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T weight="semibold" style={{ fontSize: 14.5, color: "#111" }}>
              {feature.title}
            </T>
            <T numberOfLines={1} style={{ fontSize: 12.5, color: "#8a8a8a" }}>
              {feature.body}
            </T>
          </View>
          <PopButton size="small" onPress={feature.open}>
            Open now
          </PopButton>
        </View>

        <View style={styles.facts}>
          <Fact icon={<ShieldCheck size={21} strokeWidth={1.6} color="#111" />} label="role" value={viewer.role?.label ?? "—"} />
          <Fact icon={<BadgeCheck size={21} strokeWidth={1.6} color="#111" />} label="access" value={`${workModules.length} modules`} />
        </View>

        {workModules.length ? (
          <>
            <T style={styles.heading}>Work</T>
            {workModules.map((m) => (
              <Row key={m.key} label={m.label.toLowerCase()} icon={<ModuleArt name={m.key as ModuleArtName} size={28} />} onPress={() => router.navigate(hrefFor(m.key))} />
            ))}
          </>
        ) : null}

        <T style={styles.heading}>Help</T>
        <Row label="help & support" icon={<ModuleArt name="support" size={28} />} onPress={support} />

        <T style={styles.heading}>Account</T>
        {viewer.email ? <T style={styles.email}>{viewer.email}</T> : null}
        <Row
          label={signingOut ? "logging out…" : "log out"}
          icon={<LogOut size={21} strokeWidth={1.6} color="#111" />}
          onPress={() => {
            setSigningOut(true);
            void signOut();
          }}
        />
      </ScrollView>

      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit name">
        <View style={{ gap: 14, paddingTop: 4, paddingBottom: 8 }}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor="#b0b0b0"
            autoComplete="name"
            autoFocus
            accessibilityLabel="Full name"
          />
          {saveError ? <T style={{ color: "#e5372b", fontSize: 13 }}>{saveError}</T> : null}
          <PopButton block busy={saving} disabled={!name.trim()} onPress={() => void saveName()}>
            Save
          </PopButton>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      {icon}
      <T style={{ flex: 1, fontSize: 14.5, color: "#111" }}>{label}</T>
      <T weight="semibold" style={{ fontSize: 14.5, color: "#111" }}>
        {value}
      </T>
    </View>
  );
}

function Row({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]} onPress={onPress}>
      <View style={{ width: 30, alignItems: "center" }}>{icon}</View>
      <T style={{ flex: 1, fontSize: 14.5, color: "#111" }}>{label}</T>
      <Arrow name="small" color="#9c9c9c" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  supportPill: { flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingLeft: 10, paddingRight: 16, borderWidth: 1.5, borderColor: "#e4e4e4", borderRadius: 999 },
  id: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: "#ececec", backgroundColor: "#3f5361", alignItems: "center", justifyContent: "center" },
  avatarBadge: {
    position: "absolute",
    right: -4,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#1c1c1c",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 20, letterSpacing: -0.2, color: "#111" },
  since: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  edit: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: "#e4e4e4", alignItems: "center", justifyContent: "center" },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  facts: { marginTop: 14, paddingVertical: 4, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#f7f7f7" },
  fact: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 14 },
  heading: { marginTop: 22, marginBottom: 2, marginLeft: 2, fontSize: 13, color: "#8a8a8a" },
  email: { marginBottom: 2, marginLeft: 2, fontSize: 13, color: "#b0b0b0" },
  row: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 2 },
  input: { height: 52, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#f6f6f6", color: "#111", fontSize: 16, fontFamily: fonts.regular },
});

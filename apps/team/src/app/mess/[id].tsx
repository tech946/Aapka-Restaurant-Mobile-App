import { DELIVERY_UNIT_LABELS, aed, fmtMessStartDate, messTypeLabel, planMeals, whatsappUrl, type MessSubscriptionRecord } from "@aapka/shared";
import { useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RowIcon, type RowIconName } from "@/components/art/Art";
import { BackButton } from "@/components/ui/BackButton";
import { T } from "@/components/ui/Text";
import { EditSheets, ProfileEditor } from "@/features/mess/detail/EditSheets";
import { Hero } from "@/features/mess/detail/Hero";
import { MealRow } from "@/features/mess/detail/MealRow";
import { ContactBadge, MoreRow, RowText, Section, ValueRow, rowStyles } from "@/features/mess/detail/rows";
import { useMessEditor } from "@/features/mess/detail/use-mess-editor";
import { CredButton } from "@/features/mess/form";
import { api } from "@/lib/api";
import { useViewer } from "@/lib/auth";
import { mapsUrl, telUrl } from "@/lib/links";
import { useLoad } from "@/lib/use-load";

const paidInFull = (r: MessSubscriptionRecord): MessSubscriptionRecord => ({ ...r, received_amount: r.subscription_amount, payment_status: "Done" });

export default function MessDetailScreen() {
  const { id, added } = useLocalSearchParams<{ id: string; added?: string }>();
  const viewer = useViewer();
  const editable = viewer.permissions.includes("mess.manage");
  const canMark = editable || viewer.permissions.includes("deliveries.mark");
  const { data, error, loading, refreshing, refresh, reload } = useLoad(`mess:${id}`, () => api.messDetail(id));
  const editor = useMessEditor(data?.record, editable, () => void reload(), added === "1" ? "mess added" : null);
  const [hideMoney, setHideMoney] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { rec } = editor;

  if (!data || !rec) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.bar}>
          <BackButton fallback="/mess" size={30} label="Back to mess" />
        </View>
        {loading ? <ActivityIndicator style={styles.spinner} color="#111" /> : <T style={styles.loadError}>Couldn’t load this mess. {error}</T>}
      </SafeAreaView>
    );
  }

  const { row, zones, today } = data;
  const zoneName = zones.find((z) => z.id === rec.zone_id)?.name ?? rec.zone_name;
  const meals = planMeals(rec);
  const paid = rec.payment_status === "Done";
  const fullyPaid = paid && rec.received_amount >= rec.subscription_amount;
  const firstName = rec.customer_name.trim().split(/\s+/)[0] || "this";
  const money = (n: number) => (hideMoney ? "AED ••••" : aed(n));
  const address = [rec.building, zoneName].filter(Boolean);

  function share() {
    const message = [rec!.customer_name, rec!.contact, [rec!.building, rec!.flat, zoneName].filter(Boolean).join(", ")].filter(Boolean).join("\n");
    void Share.share({ title: rec!.customer_name, message }).catch(() => undefined);
  }

  const menuItems: { icon: RowIconName; label: string; run: () => void }[] = [
    ...(editable ? [{ icon: "Profile" as const, label: "Edit profile", run: editor.openProfile }] : []),
    { icon: hideMoney ? "Eye" : "EyeOff", label: hideMoney ? "Show amounts" : "Hide amounts", run: () => setHideMoney((h) => !h) },
    ...(editable ? [{ icon: "Note" as const, label: rec.remark ? "Edit note" : "Add a note", run: () => editor.open("note") }] : []),
    { icon: "Share", label: "Share details", run: share },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} contentContainerStyle={styles.scroll}>
        <Hero
          rec={rec}
          row={row}
          zoneName={zoneName}
          hideMoney={hideMoney}
          editable={editable}
          onMenu={() => setMenuOpen((o) => !o)}
          onProfile={editor.openProfile}
          onMeals={() => editor.open("meals")}
          onPayment={() => editor.open("payment")}
        />

        <View style={styles.body}>
          <Section title={`contact ${firstName}`} first>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badges} style={styles.badgeRow}>
              <ContactBadge icon="PhoneDevice" label={rec.contact ? "Call" : "No number"} url={telUrl(rec.contact)} />
              {whatsappUrl(rec.contact) ? <ContactBadge icon="WhatsApp" label="WhatsApp" url={whatsappUrl(rec.contact)} /> : null}
              <ContactBadge icon="MapFold" label={address.length ? "Directions" : "No address"} url={address.length ? mapsUrl([...address, "Dubai"].join(", ")) : null} />
            </ScrollView>
          </Section>

          <Section title="mess plan">
            <View style={rowStyles.row}>
              <RowIcon name="Cloche" size={22} />
              <RowText title="active mess" sub={rec.is_active ? "delivering" : "paused"} />
              <Switch
                value={rec.is_active}
                disabled={!editable || editor.saving}
                onValueChange={(on) => void editor.save({ ...rec, is_active: on }, on ? "mess is active" : "mess is paused")}
                trackColor={{ true: "#f97316", false: "#dcdcdc" }}
                thumbColor="#fff"
              />
            </View>
            <ValueRow icon="FoodMark" title="food" value={rec.meal_type.toLowerCase()} onPress={() => editor.open("food")} editable={editable} />
            <ValueRow
              icon="Plate"
              title="meals"
              sub={`${rec.meal_time_count} a day`}
              value={meals.length ? meals.map((u) => DELIVERY_UNIT_LABELS[u].toLowerCase()).join(", ") : "none"}
              onPress={() => editor.open("meals")}
              editable={editable}
            />
            <ValueRow icon="People" title="people" value={String(rec.person_count)} onPress={() => editor.open("people")} editable={editable} />
            <ValueRow icon="Ticket" title="mess type" value={messTypeLabel(rec.mess_category).toLowerCase()} onPress={() => editor.open("type")} editable={editable} />
            <ValueRow icon="Calendar" title="started" value={fmtMessStartDate(rec.start_date)} onPress={() => editor.open("start")} editable={editable} />
          </Section>

          <Section title="today’s meals">
            {row.meals.length ? (
              row.meals.map((u, i) => <MealRow key={u} row={row} unit={u} today={today} first={i === 0} canMark={canMark} onDone={() => void reload()} />)
            ) : (
              <T style={styles.empty}>no meals on this plan</T>
            )}
          </Section>

          <Section title="payment">
            <ValueRow icon="Wallet" title="monthly" value={rec.subscription_amount ? money(rec.subscription_amount) : "not set"} onPress={() => editor.open("payment")} editable={editable} first />
            <ValueRow icon="Coins" title="received" value={money(rec.received_amount)} onPress={() => editor.open("payment")} editable={editable} />
            <ValueRow icon="CalendarCheck" title="this month" value={paid ? "paid" : "due"} due={!paid} onPress={() => editor.open("payment")} editable={editable} />
            {editable && !fullyPaid && rec.subscription_amount > 0 ? (
              <View style={styles.wide}>
                <CredButton outline disabled={editor.saving} onPress={() => void editor.save(paidInFull(rec), "marked paid in full")}>
                  Mark paid in full
                </CredButton>
              </View>
            ) : null}
          </Section>

          <Section title="more actions">
            {editable ? <MoreRow icon="Profile" title="edit profile" sub="name, phone and address" onPress={editor.openProfile} first /> : null}
            {editable ? <MoreRow icon="Note" title={rec.remark ? "note" : "add a note"} sub={rec.remark || "delivery instructions"} onPress={() => editor.open("note")} /> : null}
            <MoreRow icon="Share" title="share details" sub="send to a delivery agent" onPress={share} first={!editable} />
          </Section>
        </View>
      </ScrollView>

      {editor.toast ? (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Check size={15} strokeWidth={2.6} color="#fff" />
          <T style={styles.toastText}>{editor.toast}</T>
        </View>
      ) : null}

      {menuOpen ? (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu" />
          <View style={styles.menu} accessibilityRole="menu">
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
                accessibilityRole="menuitem"
                onPress={() => {
                  setMenuOpen(false);
                  item.run();
                }}
              >
                <RowIcon name={item.icon} size={20} color="#52525b" />
                <T style={styles.menuText}>{item.label}</T>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {editable ? (
        <>
          <ProfileEditor editor={editor} zones={zones} />
          <EditSheets editor={editor} />
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingBottom: 40 },
  bar: { paddingHorizontal: 20, paddingTop: 10 },
  spinner: { marginTop: 60 },
  loadError: { margin: 20, padding: 12, borderRadius: 8, backgroundColor: "#fef3f2", color: "#d92d20" },
  body: { paddingHorizontal: 20 },
  badgeRow: { marginHorizontal: -20 },
  badges: { gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  empty: { marginTop: 8, marginBottom: 12, fontSize: 14, color: "#8a8a8a" },
  wide: { paddingVertical: 10 },
  toast: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#111",
  },
  toastText: { color: "#fff", fontSize: 13.5 },
  menu: {
    position: "absolute",
    top: 60,
    right: 14,
    minWidth: 196,
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  menuItem: { height: 44, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, borderRadius: 8 },
  menuPressed: { backgroundColor: "#f4f4f5" },
  menuText: { fontSize: 14.5, color: "#111" },
});

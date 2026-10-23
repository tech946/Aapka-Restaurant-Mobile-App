import type { ModuleKey } from "@aapka/shared";
import { router } from "expo-router";
import { BellOff, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Arrow, HomeIcon } from "@/components/art/Art";
import { TabScreen } from "@/components/TabScreen";
import { Sheet } from "@/components/ui/Overlays";
import { T } from "@/components/ui/Text";
import { GlanceChips, type GlanceChip } from "@/features/home/GlanceChips";
import { DishThumb, SellerList, priceAed } from "@/features/home/SellerList";
import { TodayCard } from "@/features/home/TodayCard";
import { api } from "@/lib/api";
import { useViewer } from "@/lib/auth";
import { hrefFor } from "@/lib/routes";
import { useLoad } from "@/lib/use-load";
import { fonts } from "@/theme";

const LIST_MAX = 8;
const fmt = (n: number) => n.toLocaleString("en-US");

export default function HomeScreen() {
  const viewer = useViewer();
  const { data, error, loading, refreshing, refresh } = useLoad("home", api.home);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [query, setQuery] = useState("");

  const can = (key: ModuleKey) => viewer.modules.includes(key);
  const pick = (key: ModuleKey): ModuleKey | undefined => (can(key) ? key : undefined);

  const home = data?.home;
  const dishes = useMemo(() => home?.dishes ?? [], [home]);
  const topSellers = useMemo(
    () => dishes.filter((d) => d.soldThisMonth > 0).sort((a, b) => b.soldThisMonth - a.soldThisMonth),
    [dishes],
  );
  const ranked = topSellers.length > 0;
  const list = (ranked ? topSellers : dishes).slice(0, LIST_MAX);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return dishes.filter((d) => d.name.toLowerCase().includes(q) || d.categoryName.toLowerCase().includes(q)).slice(0, 30);
  }, [dishes, query]);

  const stats = home?.stats;
  const chips: GlanceChip[] = [
    ...(stats
      ? ([
          { key: "sales", art: "sales", label: "sales", value: priceAed(stats.salesAed), positive: true, module: pick("sales") },
          { key: "orders", art: "orders", label: "orders", value: fmt(stats.salesCount), module: pick("sales") },
          { key: "tiffins", art: "deliveries", label: "tiffins out", value: fmt(stats.deliveredToday), module: pick("mess") },
          { key: "mess", art: "mess", label: "active mess", value: fmt(stats.activeMess), module: pick("mess") },
        ] satisfies GlanceChip[])
      : []),
    { key: "dishes", art: "menu", label: "dishes", value: fmt(dishes.length), module: pick("menu") },
    { key: "categories", art: "categories", label: "categories", value: fmt(home?.categories.length ?? 0), module: pick("menu") },
  ];

  const sheets = (
    <>
      <Sheet open={searchOpen} onClose={() => setSearchOpen(false)} title="Search">
        <View style={styles.search}>
          <Search size={18} strokeWidth={2} color="#8a8a8a" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search dishes or categories"
            placeholderTextColor="#9c9c9c"
            returnKeyType="search"
            autoFocus
            accessibilityLabel="Search dishes"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} accessibilityLabel="Clear" hitSlop={8}>
              <X size={15} strokeWidth={2.5} color="#555" />
            </Pressable>
          ) : null}
        </View>
        {query && !results.length ? <T style={styles.empty}>No dishes match “{query}”.</T> : null}
        {results.map((d) => (
          <View key={d.id} style={styles.result}>
            <DishThumb dish={d} />
            <View style={{ flex: 1 }}>
              <T style={styles.resultName}>{d.name}</T>
              <T style={styles.resultSub}>{d.categoryName}</T>
            </View>
            <T weight="medium" style={styles.resultPrice}>
              {priceAed(d.price)}
            </T>
          </View>
        ))}
      </Sheet>

      <Sheet open={bellOpen} onClose={() => setBellOpen(false)} title="Notifications">
        <View style={styles.quiet}>
          <View style={styles.quietIcon}>
            <BellOff size={26} strokeWidth={1.6} color="#555" />
          </View>
          <T weight="semibold" style={{ fontSize: 15, color: "#111" }}>
            You’re all caught up
          </T>
          <T style={{ fontSize: 13, color: "#8a8a8a", textAlign: "center" }}>
            New orders, deliveries and stock alerts will show up here.
          </T>
        </View>
      </Sheet>
    </>
  );

  return (
    <TabScreen current="home" refreshing={refreshing} onRefresh={refresh} overlay={sheets}>
      <View style={styles.head}>
        <Pressable style={styles.avatar} onPress={() => router.push("/profile")} accessibilityLabel="Profile">
          <T style={styles.avatarText}>{viewer.displayName.trim().charAt(0).toUpperCase() || "?"}</T>
        </Pressable>
        <Pressable style={styles.pill} onPress={() => router.navigate(can("sales") ? hrefFor("sales") : "/profile")}>
          <HomeIcon name="Badge" size={16} />
          <T numberOfLines={1} style={styles.pillText}>
            {stats ? `${priceAed(stats.salesAed)} today` : (viewer.role?.label ?? "").toLowerCase()}
          </T>
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => setSearchOpen(true)} accessibilityLabel="Search">
          <HomeIcon name="Search" size={22} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => setBellOpen(true)} accessibilityLabel="Notifications">
          <HomeIcon name="Bell" size={22} />
        </Pressable>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#111" /> : null}
      {error ? <T style={styles.error}>{error}</T> : null}
      {home?.error ? <T style={styles.error}>{home.error}</T> : null}

      {data ? (
        <>
          <T weight="semibold" style={styles.heading}>
            UNLOCKED FOR YOU
          </T>
          <TodayCard summary={data.today} />

          <T weight="semibold" style={styles.heading}>
            TODAY AT A GLANCE
          </T>
          <GlanceChips chips={chips} />

          {list.length ? (
            <>
              <View style={styles.headingRow}>
                <T weight="semibold" style={styles.heading}>
                  {(ranked ? "Top sellers" : "On the menu").toUpperCase()} ({list.length})
                </T>
                <Pressable style={styles.viewAll} onPress={() => router.navigate(can("menu") ? hrefFor("menu") : "/")}>
                  <T style={styles.viewAllText}>view all</T>
                  <Arrow name="small" size={10} color="#555" />
                </Pressable>
              </View>
              <SellerList
                dishes={list}
                ranked={ranked}
                rowModule={pick("menu") ?? "home"}
                promo={
                  ranked
                    ? { text: "your best sellers. keep them in stock.", module: pick("inventory") ?? pick("menu") ?? "home" }
                    : { text: "fresh from the kitchen today.", module: pick("menu") ?? "home" }
                }
              />
            </>
          ) : null}
        </>
      ) : null}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: "#e3e3e3",
    backgroundColor: "#3f5361",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 17, color: "#fff" },
  pill: {
    flex: 1,
    height: 32,
    marginHorizontal: 4,
    paddingLeft: 6,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#f8b597",
    borderRadius: 999,
    backgroundColor: "#fff3ec",
  },
  pillText: { fontSize: 13, color: "#111" },
  iconBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  error: { marginTop: 14, fontSize: 13, color: "#e5372b" },
  heading: { marginTop: 22, marginBottom: 10, fontSize: 11.5, letterSpacing: 1.8, color: "#6f6f6f" },
  headingRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 5 },
  viewAllText: { fontSize: 12.5, color: "#555" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f4f4f6",
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111", fontFamily: fonts.regular },
  empty: { marginTop: 18, textAlign: "center", color: "#8a8a8a" },
  result: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  resultName: { fontSize: 14, color: "#111" },
  resultSub: { fontSize: 12, color: "#8a8a8a" },
  resultPrice: { fontSize: 13, color: "#111" },
  quiet: { alignItems: "center", gap: 8, paddingVertical: 30 },
  quietIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f6" },
});

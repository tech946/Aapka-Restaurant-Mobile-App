import { useFocusEffect } from "expo-router";
import { Plus, Search, X } from "lucide-react-native";
import { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { ModuleArt } from "@/components/art/Art";
import { BackButton } from "@/components/ui/BackButton";
import { T } from "@/components/ui/Text";
import { AddMess } from "@/features/mess/AddMess";
import { NO_FILTERS, filterCount, filterSummary, matches, type Filters, type Tab } from "@/features/mess/filters";
import { MessCard } from "@/features/mess/MessCard";
import { MessFilters } from "@/features/mess/MessFilters";
import { api } from "@/lib/api";
import { useViewer } from "@/lib/auth";
import { useLoad } from "@/lib/use-load";
import { fonts } from "@/theme";

const TABS: Tab[] = ["active", "inactive"];

export default function MessScreen() {
  const canAdd = useViewer().permissions.includes("mess.manage");
  const { data, error, loading, refreshing, refresh, reload } = useLoad("mess", api.mess);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("active");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) firstFocus.current = false;
      else void reload();
    }, [reload]),
  );

  const all = useMemo(() => data?.rows ?? [], [data]);
  const zones = useMemo(() => data?.zones ?? [], [data]);
  const q = useDeferredValue(query.trim().toLowerCase());
  const rows = useMemo(() => all.filter((r) => matches(r, tab, filters, q)), [all, tab, filters, q]);
  const dueCount = useMemo(() => all.filter((r) => r.active && !r.paid).length, [all]);
  const applied = filterCount(filters);
  const summary = [...filterSummary(filters, zones), q ? `“${query.trim()}”` : ""].filter(Boolean);

  const header = (
    <>
      <View style={styles.top}>
        <BackButton fallback="/" size={30} label="Back to home" />
        <View style={styles.search}>
          <Search size={16} strokeWidth={1.9} color="#8a8a8a" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="search mess"
            placeholderTextColor="#a3a3a3"
            returnKeyType="search"
            maxLength={80}
            accessibilityLabel="Search mess"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} accessibilityLabel="Clear search" hitSlop={8}>
              <X size={13} strokeWidth={2.5} color="#555" />
            </Pressable>
          ) : null}
          {canAdd ? (
            <Pressable style={styles.searchAction} onPress={() => setAddOpen(true)} disabled={!data} accessibilityRole="button">
              <Plus size={16} strokeWidth={1.7} color="#111" />
              <T weight="medium" style={styles.actionText}>
                Add Mess
              </T>
            </Pressable>
          ) : null}
        </View>
      </View>

      <T weight="medium" style={styles.eyebrow}>
        ✦ {(dueCount ? `${dueCount} payments due this month` : "all paid this month").toUpperCase()}
      </T>

      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
            <T weight="semibold" style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {`${t} mess`.toUpperCase()}
            </T>
          </Pressable>
        ))}
      </View>

      {summary.length ? (
        <View style={styles.applied}>
          <T numberOfLines={1} style={styles.appliedText}>
            {summary.join(" · ")}
          </T>
          <Pressable
            onPress={() => {
              setFilters(NO_FILTERS);
              setQuery("");
            }}
          >
            <T style={styles.clear}>Clear</T>
          </Pressable>
        </View>
      ) : null}

      {loading ? <ActivityIndicator style={styles.spinner} color="#111" /> : null}
      {error ? <T style={styles.error}>{data ? error : `Couldn’t load the mess roster. ${error}`}</T> : null}
      {data?.error ? <T style={styles.error}>{data.error}</T> : null}
    </>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        renderItem={({ item, index }) => <MessCard row={item} first={index === 0} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          data ? (
            <View style={styles.empty}>
              <ModuleArt name="mess" size={56} />
              <T style={styles.emptyText}>{applied || q ? "No mess matches these filters." : "No mess here yet."}</T>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          setDraft(filters);
          setFiltersOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Filters"
      >
        <FunnelPlus />
        {applied ? (
          <View style={styles.badge}>
            <T weight="bold" style={styles.badgeText}>
              {applied}
            </T>
          </View>
        ) : null}
      </Pressable>

      <MessFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
        draft={draft}
        setDraft={setDraft}
        rows={all}
        zones={zones}
        tab={tab}
        query={q}
      />

      {data && canAdd ? <AddMess open={addOpen} onClose={() => setAddOpen(false)} rows={data.rows} zones={data.zones} today={data.today} /> : null}
    </SafeAreaView>
  );
}

function FunnelPlus() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13.354 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l1.218-1.348" />
      <Path d="M16 6h6" />
      <Path d="M19 3v6" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  list: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 110 },
  top: { flexDirection: "row", alignItems: "center", gap: 14, paddingRight: 4 },
  search: {
    flex: 1,
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingLeft: 13,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: "#d6d6d6",
    borderRadius: 999,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchInput: { flex: 1, minWidth: 0, fontSize: 14, color: "#111", fontFamily: fonts.regular },
  searchAction: { height: 37, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#ececec" },
  actionText: { fontSize: 13, color: "#111" },
  eyebrow: { marginTop: 22, marginBottom: 14, textAlign: "center", fontSize: 12, letterSpacing: 1, color: "#e2622f" },
  tabs: { height: 43, flexDirection: "row", padding: 3, borderRadius: 999, backgroundColor: "rgb(235,235,235)" },
  tab: { flex: 1, height: 37, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  tabOn: {
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: { fontSize: 11, letterSpacing: 1.5, color: "#979797" },
  tabTextOn: { color: "#2b2b2b" },
  applied: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginTop: 10 },
  appliedText: { flex: 1, fontSize: 12.5, color: "#6f6f6f" },
  clear: { fontSize: 12.5, color: "#111", textDecorationLine: "underline" },
  spinner: { marginTop: 40 },
  error: { marginTop: 14, padding: 12, borderRadius: 8, backgroundColor: "#fef3f2", color: "#d92d20", fontSize: 13 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 36 },
  emptyText: { color: "#7a7a7a", fontSize: 13.5 },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 34,
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabPressed: { transform: [{ scale: 0.95 }] },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f26b3a",
  },
  badgeText: { fontSize: 10.5, color: "#fff" },
});

import { SUPPORT_WHATSAPP_URL, moduleInfo, type ModuleInfo, type ModuleKey } from "@aapka/shared";
import { router } from "expo-router";
import { Search, UtensilsCrossed, X, Zap } from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { ModuleArt, SupportMark, type ModuleArtName } from "@/components/art/Art";
import { TabScreen } from "@/components/TabScreen";
import { T } from "@/components/ui/Text";
import { priceAed } from "@/features/home/SellerList";
import { api } from "@/lib/api";
import { useViewer } from "@/lib/auth";
import { openLink } from "@/lib/links";
import { addRecent, readRecents } from "@/lib/recents";
import { hrefFor } from "@/lib/routes";
import { useLoad } from "@/lib/use-load";
import { fonts } from "@/theme";

const SUGGESTIONS = ["sales today", "mess roster", "daily stock", "menu prices", "deliveries"];
const FOR_YOU: ModuleKey[] = ["sales", "deliveries", "mess", "inventory"];
const MANAGE: ModuleKey[] = ["menu", "customers", "reports"];

export default function MoreScreen() {
  const viewer = useViewer();
  const { data } = useLoad("home", api.home);
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    void readRecents().then(setRecents);
  }, []);
  const remember = () => void addRecent(query, recents).then(setRecents);

  const allowed = useMemo(
    () => viewer.modules.map((k) => moduleInfo(k)).filter((m): m is ModuleInfo => Boolean(m)),
    [viewer.modules],
  );
  const pick = (keys: ModuleKey[]) => allowed.filter((m) => keys.includes(m.key));
  const dishes = useMemo(() => data?.home.dishes ?? [], [data]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
    const mods = allowed.filter((m) => {
      const hay = `${m.label} ${m.description}`.toLowerCase();
      return hay.includes(q) || tokens.some((t) => hay.includes(t));
    });
    const foods = dishes.filter((d) => d.name.toLowerCase().includes(q) || d.categoryName.toLowerCase().includes(q)).slice(0, 20);
    return { mods, foods };
  }, [q, allowed, dishes]);

  const support = () => openLink(SUPPORT_WHATSAPP_URL);

  return (
    <TabScreen current="more">
      <View style={styles.top}>
        <View style={styles.search}>
          <Search size={18} strokeWidth={2} color="#8a8a8a" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={remember}
            returnKeyType="search"
            placeholder={`search “${SUGGESTIONS[0]}”`}
            placeholderTextColor="#a3a3a3"
            accessibilityLabel="Search"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} accessibilityLabel="Clear search" hitSlop={8}>
              <X size={14} strokeWidth={2.5} color="#555" />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.support} onPress={support} accessibilityLabel="Support">
          <SupportMark size={26} />
        </Pressable>
      </View>

      {recents.length ? (
        <View style={styles.recents}>
          <T weight="semibold" style={styles.recentsLabel}>
            RECENTS
          </T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {recents.map((r) => (
              <Pressable key={r} style={styles.recent} onPress={() => setQuery(r)}>
                <T weight="medium" style={{ fontSize: 13, color: "#111" }}>
                  “{r}”
                </T>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {results ? (
        <View style={{ marginTop: 10 }}>
          {results.mods.map((m) => (
            <Pressable
              key={m.key}
              style={styles.result}
              onPress={() => {
                remember();
                router.navigate(hrefFor(m.key));
              }}
            >
              <View style={styles.resultIcon}>{m.key === "home" ? null : <ModuleArt name={m.key as ModuleArtName} size={26} />}</View>
              <View style={{ flex: 1 }}>
                <T weight="medium" style={{ fontSize: 14.5, color: "#111" }}>
                  {m.label}
                </T>
                <T style={{ fontSize: 12.5, color: "#8a8a8a" }}>{m.description}</T>
              </View>
            </Pressable>
          ))}
          {results.foods.map((d) => (
            <View key={d.id} style={styles.result}>
              <View style={styles.resultIcon}>
                <UtensilsCrossed size={18} strokeWidth={1.6} color="#555" />
              </View>
              <View style={{ flex: 1 }}>
                <T weight="medium" style={{ fontSize: 14.5, color: "#111" }}>
                  {d.name}
                </T>
                <T style={{ fontSize: 12.5, color: "#8a8a8a" }}>{d.categoryName}</T>
              </View>
              <T weight="medium" style={{ fontSize: 13, color: "#111" }}>
                {priceAed(d.price)}
              </T>
            </View>
          ))}
          {!results.mods.length && !results.foods.length ? <T style={styles.empty}>Nothing matches “{query.trim()}”.</T> : null}
        </View>
      ) : (
        <>
          <View style={styles.try}>
            <View style={styles.headingRow}>
              <T weight="semibold" style={styles.heading}>
                TRY SEARCHING FOR
              </T>
              <Zap size={12} strokeWidth={2} fill="#f5c542" color="#f5c542" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} style={styles.tryChip} onPress={() => setQuery(s)}>
                  <T style={{ fontSize: 13.5, color: "#111" }}>{s}</T>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {pick(FOR_YOU).length ? (
            <>
              <T weight="semibold" style={styles.heading}>
                FOR YOU
              </T>
              <Tiles>
                {pick(FOR_YOU).map((m) => (
                  <Tile key={m.key} label={m.label.toLowerCase()} art={m.key as ModuleArtName} onPress={() => router.navigate(hrefFor(m.key))} />
                ))}
              </Tiles>
            </>
          ) : null}

          <T weight="semibold" style={styles.heading}>
            MANAGE
          </T>
          <Tiles>
            {pick(MANAGE).map((m) => (
              <Tile key={m.key} label={m.label.toLowerCase()} art={m.key as ModuleArtName} onPress={() => router.navigate(hrefFor(m.key))} />
            ))}
            <Tile label="profile" art="profile" onPress={() => router.push("/profile")} />
            <Tile label="help & support" art="support" onPress={support} />
          </Tiles>
        </>
      )}
    </TabScreen>
  );
}

function Tiles({ children }: { children: ReactNode }) {
  return <View style={styles.tiles}>{children}</View>;
}

function Tile({ label, art, onPress }: { label: string; art: ModuleArtName; onPress: () => void }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      {({ pressed }) => (
        <>
          <View style={[styles.circle, pressed && { backgroundColor: "#f6f6f6", transform: [{ scale: 0.95 }] }]}>
            <ModuleArt name={art} size={34} />
          </View>
          <T numberOfLines={2} style={styles.tileLabel}>
            {label}
          </T>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  search: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#e6e6e6",
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  searchInput: { flex: 1, fontSize: 14.5, color: "#111", fontFamily: fonts.regular },
  support: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#ececec", alignItems: "center", justifyContent: "center" },
  recents: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  recentsLabel: { fontSize: 11, letterSpacing: 1.5, color: "#6f6f6f" },
  recent: { height: 30, paddingHorizontal: 12, justifyContent: "center", borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, backgroundColor: "#f2f2f2" },
  try: { marginTop: 16, marginHorizontal: -18, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: "#fff5ef" },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heading: { marginTop: 22, marginBottom: 12, fontSize: 11.5, letterSpacing: 1.8, color: "#6f6f6f" },
  tryChip: { height: 34, paddingHorizontal: 16, justifyContent: "center", borderWidth: 1, borderColor: "#dde3e1", borderRadius: 8, backgroundColor: "#fff" },
  tiles: { flexDirection: "row", flexWrap: "wrap", rowGap: 14 },
  tile: { width: "25%", alignItems: "center", gap: 7, paddingHorizontal: 4 },
  circle: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: "#e6e6e6", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  tileLabel: { textAlign: "center", fontSize: 12, lineHeight: 15.6, color: "#111" },
  result: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  resultIcon: { width: 36, alignItems: "center" },
  empty: { marginTop: 18, textAlign: "center", color: "#8a8a8a" },
});

import type { HomeDish, ModuleKey } from "@aapka/shared";
import { Image } from "expo-image";
import { router } from "expo-router";
import { UtensilsCrossed } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Arrow } from "@/components/art/Art";
import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { hrefFor } from "@/lib/routes";

const VISIBLE = 2;
export const priceAed = (n: number) => `AED ${Number.isInteger(n) ? n : n.toFixed(2)}`;

export function DishThumb({ dish }: { dish: Pick<HomeDish, "imageUrl"> }) {
  return (
    <View style={styles.logo}>
      {dish.imageUrl ? (
        <Image source={{ uri: dish.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <UtensilsCrossed size={18} strokeWidth={1.75} color="#555" />
      )}
    </View>
  );
}

type Props = {
  dishes: HomeDish[];
  ranked: boolean;
  promo: { text: string; module: ModuleKey };
  rowModule: ModuleKey;
};

export function SellerList({ dishes, ranked, promo, rowModule }: Props) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? dishes : dishes.slice(0, VISIBLE);
  const hidden = dishes.length - VISIBLE;
  const next = dishes[VISIBLE];
  const openRow = () => router.navigate(hrefFor(rowModule));

  return (
    <>
      <View style={[styles.bills, !expanded && hidden > 0 && styles.stacked]}>
        {!expanded && hidden > 0 ? <View style={styles.stackEdge} /> : null}
        <Pressable style={styles.promo} onPress={() => router.navigate(hrefFor(promo.module))}>
          <View style={styles.star}>
            <T style={styles.starText}>★</T>
          </View>
          <T style={styles.promoText}>{promo.text}</T>
          <Arrow name="small" color="#444" />
        </Pressable>

        {shown.map((dish, i) => (
          <Pressable key={dish.id} onPress={openRow} style={({ pressed }) => [styles.bill, i > 0 && { marginTop: 6 }, pressed && { opacity: 0.85 }]}>
            <DishThumb dish={dish} />
            <View style={styles.body}>
              <T numberOfLines={1} style={styles.name}>
                {dish.name}
              </T>
              <T numberOfLines={1} style={styles.sub}>
                <T weight="bold" style={styles.cat}>
                  {(dish.categoryName || "menu").toUpperCase()}
                </T>
                {ranked ? ` · #${i + 1} this month` : ""}
              </T>
            </View>
            <View style={styles.side}>
              <PopButton size="small" style={styles.pay} onPress={openRow}>
                {priceAed(dish.price)}
              </PopButton>
              <T weight="semibold" style={styles.due}>
                {(ranked && dish.soldThisMonth > 0 ? `${dish.soldThisMonth} sold this month` : "available now").toUpperCase()}
              </T>
            </View>
          </Pressable>
        ))}
      </View>

      {hidden > 0 && next ? (
        <Pressable style={styles.more} onPress={() => setExpanded((e) => !e)} accessibilityState={{ expanded }}>
          {expanded ? null : <DishThumb dish={next} />}
          <T style={styles.moreText}>
            {expanded ? "Show less" : `+${hidden} more ${hidden === 1 ? "dish" : "dishes"}`}
          </T>
          <Arrow name={expanded ? "chevronUp" : "chevronDown"} color="#111" />
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  bills: { borderRadius: 20, backgroundColor: "#f2f2f2" },
  stacked: { marginBottom: 10 },
  stackEdge: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: -8,
    height: 20,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#e3e3e3",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "#fff",
  },
  promo: { height: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  star: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5b942",
    transform: [{ rotate: "8deg" }],
  },
  starText: { fontSize: 12, lineHeight: 14, color: "#7c2d12" },
  promoText: { fontSize: 12, color: "#444" },
  bill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 14, color: "#111" },
  sub: { fontSize: 11, letterSpacing: 0.4, color: "#8a8a8a" },
  cat: { fontSize: 11, color: "#1a1f71" },
  side: { alignItems: "center", gap: 6 },
  pay: { minWidth: 80 },
  due: { fontSize: 8, letterSpacing: 1, color: "#e8762c" },
  more: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 7,
    height: 34,
    marginTop: 14,
    paddingLeft: 5,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 999,
    backgroundColor: "#f6f6f6",
  },
  moreText: { fontSize: 13, color: "#111" },
});

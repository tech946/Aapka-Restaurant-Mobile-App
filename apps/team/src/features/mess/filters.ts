import { MEAL_NAME, type DeliveryUnit, type MessCategory, type MessRow, type Zone } from "@aapka/shared";

export type Tab = "active" | "inactive";

export type Filters = {
  meal: "" | DeliveryUnit;
  pay: "" | "due" | "paid";
  food: "" | "Veg" | "Non Veg";
  type: "" | MessCategory;
  zoneIds: string[];
};

export const NO_FILTERS: Filters = { meal: "", pay: "", food: "", type: "", zoneIds: [] };

export function matches(r: MessRow, tab: Tab, f: Filters, q: string): boolean {
  if ((tab === "active") !== r.active) return false;
  if (f.meal && !r.meals.includes(f.meal)) return false;
  if (f.pay === "due" && r.paid) return false;
  if (f.pay === "paid" && !r.paid) return false;
  if (f.food && r.mealType !== f.food) return false;
  if (f.type && r.category !== f.type) return false;
  if (f.zoneIds.length && !f.zoneIds.includes(r.zoneId)) return false;
  return !q || `${r.name} ${r.contact} ${r.place} ${r.zone}`.toLowerCase().includes(q);
}

export const filterCount = (f: Filters) => [f.meal, f.pay, f.food, f.type, f.zoneIds.length > 0].filter(Boolean).length;

export function filterSummary(f: Filters, zones: Zone[]): string[] {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? "zone";
  return [f.meal ? MEAL_NAME[f.meal] : "", f.pay, f.food.toLowerCase(), f.type ? `${f.type} mess` : "", ...f.zoneIds.map(zoneName)].filter(Boolean);
}

export function mealLine(row: MessRow): string {
  if (!row.meals.length) return "no meals on the plan";
  return [...row.meals.map((u) => `${row.delivered.includes(u) ? "✓ " : ""}${MEAL_NAME[u]}`), row.mealType.toLowerCase()].join(" · ");
}

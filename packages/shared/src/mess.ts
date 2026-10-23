import type { DeliveryUnit, MessCategory, MessSubscriptionRecord } from "./types";

export const DELIVERY_UNIT_ORDER: DeliveryUnit[] = ["BF", "L", "D"];

export const DELIVERY_UNIT_LABELS: Record<DeliveryUnit, string> = {
  BF: "Breakfast",
  L: "Lunch",
  D: "Dinner",
};

export const MEAL_NAME: Record<DeliveryUnit, string> = { BF: "breakfast", L: "lunch", D: "dinner" };

export const MEAL_STATUS_OPTIONS = ["No", "Yes (BF)", "Yes (L)", "Yes (BF+L)", "Yes (L+D)", "Yes (D)"] as const;

export function mealsFromStatus(status: string): DeliveryUnit[] {
  switch (status.trim()) {
    case "Yes (BF)":
      return ["BF"];
    case "Yes (L)":
      return ["L"];
    case "Yes (D)":
      return ["D"];
    case "Yes (BF+L)":
      return ["BF", "L"];
    case "Yes (L+D)":
      return ["L", "D"];
    default:
      return [];
  }
}

export function fmtMessStartDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function fmtMessTime(t: string | null | undefined): string {
  if (!t) return "—";
  const parts = t.split(":");
  const hour = parseInt(parts[0] ?? "0", 10);
  const minute = parts[1] ?? "00";
  if (Number.isNaN(hour)) return t;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${ampm}`;
}

export const messTypeLabel = (c: MessCategory | null) => (c === "new" ? "New mess" : c === "old" ? "Old mess" : "Not set");

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const aed = (n: number) => `AED ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const AVATAR_COLOURS = ["#1a73e8", "#34a853", "#e8710a", "#a142f4", "#d93025", "#12b5cb", "#f29900", "#5f6368"];

export function avatarColour(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}

export function whatsappUrl(contact: string): string | null {
  let digits = contact.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `971${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export function planMeals(r: MessSubscriptionRecord): DeliveryUnit[] {
  const units = new Set([r.morning_status, r.afternoon_status, r.evening_status].flatMap(mealsFromStatus));
  return DELIVERY_UNIT_ORDER.filter((u) => units.has(u));
}

export function messBodyFrom(r: MessSubscriptionRecord) {
  return {
    start_date: r.start_date,
    customer_name: r.customer_name,
    contact: r.contact,
    zone_id: r.zone_id,
    building: r.building,
    flat: r.flat,
    meal_time_count: r.meal_time_count,
    person_count: r.person_count,
    meal_type: r.meal_type,
    morning_status: r.morning_status,
    morning_time: r.morning_time || null,
    afternoon_status: r.afternoon_status,
    afternoon_time: r.afternoon_time || null,
    evening_status: r.evening_status,
    evening_time: r.evening_time || null,
    payment_status: r.payment_status,
    subscription_amount: Number(r.subscription_amount) || 0,
    received_amount: Number(r.received_amount) || 0,
    remark: r.remark,
    is_active: r.is_active,
    mess_category: r.mess_category,
    meal_id: r.meal_id,
    lead_source: r.lead_source,
  };
}

export type MessBody = ReturnType<typeof messBodyFrom>;

import type { ModuleKey } from "./modules";

export type RoleKey = "super_admin" | "driver" | "crm_manager";

export type AppSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type Viewer = {
  id: string;
  email: string;
  displayName: string;
  memberSince: number | null;
  role: { key: RoleKey; label: string; description: string } | null;
  modules: ModuleKey[];
  permissions: string[];
};

export type HomeStats = {
  salesAed: number;
  salesCount: number;
  activeMess: number;
  deliveredToday: number;
};

export type HomeCategory = { id: string; name: string; imageUrl: string | null };

export type HomeDish = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  soldThisMonth: number;
};

export type HomeData = {
  todayLabel: string;
  stats: HomeStats | null;
  categories: HomeCategory[];
  dishes: HomeDish[];
  error: string | null;
};

export type TodaySummary = {
  eyebrow: string;
  title: string[];
  cta: { label: string; module: ModuleKey };
};

export type HomeResponse = { home: HomeData; today: TodaySummary };

export type DeliveryUnit = "BF" | "L" | "D";
export type MealType = "Veg" | "Non Veg";
export type MessCategory = "new" | "old";

export type MessSubscriptionRecord = {
  id: string;
  start_date: string;
  customer_name: string;
  contact: string;
  zone_id: string;
  zone_name: string;
  building: string;
  flat: string;
  meal_time_count: number;
  person_count: number;
  meal_type: MealType;
  morning_status: string;
  morning_time: string | null;
  afternoon_status: string;
  afternoon_time: string | null;
  evening_status: string;
  evening_time: string | null;
  payment_status: string;
  subscription_amount: number;
  received_amount: number;
  remark: string;
  is_active: boolean;
  mess_category: MessCategory | null;
  meal_id: string | null;
  lead_source: string;
  created_at: string;
  updated_at: string;
};

export type MessRow = {
  id: string;
  name: string;
  contact: string;
  zoneId: string;
  zone: string;
  place: string;
  meals: DeliveryUnit[];
  dueToday: DeliveryUnit[];
  delivered: DeliveryUnit[];
  times: Partial<Record<DeliveryUnit, string>>;
  persons: number;
  mealType: MealType;
  category: MessCategory | null;
  paid: boolean;
  amount: number;
  received: number;
  active: boolean;
  startDate: string;
  remark: string;
};

export type Zone = { id: string; name: string };

export type MessData = {
  rows: MessRow[];
  zones: Zone[];
  today: string;
  error: string | null;
};

export type MessDetail = {
  row: MessRow;
  record: MessSubscriptionRecord;
  zones: Zone[];
  today: string;
  error: null;
};

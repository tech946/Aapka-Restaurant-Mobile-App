export type ModuleKey =
  | "home"
  | "sales"
  | "deliveries"
  | "mess"
  | "inventory"
  | "menu"
  | "customers"
  | "reports";

export type ModuleInfo = {
  key: ModuleKey;
  label: string;
  description: string;
};

export const MODULES: readonly ModuleInfo[] = [
  { key: "home", label: "Home", description: "Today at a glance" },
  { key: "sales", label: "Sales", description: "Sales orders and their items" },
  { key: "deliveries", label: "Deliveries", description: "Assigned and completed deliveries" },
  { key: "mess", label: "Mess", description: "Tiffin subscriptions and roster" },
  { key: "inventory", label: "Inventory", description: "Daily stock and inventory" },
  { key: "menu", label: "Menu", description: "Dishes, categories and prices" },
  { key: "customers", label: "Customers", description: "Customer list and history" },
  { key: "reports", label: "Reports", description: "Sales and delivery reports" },
];

export const NAV_BAR: readonly { key: ModuleKey; centre?: boolean }[] = [
  { key: "home" },
  { key: "inventory" },
  { key: "sales", centre: true },
  { key: "mess" },
];

export function moduleInfo(key: string): ModuleInfo | undefined {
  return MODULES.find((m) => m.key === key);
}

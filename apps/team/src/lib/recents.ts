import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "aapka.team.more-recents";
const MAX = 4;

export async function readRecents(): Promise<string[]> {
  try {
    const parsed: unknown = JSON.parse((await AsyncStorage.getItem(KEY)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export async function addRecent(query: string, current: string[]): Promise<string[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return current;
  const next = [q, ...current.filter((r) => r !== q)].slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  return next;
}

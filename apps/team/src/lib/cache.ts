const MAX_ENTRIES = 50;

const store = new Map<string, unknown>();

export function readCache<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function writeCache<T>(key: string, value: T) {
  store.delete(key);
  store.set(key, value);
  if (store.size > MAX_ENTRIES) store.delete(store.keys().next().value as string);
}

export function clearCache() {
  store.clear();
}

import type { AppSession, SessionStore } from "@aapka/shared";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "aapka.team.session";

async function read(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

async function write(value: string | null): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (value === null) globalThis.localStorage?.removeItem(KEY);
      else globalThis.localStorage?.setItem(KEY, value);
    } catch {
      return;
    }
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(KEY);
  else await SecureStore.setItemAsync(KEY, value);
}

export const sessionStore: SessionStore = {
  async load() {
    const raw = await read().catch(() => null);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw) as AppSession;
      return s.accessToken && s.refreshToken ? s : null;
    } catch {
      return null;
    }
  },
  async save(session) {
    await write(session ? JSON.stringify(session) : null);
  },
};

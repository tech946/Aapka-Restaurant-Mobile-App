import { createApi } from "@aapka/shared";

import { clearCache } from "./cache";
import { sessionStore } from "./session-store";

function resolveApiUrl(): string {
  const url = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  if (!__DEV__ && !url.startsWith("https://")) {
    throw new Error("EXPO_PUBLIC_API_URL must use https:// in release builds.");
  }
  return url;
}

export const API_URL = resolveApiUrl();

type Listener = () => void;
const signedOutListeners = new Set<Listener>();

export function onSignedOut(listener: Listener) {
  signedOutListeners.add(listener);
  return () => {
    signedOutListeners.delete(listener);
  };
}

export const api = createApi({
  baseUrl: API_URL,
  store: sessionStore,
  onSignedOut: () => {
    clearCache();
    signedOutListeners.forEach((l) => l());
  },
});

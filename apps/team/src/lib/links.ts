import { Linking } from "react-native";

const ALLOWED = __DEV__ ? /^(https?:\/\/|tel:)/ : /^(https:\/\/|tel:)/;

export function telUrl(contact: string): string | null {
  const cleaned = contact.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return cleaned.replace(/\D/g, "").length >= 5 ? `tel:${cleaned}` : null;
}

export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function openLink(url: string | null) {
  if (!url || !ALLOWED.test(url)) return;
  void Linking.openURL(url).catch(() => undefined);
}

import type { ModuleKey } from "@aapka/shared";
import type { Href } from "expo-router";

export function hrefFor(key: ModuleKey): Href {
  if (key === "home") return "/";
  if (key === "mess") return "/mess";
  return { pathname: "/module/[key]", params: { key } };
}

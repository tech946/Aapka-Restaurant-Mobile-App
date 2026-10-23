import { SvgXml } from "react-native-svg";

import { SVG } from "./svgs";

export type RowIconName = keyof typeof SVG.row;
export type ModuleArtName = keyof typeof SVG.module;
export type NavIconName = keyof typeof SVG.nav;
export type ArrowName = keyof typeof SVG.arrows;
export type ContactIconName = keyof typeof SVG.contact;
export type HomeIconName = keyof typeof SVG.home;

type Size = { size?: number; color?: string };

function scaled(xml: string, width: number) {
  const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(xml);
  const [w, h] = m ? [Number(m[1]), Number(m[2])] : [1, 1];
  return { width, height: (width * h) / w };
}

export function RowIcon({ name, size = 22, color = "#111" }: Size & { name: RowIconName }) {
  return <SvgXml xml={SVG.row[name]} width={size} height={size} color={color} />;
}

export function ModuleArt({ name, size = 34 }: Size & { name: ModuleArtName }) {
  return <SvgXml xml={SVG.module[name]} width={size} height={size} />;
}

export function NavIcon({ name, active, size = 26 }: Size & { name: NavIconName; active: boolean }) {
  return <SvgXml xml={SVG.nav[name][active ? "active" : "idle"]} width={size} height={size} />;
}

export function Arrow({ name, size, color = "#111" }: Size & { name: ArrowName }) {
  const xml = SVG.arrows[name];
  const fallback = name.startsWith("nav") ? 26 : name === "button" ? 16 : name === "small" ? 11 : 12;
  return <SvgXml xml={xml} {...scaled(xml, size ?? fallback)} color={color} />;
}

export function ContactIcon({ name, size = 20, color = "#111" }: Size & { name: ContactIconName }) {
  return <SvgXml xml={SVG.contact[name]} width={size} height={size} color={color} />;
}

export function HomeIcon({ name, size, color = "#111" }: Size & { name: HomeIconName }) {
  const xml = SVG.home[name];
  return <SvgXml xml={xml} {...scaled(xml, size ?? 24)} color={color} />;
}

export function SupportMark({ size = 30 }: Size) {
  return <SvgXml xml={SVG.supportMark} {...scaled(SVG.supportMark, size)} />;
}

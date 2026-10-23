import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const web = resolve(process.argv[2] ?? "../aapka-tourism-restaurant");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../apps/team/src/components/art/svgs.ts");

const webRequire = createRequire(join(web, "package.json"));
const React = webRequire("react");
const { renderToStaticMarkup } = webRequire("react-dom/server");
(globalThis as { React?: unknown }).React = React;

const pwa = join(web, "app/pwa/(app)");
const load = (rel: string) => import(pathToFileURL(join(pwa, rel)).href);

const nav = await load("_components/nav-icons.tsx");
const modules = await load("_components/module-icons.tsx");
const rows = await load("mess/[id]/row-icons.tsx");
const contact = await load("mess/[id]/contact-icons.tsx");
const homeIcons = await load("_components/home/home-icons.tsx");
const support = await load("_components/SupportMark.tsx");
const arrows = await load("_components/pop/arrows.tsx");

const render = (Comp: unknown, props: Record<string, unknown> = {}) =>
  (renderToStaticMarkup(React.createElement(Comp, props)) as string).replace(/ aria-hidden="true"/g, "");

function navLook(name: string, active: boolean): string {
  let svg = render(nav.NavIcon, { name, active });
  if (name === "more") {
    svg = svg
      .replace(/class="nav-ico__sq nav-ico__sq--alt"/g, `fill="${active ? "#8a8a8a" : "#4d4d4d"}"`)
      .replace(/class="nav-ico__sq"/g, `fill="${active ? "#fff" : "#8a8a8a"}"`);
  } else {
    svg = svg
      .replace(/class="nav-ico__idle"/g, active ? 'opacity="0"' : "")
      .replace(/class="nav-ico__active"/g, active ? "" : 'opacity="0"');
  }
  return svg.replace(/ class="[^"]*"/g, "").replace(/ pathLength="1"/g, "");
}

const NAV = ["home", "inventory", "sales", "mess", "menu", "more"];
const MODULE_ART = [
  "sales", "deliveries", "mess", "inventory", "menu", "customers",
  "reports", "orders", "categories", "profile", "support",
];
const ROW = Object.keys(rows).filter((k) => k.endsWith("Icon") && k !== "EyeIcon");

const art = {
  nav: Object.fromEntries(NAV.map((n) => [n, { idle: navLook(n, false), active: navLook(n, true) }])),
  module: Object.fromEntries(MODULE_ART.map((n) => [n, render(modules.ModuleArt, { name: n, size: 40 })])),
  row: {
    ...Object.fromEntries(ROW.map((k) => [k.replace(/Icon$/, ""), render(rows[k], { size: 24 })])),
    Eye: render(rows.EyeIcon, { size: 24 }),
    EyeOff: render(rows.EyeIcon, { size: 24, off: true }),
  },
  contact: {
    PhoneDevice: render(contact.PhoneDeviceIcon),
    WhatsApp: render(contact.WhatsAppIcon),
    MapFold: render(contact.MapFoldIcon),
  },
  home: {
    Search: render(homeIcons.SearchIcon),
    Bell: render(homeIcons.BellIcon),
    Badge: render(homeIcons.BadgeIcon),
  },
  supportMark: render(support.SupportMark, { size: 30 }),
  arrows: {
    navLeft: render(arrows.NavArrow, { dir: "left" }),
    navRight: render(arrows.NavArrow, { dir: "right" }),
    button: render(arrows.ButtonArrow),
    small: render(arrows.SmallArrow),
    chevronDown: render(arrows.Chevron, { dir: "down" }),
    chevronUp: render(arrows.Chevron, { dir: "up" }),
    chevronRight: render(arrows.Chevron, { dir: "right" }),
  },
};

writeFileSync(
  out,
  `export const SVG = ${JSON.stringify(art, null, 2)} as const;\n`,
);
console.log(`wrote ${out}`);

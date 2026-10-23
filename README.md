# Aapka mobile apps

Expo (React Native) apps for Aapka Restaurant. They talk only to the website's
`/api/app-modules/*` routes (in `aapka-tourism-restaurant`), which reuse the
same Supabase data, roles and permissions as the website and the `/pwa`.

```
apps/team        Aapka Team — staff & drivers (Expo SDK 58, Expo Router)
packages/shared  API client, response types, module list, mess helpers
tools/gen-art.mts  copies the PWA's SVG icons into the app
```

A customer app will go in `apps/customer` and reuse `packages/shared`.

## Team app screens

Login (onboarding → email → 6-digit code → verified), no-access, home,
more, profile, mess list (search, tabs, filters, add mess), mess detail
(edits, mark meals delivered, call / WhatsApp / directions, share), and a
"coming soon" screen for modules not built yet. What a user sees follows
their role, exactly like the PWA.

## Set up once

```bash
npm install
cp apps/team/.env.example apps/team/.env.local
```

Set `EXPO_PUBLIC_API_URL` in `apps/team/.env.local` to the website origin:
`http://localhost:3000` for the web preview, your PC's Wi-Fi IP (e.g.
`http://192.168.1.20:3000`) for a phone, the live site for real builds.

Run the website (`npm run dev` in `aapka-tourism-restaurant`) alongside.

## Check the UI

- **In a browser:** `npm run team:web`, open http://localhost:8081 and use the
  browser's phone view (DevTools → device toolbar).
- **On your phone:** install **Expo Go**, log in to Expo in it and in the
  terminal (`npx expo login`), then `npm run team` and scan the QR code.
  Phone and PC must be on the same Wi-Fi (or run `npx expo start --tunnel`
  in `apps/team`).
- **Android emulator:** install Android Studio, start an emulator, press `a`
  in the `npm run team` terminal.

## Checks

```bash
npm run typecheck
npm run lint
```

## Real builds (later)

Background location and push notifications need a development build
instead of Expo Go: `npx eas-cli@latest build --profile development --platform android`.
Before store builds: replace `assets/images/icon.png` with a 1024×1024 icon
and point `EXPO_PUBLIC_API_URL` at the live website.

## When the website's icons change

```bash
npx tsx tools/gen-art.mts ../aapka-tourism-restaurant
```

# Bexo

A mobile-first portfolio builder for students and early-career professionals — sign in with your phone, upload your resume, and get a live portfolio site at yourhandle.mybexo.com in minutes.

## Run & Operate

- `artifacts/bexo: expo` workflow — runs the Expo app (QR code for Expo Go + web preview)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- Expo + React Native + TypeScript
- Expo Router (file-based routing)
- Zustand + AsyncStorage (persisted state, no server needed yet)
- DM Sans (UI font) + JetBrains Mono (metrics)
- pnpm workspaces, Node.js 24

## Where things live

- `artifacts/bexo/app/` — all screens (Expo Router)
- `artifacts/bexo/stores/` — Zustand stores (auth, profile, portfolio)
- `artifacts/bexo/components/` — shared UI components
- `artifacts/bexo/services/` — stubbed services (resume parser, upload, achievement parser)
- `artifacts/bexo/constants/` — design tokens (colors.ts, theme.ts)

## Architecture decisions

- **No real Supabase yet**: all auth and data is stored in AsyncStorage via Zustand persist. OTP fixed code is `0000`. Replace stores with real Supabase client when credentials are ready.
- **Onboarding step machine**: `useProfileStore.onboardingStep` drives routing. Root `app/index.tsx` reads it and redirects to the correct screen. Set to `'completed'` or reach 90% completeness to unlock main tabs.
- **Profile completeness gate**: weighted score (15+15+10+15+15+15+10+5=100). Must hit 90% to trigger portfolio build.
- **website_preference** stored as comma-separated TEXT (e.g. `"Minimal,Bold,Creative"`).
- **Resume parsing** is stubbed with realistic mock data in `services/resumeParser.ts`. Replace `uploadAndParseResume()` with real AI call.
- Metro config patched (`metro.config.js`) to resolve pnpm symlinks: `unstable_enableSymlinks: true` + explicit `nodeModulesPaths`.

## Product

- Phone + OTP sign-in (WhatsApp stub, fixed code `0000` in dev)
- 11-step onboarding: email → photo → handle → resume → cards → about → dob → theme → font → preference → generating
- Dashboard with completeness ring, quick stats, recent updates feed
- Portfolio tab showing all sections (experience, education, projects, skills)
- Post tab for adding achievements, new roles, shipped projects
- Portfolio auto-builds when profile hits 90% completeness

## User preferences

_None specified yet._

## Gotchas

- Always run `pnpm --filter @workspace/bexo add <pkg>` not `pnpm add` at root — packages must be declared in the artifact's `package.json`.
- expo-document-picker and expo-image-manipulator must be pinned to `~14.0.8` (Expo 54 SDK compatible versions, NOT 56.x).
- Metro's `unstable_enableSymlinks` is required for pnpm to resolve any new packages.
- JetBrains Mono package: `@expo-google-fonts/jetbrains-mono` (not `expo-google-fonts/jetbrains-mono`).
- `(intro)` route group: register as `(intro)/index` in the Stack, not `(intro)`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo Go compatibility rules before adding new packages

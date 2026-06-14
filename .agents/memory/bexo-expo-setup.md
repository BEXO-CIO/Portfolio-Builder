---
name: Bexo Expo setup quirks
description: Metro config and package version rules for the Bexo Expo app in the pnpm monorepo
---

## Metro + pnpm symlinks

Metro doesn't follow pnpm symlinks by default. Any new package added to `@workspace/bexo` needs this in `metro.config.js`:

```js
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules/.pnpm'),
];
config.watchFolders = [workspaceRoot];
```

**Why:** pnpm stores packages in a content-addressable store and symlinks them. Metro's default resolver doesn't traverse symlinks, so packages installed via pnpm appear "not found" even though they exist on disk.

**How to apply:** Every time a new `expo-*` package is added to `artifacts/bexo`, this config is already in place — no changes needed unless it's reverted.

## Expo SDK 54 package version pins

These packages must be pinned to their Expo 54 compatible versions (NOT 56.x which shipped with a different SDK):
- `expo-document-picker`: `~14.0.8`
- `expo-image-manipulator`: `~14.0.8`

Running `pnpm --filter @workspace/bexo add expo-document-picker` without a version will grab the latest (56.x) which is incompatible.

## Route groups in Stack.Screen

For route groups that contain only `index.tsx` (like `(intro)/index.tsx`), register as `(intro)/index` not `(intro)` in the root Stack. Expo Router flattens single-file groups.

## Font packages

- DM Sans: `@expo-google-fonts/dm-sans`
- JetBrains Mono: `@expo-google-fonts/jetbrains-mono`
Both are in `artifacts/bexo/package.json` devDependencies.

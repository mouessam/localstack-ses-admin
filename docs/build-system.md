# Build System

This monorepo uses npm workspaces and a shared TypeScript base config.

## Package Build Strategy

- `@ses-admin/shared`: TypeScript compile (`tsc`) emits publishable library output in `dist/`.
- `@ses-admin/server`: TypeScript typecheck (`tsc --noEmit`) + esbuild bundle to `dist/main.js`.
- `@ses-admin/ui`: TypeScript typecheck (`tsc --noEmit`) + esbuild bundle to `dist/app.js` and `dist/index.html`.

## Alias Resolution

Workspace aliases are defined in `/Users/moessam/WebstormProjects/localstack-ses-viewr/tsconfig.base.json`:

- `@ses-admin/shared`
- `@ses-admin/server`
- `@ses-admin/ui`

esbuild path aliasing is centralized in `@ses-admin/build-tools`:

- `/Users/moessam/WebstormProjects/localstack-ses-viewr/packages/build-tools/esbuild-alias-plugin.cjs`

Both server and UI consume that plugin for bundling.

## Standard Scripts

Each package exposes:

- `clean`
- `build`
- `dev`
- `typecheck`
- `lint`
- `test`
- `test:coverage`

Workspace commands from repo root:

- `npm run build --workspaces`
- `npm run typecheck --workspaces`
- `npm run test --workspaces`
- `npm run test:coverage --workspaces`

## Output Contract

- Shared output: `/Users/moessam/WebstormProjects/localstack-ses-viewr/packages/shared/dist`
- Server runtime bundle: `/Users/moessam/WebstormProjects/localstack-ses-viewr/packages/server/dist/main.js`
- UI static bundle: `/Users/moessam/WebstormProjects/localstack-ses-viewr/packages/ui/dist`
- Coverage summaries:
  `/Users/moessam/WebstormProjects/localstack-ses-viewr/packages/<pkg>/coverage/coverage-summary.json`

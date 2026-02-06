# BUILD SYSTEM

Npm workspaces, shared TypeScript config, hybrid build per package.

## PACKAGE STRATEGY
| Package | Build | Output |
|----------|--------|---------|
| shared | `tsc` | `dist/` (library) |
| server | `tsc --noEmit` + esbuild | `dist/main.js` (bundle) |
| ui | `tsc --noEmit` + esbuild | `dist/app.js`, `dist/index.html` (bundle) |

## ALIASES
TypeScript `paths`: `@ses-admin/{shared,server,ui}` → package src/  
esbuild plugin: Runtime alias resolution via `packages/build-tools/esbuild-alias-plugin.cjs`

## STANDARD SCRIPTS
Each package: `clean`, `build`, `dev`, `typecheck`, `lint`, `test`, `test:coverage`

Workspace: `npm run {command} --workspaces`

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add alias | tsconfig.base.json | Update paths |
| Fix bundle | package/esbuild.config.js | Plugin config |
| Hot reload | server/src/delivery/http/create-server.ts | SSE endpoint |
| Coverage | package.json | c8 config |

## CONVENTIONS
- **prebuild: clean**: Always fresh build (remove dist/ + .tsbuildinfo)
- **Hybrid typecheck**: tsc validates types, esbuild produces runtime
- **Shared plugin**: Both server/ui consume `@ses-admin/build-tools` for aliasing
- **Workspace order**: `npm run build` builds shared first (dependency of server/ui)

## UNIQUE STYLES
- **Hot reload**: SSE-based (Server-Sent Events) via `/__reload` endpoint
- **Docker caching**: Layer cache (package.json → build) for fast rebuilds
- **Coverage enforcement**: 80% target, CI gate
- **No bundling frameworks**: Pure esbuild (not webpack/vite)

## OUTPUT
- Shared: `packages/shared/dist/`
- Server: `packages/server/dist/main.js`
- UI: `packages/ui/dist/` (app.js + index.html)
- Coverage: `packages/<pkg>/coverage/*.json`

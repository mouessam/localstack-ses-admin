# ARCHITECTURE

Clean Architecture with ports/adapters. Single container serves Fastify API + React UI.

## OVERVIEW
Monorepo: 3 packages (shared, server, ui). Server implements Clean Architecture layers. UI uses feature-based organization.

## STRUCTURE
```
packages/shared/      # Zod schemas
packages/server/      # Fastify API, Clean Architecture layers
│   ├── domain/ports/       # SesPort, MessagesPort
│   ├── domain/models/      # Domain types
│   ├── application/        # Use cases (thin functions)
│   ├── infrastructure/     # AWS/LocalStack adapters
│   ├── delivery/http/      # Fastify routes
│   └── main.ts            # Composition root
packages/ui/          # React SPA, feature-based
    ├── api/              # Type-safe client
    ├── components/        # UI + layout
    ├── features/          # Pages (identities, messages, send, raw)
    └── lib/              # Utilities
```

## DATA FLOW
```
React UI → Fastify Routes → Use Cases → Port Interfaces → Adapters (AWS/LocalStack)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add SES use case | server/src/application/ | Create function, call port |
| Add API endpoint | server/src/delivery/http/routes.ts | Register route, call use case |
| Implement port | server/src/infrastructure/ | Create adapter, implement interface |
| Add domain type | server/src/domain/models/ | Define type |
| Configure deps | server/src/main.ts | Wire adapters |
| Add UI feature | ui/src/features/[name]/ | Page component |
| Add UI component | ui/src/components/ | Follow component pattern |
| Add API client fn | ui/src/api/client.ts | Fetch wrapper, typed |
| Add shared schema | shared/src/schemas.ts | Zod schema, export type |

## CONVENTIONS
- **Workspace aliases ONLY**: No relative imports (enforced by `npm run lint:imports`)
- **Composition root**: main.ts instantiates adapters, no DI framework
- **Thin use cases**: Functions just call ports, no business logic
- **Single container**: API serves UI static files
- **Type safety**: Shared Zod schemas validate all requests

## ANTI-PATTERNS
- **Relative imports**: Forbidden. Use `@ses-admin/*` aliases
- **Direct AWS SDK calls**: Use port interfaces instead
- **UI page scrolling**: Layout has `overflow-hidden`, pages handle their own scrolling

## UNIQUE STYLES
- **Hybrid build**: Server (tsc + esbuild), UI (esbuild only), Shared (tsc only)
- **Node.js tests**: `node --test` with tsx (not jest/vitest)
- **SSE hot reload**: `/__reload` endpoint for instant UI updates
- **Port-first**: Domain defines interfaces, infrastructure implements

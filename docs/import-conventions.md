# IMPORT CONVENTIONS

## Rule
Relative import specifiers are disallowed in code files (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.mjs`, `*.cjs`).
Use workspace aliases instead.

## Allowed Aliases
- `@ses-admin/shared`
- `@ses-admin/server`
- `@ses-admin/ui`

Subpaths are allowed:

- `@ses-admin/ui/components/ui/button`
- `@ses-admin/server/application/send-email`
- `@ses-admin/shared/schemas`

## Examples

**Use:**
```ts
import { sendEmail } from '@ses-admin/server/application/send-email';
import { Button } from '@ses-admin/ui/components/ui/button';
import { SendEmailSchema } from '@ses-admin/shared';
```

**Do not use:**
```ts
import { sendEmail } from '../application/send-email';
import { Button } from '../../components/ui/button';
const x = require('./local-module');
```

## Enforcement
- Root script: `npm run lint:imports`
- CI gate: `Enforce alias-only imports` step in `/.github/workflows/ci.yml`

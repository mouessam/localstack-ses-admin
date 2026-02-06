# LocalStack SES Admin

[![Tests](https://github.com/mouessam/localstack-ses-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/mouessam/localstack-ses-admin/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen)](https://github.com/mouessam/localstack-ses-admin)
[![Docker Hub](https://img.shields.io/badge/docker-mouessam%2Flocalstack--ses--admin-blue)](https://hub.docker.com/r/mouessam/localstack-ses-admin)

Admin panel for LocalStack SES Community. Single container serving Fastify API + React SPA.

## FEATURES

- Verify/delete SES identities (email/domain)
- Send email via SES SendEmail
- Send raw MIME with attachments
- Inspect/delete messages via `/_aws/ses`
- Clean Architecture + ports/adapters
- Type-safe Zod contracts
- Dev hot reload (SSE)

## QUICKSTART (DOCKER)

```bash
docker build -t mouessam/localstack-ses-admin .
docker run -d --name localstack -p 4566:4566 -e SERVICES=ses localstack/localstack:latest
docker run -p 8080:8080 \
  -e LOCALSTACK_ENDPOINT=http://host.docker.internal:4566 \
  -e AWS_REGION=us-east-1 \
  mouessam/localstack-ses-admin
```

## QUICKSTART (COMPOSE)

```bash
docker compose up --build
```

Open `http://localhost:8080`.

## CONFIGURATION

| Variable                | Default                  | Description         |
|-------------------------|--------------------------|---------------------|
| `LOCALSTACK_ENDPOINT`   | `http://localstack:4566` | LocalStack endpoint |
| `AWS_REGION`            | `us-east-1`              | AWS region          |
| `AWS_ACCESS_KEY_ID`     | `test`                   | AWS access key      |
| `AWS_SECRET_ACCESS_KEY` | `test`                   | AWS secret key      |
| `PORT`                  | `8080`                   | Server port         |
| `UI_DIST_PATH`          | auto                     | UI static override  |

## API ENDPOINTS

- `GET /api/health`
- `GET /api/identities`
- `POST /api/identities`
- `DELETE /api/identities/:identity`
- `POST /api/send`
- `POST /api/send-raw`
- `GET /api/messages`
- `DELETE /api/messages`

## LOCAL DEVELOPMENT

```bash
npm install
npm run build
npm run dev
```

Open `http://localhost:8080`.

## CHECKS

```bash
npm run lint              # Lint all
npm run typecheck         # TypeScript check
npm run lint:imports      # Enforce workspace aliases
```

## TESTS

```bash
npm run test             # Node.js test runner + tsx
npm run test:coverage    # 80% target enforced in CI
```

## DOCUMENTATION

- `docs/architecture.md` - Clean Architecture layers, data flow
- `docs/build-system.md` - Hybrid build, workspace aliases, hot reload
- `docs/import-conventions.md` - Workspace alias enforcement

## DOCKER RELEASE (CI)

GitHub tags `v*` → multi-arch Docker Hub image.

Tags: `:vX.Y.Z`, `:X.Y.Z`, `:latest`

## LIMITATIONS (LOCALSTACK COMMUNITY)

- SES v1 only (no v2)
- No SMTP/inbound email

## LICENSE

MIT. See `LICENSE`.

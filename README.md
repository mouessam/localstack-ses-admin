# LocalStack SES Admin

[![Tests](https://github.com/mouessam/localstack-ses-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/mouessam/localstack-ses-admin/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen)](https://github.com/mouessam/localstack-ses-admin)
[![Docker Hub](https://img.shields.io/badge/docker-mouessam%2Flocalstack--ses--admin-blue)](https://hub.docker.com/r/mouessam/localstack-ses-admin)

A lightweight admin panel for LocalStack SES Community. It ships as a single container image that serves both the API and the React UI.

## Features
- Verify and delete SES identities
- Send email via SES SendEmail
- Send raw MIME emails with attachments
- Inspect and delete messages via `/_aws/ses`
- Clean Architecture with ports and adapters

## Architecture
This repo follows Clean Architecture with a single composition root. See `docs/architecture.md` for a diagram and details.

## Quickstart (Docker)
```bash
# Build the admin image
docker build -t mouessam/localstack-ses-admin .

# Run LocalStack SES
docker run -d --name localstack -p 4566:4566 -e SERVICES=ses localstack/localstack:latest

# Run the admin UI/API
docker run -p 8080:8080 \
  -e LOCALSTACK_ENDPOINT=http://host.docker.internal:4566 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  mouessam/localstack-ses-admin
```

## Quickstart (Compose)
```bash
docker compose up --build
```
Then open `http://localhost:8080`.

## Configuration
| Variable | Default | Description |
| --- | --- | --- |
| `LOCALSTACK_ENDPOINT` | `http://localstack:4566` | LocalStack edge endpoint |
| `AWS_REGION` | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | `test` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | `test` | AWS secret key |
| `PORT` | `8080` | Server port |
| `UI_DIST_PATH` | auto | Optional override for UI static assets |

## API Endpoints
- `GET /api/health`
- `GET /api/identities`
- `POST /api/identities`
- `DELETE /api/identities/:identity`
- `POST /api/send`
- `POST /api/send-raw`
- `GET /api/messages`
- `DELETE /api/messages`

## Local Development
```bash
npm install
npm run build
npm run dev
```
Open `http://localhost:8080`.

## Tests
```bash
npm run test
```

## Test Coverage
```bash
npm run test:coverage
```
Target: 80% line coverage (enforced in CI).

## Docker Release (CI)
On GitHub tags that match `v*` (e.g., `v1.2.3`), CI builds and publishes a multi-arch image to Docker Hub.

Images are pushed with these tags:
- `mouessam/localstack-ses-admin:vX.Y.Z`
- `mouessam/localstack-ses-admin:X.Y.Z`
- `mouessam/localstack-ses-admin:latest`

**Required secrets (GitHub Actions):**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` (use a Docker Hub access token with least privilege, not your password)

## Limitations (LocalStack Community)
- SES v1 only (SES v2 is not supported in Community)
- SMTP and inbound email are not supported in Community

## Contributing
See `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.

## License
MIT. See `LICENSE`.

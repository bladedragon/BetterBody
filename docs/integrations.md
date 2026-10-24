# Integrations

## Setup

Requires Node.js 22.12 or later. Copy `.env.example` to `.env` once, configure server-side credentials, and run `npm start`. Keep existing private configuration when upgrading.

The server defaults to `127.0.0.1:4173`, with live calls disabled. `GET /api/health` reports service health. `GET /api/status` reports configuration flags without returning secrets; it does not validate provider credentials.

See [Providers](providers.md) for protocol and credential settings.

## Photo analysis

`POST /api/analyze` accepts JSON:

```json
{"image":"data:image/jpeg;base64,...","consent":true}
```

The browser accepts camera captures or selected files up to 20 MB, decodes them, resizes to a maximum dimension of 1600 pixels, and re-encodes JPEG to remove source metadata. The server limits request bodies to approximately 8.5 MB.

Vision output contains food names, ingredient candidates, estimated weight ranges, and visible/inferred evidence. Nutrient values are resolved from USDA candidates or manual corrections, rather than model-provided nutrient fields. Inferred ingredients are excluded by default. Missing values remain unknown.

`GET /api/foods?q=...` performs food lookup. Candidate selection retains FDC identifiers and checks nutrient units before portion scaling.

Errors cover disabled/unconfigured services, missing consent, invalid images, non-food or uncertain input, credentials, rate limits, timeouts, and database failures. Database failures preserve identified ingredients with unknown nutrition.

Closing or cancelling analysis aborts browser waiting and propagates cancellation when the connection closes. Upstream work may already have incurred charges.

## Deployment and privacy

Images are processed in memory, without routine image logging or server-side image files. Provider retention policies apply after upload. Responses requests use `store=false`; this alone does not promise zero retention.

The server uses an asset allowlist, Host/Origin checks, a single-process limit of 30 analysis/lookup requests per hour, and at most two concurrent operations. There are no automatic paid retries. These controls target single-user deployment.

For non-loopback binding, set an HTTPS `APP_ORIGIN` and an `APP_PASSWORD` of at least 16 characters. Basic Auth uses username `shiheng`. Configure an HTTPS reverse proxy to forward the public host and terminate TLS. For Docker, set `HOST=0.0.0.0` as well. The Node server itself serves HTTP.

Do not use a shared instance as a substitute for tenant isolation. Meal and body-metric records remain in each browser and do not synchronize between devices. Offline caching includes static assets, not photos or API responses.

## Fixture testing

Run `npm run test:ui` and open `http://localhost:4180`. This isolated server does not read `.env` and replaces external requests with fixed responses. `tests/fixtures/upload.png` is a synthetic green image for upload-flow testing, not a recognition benchmark. Stop the server with Ctrl+C.

Before enabling live use, evaluate real food, non-food, and ambiguous images under varied lighting. Verify camera permissions, provider credentials, database matching, and network behavior on the actual deployment.

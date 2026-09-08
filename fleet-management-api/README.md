# Fleet Management API

Production-grade Node.js 24 service for EV Fleet and Charging Session Management.

## Stack
- **Runtime**: Node.js 24.3.0 (ESM)
- **Framework**: Express, Helmet, CORS
- **Validation**: Zod
- **Logging**: Pino (JSON structured logs)
- **Metrics**: Prometheus via `prom-client`
- **Rate Limiting**: `rate-limiter-flexible`
- **Testing**: `node:test`

## Features
- **Vehicles**: Create, list, retrieve, and update EV fleet assets.
- **Charging Sessions**: Start, stop, and list charging sessions.
- **Policy Operations**: Search policies and retrieve policy details.
- **Idempotency**: Support for `Idempotency-Key` on state-changing operations.
- **Concurrency**: ETag/If-Match for vehicle updates.
- **Validation**: Zod-backed request validation across the API.
- **Security**: API key authentication, Helmet, CORS, and rate limiting at the shared API boundary.
- **Observability**: `/healthz`, `/readyz`, and `/metrics`.
- **Traceability**: `X-Trace-Id` correlation across logs and responses.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Run in dev mode:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## API Documentation
The OpenAPI 3.1 spec is available in `openapi.yaml`.

All protected business endpoints are grouped under the versioned `/api/v1` API boundary:

- `/api/v1/vehicles`
- `/api/v1/sessions`
- `/api/v1/policies/search`
- `/api/v1/policies/details`

## Example Request (Create Vehicle)
```bash
curl -X POST http://localhost:8080/api/v1/vehicles \
  -H "x-api-key: secret-api-key" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1234567890ABCDEFG",
    "make": "Tesla",
    "model": "Model 3",
    "year": 2023
  }'
```

## Error Model
Uses RFC 9457 (Problem Details):
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/v1/vehicles",
  "traceId": "uuid",
  "errors": [{ "field": "body.vin", "message": "String must contain exactly 17 character(s)" }]
}
```

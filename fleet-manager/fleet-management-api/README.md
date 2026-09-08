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
- **API A (Vehicles)**: Create, List, and Update EV fleet assets.
- **API B (Sessions)**: Start and Stop charging sessions.
- **Idempotency**: Support for `Idempotency-Key` header.
- **Concurrency**: ETag/If-Match for vehicle updates.
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

### Example Request (Create Vehicle)
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

# Fleet Management

A consolidated fleet management platform with a Node.js API and a lightweight web UI.

## Repository layout

- `fleet-management-api/` — Express API covering vehicle management, charging sessions, and policy operations.
- `fleet-management-ui/` — browser-based frontend for the platform.

## API

```bash
cd fleet-management-api
npm install
npm start
```

The API exposes health monitoring plus the versioned fleet endpoints under `/api/v1`.

## UI

```bash
cd fleet-management-ui
npm install
npm start
```

The UI is served separately from the API and can be configured to target the appropriate API endpoint.

## Development

Node.js 24.x is the target runtime for the application. Review the API and UI package manifests for the current dependency set and use the supplied environment configuration for local development.

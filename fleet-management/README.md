# Fleet Management Platform

A highly responsive and modern monorepo built to manage vehicle fleets, process dynamic EV charging sessions, and seamlessly handle policy details. The system integrates an intuitive interactive frontend with a resilient Node.js backend API capable of gracefully falling back to mock data if live database connectivity is interrupted.

## Features

- **Vehicle Fleet Management**: Register new vehicles in the fleet and monitor their statuses in real-time.
- **Dynamic Charging Sessions**: Start and stop mock electric vehicle charging sessions on the fly.
- **Insurance Policy Search**: Look up active fleet policies and view complete deep details using fallback mock data integrations.
- **Resilient Backend architecture**: Automatically handles MySQL database disconnections at startup by gracefully shifting to in-memory mock datasets without service interruption natively within the API.

## Repository Structure

This project uses a monorepo structure containing two distinct modules managed from a central entry point:

- **/api**
  Provides the robust Express backend APIs that run the background processing, manage rate-limits, and query the dataset. Runs on **Port 8082** out of the box to avoid classic port conflicts.
- **/ui**
  A premium Vanilla JavaScript-driven single-page styling platform that serves the frontend interactions and layout design. Runs on **Port 3000**.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (Version 24.3.0 or higher is recommended)
- A MySQL instance (Optional: The application natively supports a fully featured *mock fallback mode* if database access fails)

### Quick Start

1. **Install Sub-module Dependencies (Optional but recommended)**
   Navigate into the underlying folders to install any underlying locked dependencies (the root folder utilizes concurrently but it's best to have everything initialized!).
   ```bash
   cd api && npm install
   cd ../ui && npm install
   cd ..
   ```

2. **Boot the Platform Concurrent Services**
   All commands are integrated right from the root directory. Spin up both the Express API Backend and the HTTP Serve Frontend natively using a single command:
   ```bash
   npm start
   ```

3. **Open the App**
   The application will become instantly available at: [http://localhost:3000](http://localhost:3000)

## API Endpoints 

Key endpoints available under the `http://localhost:8082/` service node include:

* `GET /healthz` - Health monitoring output.
* `GET /api/policies/search?status=active` - Searches for mock policies. 
* `GET /api/policies/details?policyNumber=...` - Retreives individual policy data attributes.
* `GET /api/v1/vehicles` - List the vehicle lineup.
* `POST /api/v1/vehicles` - Register a robust vehicle. 
* `POST /api/v1/sessions` - Trigger an EV charging session.

## Configuration
Backend environment configurations are stored internally inside `api/.env`. 
By default, the database attempts to attach itself using `DB_HOST=localhost`, `DB_PORT=3306`, and `DB_USER=root`. 
If you lack a MySQL configuration running immediately, the system will log a bootup warning and effortlessly transition into Mock Data Storage mode!

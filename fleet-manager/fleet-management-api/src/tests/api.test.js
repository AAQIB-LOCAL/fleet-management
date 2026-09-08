import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'http';
import app from '../app.js';
import { config } from '../core/config.js';

// Helper to make requests to the app
const makeRequest = (options, body) => {
  return new Promise((resolve, reject) => {
    const req = request.request({
      ...options,
      host: 'localhost',
      port: 8080,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

describe('Fleet Management API Tests', () => {
  let server;
  let vehicleId;
  let sessionId;
  const apiKey = config.apiKey;

  before(async () => {
    return new Promise((resolve) => {
      server = app.listen(8080, () => {
        resolve();
      });
    });
  });

  after(() => {
    if (server) {
      server.close();
    }
  });

  test('GET /healthz should return 200', async () => {
    const res = await makeRequest({ method: 'GET', path: '/healthz' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
  });

  describe('API A: Vehicles', () => {
    test('POST /api/v1/vehicles should create a vehicle', async () => {
      const uniqueSuffix = Date.now().toString().slice(-10);
      const vehicleData = {
        vin: 'TESTVIN' + uniqueSuffix, // 7 + 10 = 17 characters
        make: 'Tesla',
        model: 'Model S',
        year: 2024
      };

      const res = await makeRequest({
        method: 'POST',
        path: '/api/v1/vehicles',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'Idempotency-Key': 'v-key-' + Date.now()
        }
      }, vehicleData);

      assert.strictEqual(res.status, 201, `Failed to create vehicle: ${JSON.stringify(res.body)}`);
      assert.ok(res.body.id);
      vehicleId = res.body.id;
    });

    test('GET /api/v1/vehicles should list vehicles', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/v1/vehicles',
        headers: { 'x-api-key': apiKey }
      });

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.items));
    });
  });

  describe('API B: Sessions', () => {
    test('POST /api/v1/sessions should start a session', async () => {
      assert.ok(vehicleId, 'vehicleId should be set from previous test');
      const sessionData = {
        vehicleId: vehicleId,
        stationId: 'ST-001',
        maxKwh: 60
      };

      const res = await makeRequest({
        method: 'POST',
        path: '/api/v1/sessions',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'Idempotency-Key': 's-key-' + Date.now()
        }
      }, sessionData);

      assert.strictEqual(res.status, 201, `Failed to start session: ${JSON.stringify(res.body)}`);
      assert.ok(res.body.id);
      sessionId = res.body.id;
    });

    test('POST /api/v1/sessions/:id/stop should stop a session', async () => {
      assert.ok(sessionId, 'sessionId should be set from previous test');
      const res = await makeRequest({
        method: 'POST',
        path: `/api/v1/sessions/${sessionId}/stop`,
        headers: {
          'x-api-key': apiKey,
          'Idempotency-Key': 'st-key-' + Date.now()
        }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'completed');
    });
  });

  test('Security: should fail without API key', async () => {
    const res = await makeRequest({
      method: 'GET',
      path: '/api/v1/vehicles'
    });
    assert.strictEqual(res.status, 401);
  });
});


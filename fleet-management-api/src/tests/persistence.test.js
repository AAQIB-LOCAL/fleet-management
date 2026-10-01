import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { memoryStore } from '../repository/memoryStore.js';
import { persistence } from '../core/persistence.js';

describe('Persistence boundary', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  test('declares the current persistence mode explicitly', () => {
    assert.deepStrictEqual(persistence, {
      provider: 'memory',
      mode: 'mock',
      status: 'READY'
    });
  });

  test('persists and retrieves vehicles through the repository boundary', async () => {
    const vehicle = { id: 'vehicle-1', vin: 'VIN1234567890123', status: 'active' };
    const saved = await memoryStore.saveVehicle(vehicle);
    const retrieved = await memoryStore.getVehicle(vehicle.id);

    assert.strictEqual(saved.id, vehicle.id);
    assert.strictEqual(retrieved.vin, vehicle.vin);
    assert.ok(retrieved.updatedAt);
  });

  test('stores idempotency records through the repository boundary', async () => {
    await memoryStore.saveIdempotencyRecord('key-1', { status: 201, body: { id: '1' } });
    const record = await memoryStore.getIdempotencyRecord('key-1');

    assert.deepStrictEqual(record.body, { id: '1' });
    assert.ok(record.expiresAt);
  });
});

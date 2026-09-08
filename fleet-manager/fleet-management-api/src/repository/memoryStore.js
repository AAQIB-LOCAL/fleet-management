import crypto from 'node:crypto';

export class MemoryStore {
  constructor() {
    this.vehicles = new Map();
    this.sessions = new Map();
    this.idempotencyKeys = new Map();
  }

  // Vehicles
  async saveVehicle(vehicle) {
    this.vehicles.set(vehicle.id, { ...vehicle, updatedAt: new Date().toISOString() });
    return this.vehicles.get(vehicle.id);
  }

  async getVehicle(id) {
    return this.vehicles.get(id);
  }

  async listVehicles() {
    return Array.from(this.vehicles.values());
  }

  async findVehicleByVin(vin) {
    return Array.from(this.vehicles.values()).find(v => v.vin === vin);
  }

  // Sessions
  async saveSession(session) {
    this.sessions.set(session.id, { ...session, updatedAt: new Date().toISOString() });
    return this.sessions.get(session.id);
  }

  async getSession(id) {
    return this.sessions.get(id);
  }

  async listSessions() {
    return Array.from(this.sessions.values());
  }

  async findActiveSessionByVehicle(vehicleId) {
    return Array.from(this.sessions.values()).find(s => s.vehicleId === vehicleId && s.status === 'active');
  }

  // Idempotency
  async getIdempotencyRecord(key) {
    const record = this.idempotencyKeys.get(key);
    if (record && new Date(record.expiresAt) < new Date()) {
      this.idempotencyKeys.delete(key);
      return null;
    }
    return record;
  }

  async saveIdempotencyRecord(key, data) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    this.idempotencyKeys.set(key, { ...data, expiresAt: expiresAt.toISOString() });
  }
}

export const memoryStore = new MemoryStore();

import { memoryStore } from '../repository/memoryStore.js';
import crypto from 'node:crypto';

export class SessionService {
  async startSession(data) {
    const vehicle = await memoryStore.getVehicle(data.vehicleId);
    if (!vehicle) {
      throw { status: 404, message: 'Vehicle not found' };
    }

    if (vehicle.status !== 'active') {
      throw { status: 400, message: 'Vehicle must be active to start a session' };
    }

    const activeSession = await memoryStore.findActiveSessionByVehicle(data.vehicleId);
    if (activeSession) {
      throw { status: 409, message: 'Vehicle already has an active charging session' };
    }

    const session = {
      id: crypto.randomUUID(),
      ...data,
      status: 'active',
      startedAt: new Date().toISOString(),
      consumedKwh: 0,
    };

    return await memoryStore.saveSession(session);
  }

  async stopSession(id) {
    const session = await memoryStore.getSession(id);
    if (!session) {
      throw { status: 404, message: 'Session not found' };
    }

    if (session.status !== 'active') {
      throw { status: 400, message: 'Session is already stopped' };
    }

    const updated = {
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString(),
      // Mocking some consumption
      consumedKwh: Math.min(session.maxKwh, Math.random() * session.maxKwh)
    };

    return await memoryStore.saveSession(updated);
  }

  async listSessions(query) {
    let sessions = await memoryStore.listSessions();

    if (query.vehicleId) {
      sessions = sessions.filter(s => s.vehicleId === query.vehicleId);
    }
    if (query.status) {
      sessions = sessions.filter(s => s.status === query.status);
    }

    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;

    return {
      items: sessions.slice(start, end),
      total: sessions.length,
      page: query.page,
      pageSize: query.pageSize
    };
  }
}

export const sessionService = new SessionService();

import { memoryStore } from '../repository/memoryStore.js';
import crypto from 'node:crypto';

export class VehicleService {
  async createVehicle(data) {
    const existing = await memoryStore.findVehicleByVin(data.vin);
    if (existing) {
      throw { status: 409, message: `Vehicle with VIN ${data.vin} already exists` };
    }

    const vehicle = {
      id: crypto.randomUUID(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return await memoryStore.saveVehicle(vehicle);
  }

  async getVehicle(id) {
    const vehicle = await memoryStore.getVehicle(id);
    if (!vehicle) {
      throw { status: 404, message: 'Vehicle not found' };
    }
    return vehicle;
  }

  async listVehicles(query) {
    let vehicles = await memoryStore.listVehicles();
    
    if (query.make) {
      vehicles = vehicles.filter(v => v.make.toLowerCase() === query.make.toLowerCase());
    }
    if (query.status) {
      vehicles = vehicles.filter(v => v.status === query.status);
    }

    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    
    return {
      items: vehicles.slice(start, end),
      total: vehicles.length,
      page: query.page,
      pageSize: query.pageSize
    };
  }

  async updateVehicle(id, data, ifMatch) {
    const vehicle = await memoryStore.getVehicle(id);
    if (!vehicle) {
      throw { status: 404, message: 'Vehicle not found' };
    }

    // Concurrency check via ETag (using updatedAt as simple version)
    if (ifMatch && vehicle.updatedAt !== ifMatch) {
      throw { status: 412, message: 'Precondition Failed: Resource has been modified' };
    }

    const updated = {
      ...vehicle,
      ...data,
    };

    return await memoryStore.saveVehicle(updated);
  }
}

export const vehicleService = new VehicleService();

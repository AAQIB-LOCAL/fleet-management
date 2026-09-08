import { Router } from 'express';
import { vehicleService } from '../services/apiAService.js';
import { vehicleSchemas } from '../schemas/apiA.js';
import { validate } from '../middleware/validate.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = Router();

router.post('/', 
  idempotencyMiddleware,
  validate(vehicleSchemas.create),
  async (req, res, next) => {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  validate(vehicleSchemas.list),
  async (req, res, next) => {
    try {
      const result = await vehicleService.listVehicles(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  validate(vehicleSchemas.get),
  async (req, res, next) => {
    try {
      const vehicle = await vehicleService.getVehicle(req.params.id);
      res.setHeader('ETag', vehicle.updatedAt || vehicle.createdAt);
      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  idempotencyMiddleware,
  validate(vehicleSchemas.update),
  async (req, res, next) => {
    try {
      const ifMatch = req.header('If-Match');
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, ifMatch);
      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  }
);

export const vehicleRouter = router;

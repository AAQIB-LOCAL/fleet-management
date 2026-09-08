import { Router } from 'express';
import { sessionService } from '../services/apiBService.js';
import { sessionSchemas } from '../schemas/apiB.js';
import { validate } from '../middleware/validate.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = Router();

router.post('/', 
  idempotencyMiddleware,
  validate(sessionSchemas.create),
  async (req, res, next) => {
    try {
      const session = await sessionService.startSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/stop',
  idempotencyMiddleware,
  validate(sessionSchemas.stop),
  async (req, res, next) => {
    try {
      const session = await sessionService.stopSession(req.params.id);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  validate(sessionSchemas.list),
  async (req, res, next) => {
    try {
      const result = await sessionService.listSessions(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export const sessionRouter = router;

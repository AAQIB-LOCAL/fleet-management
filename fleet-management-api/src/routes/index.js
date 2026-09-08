import { Router } from 'express';
import { vehicleRouter } from './apiA.js';
import { sessionRouter } from './apiB.js';
import { policyRouter } from './policyRoutes.js';

const router = Router();

router.use('/vehicles', vehicleRouter);
router.use('/sessions', sessionRouter);
router.use('/policies', policyRouter);

export const apiRouter = router;

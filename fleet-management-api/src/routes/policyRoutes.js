import { Router } from 'express';
import { policyController } from '../controllers/policyController.js';
import { policyValidators } from '../validators/policyValidator.js';

const router = Router();

router.get('/search', policyValidators.validateSearch, policyController.searchPolicies);
router.get('/details', policyValidators.validateDetails, policyController.getPolicyDetails);

export const policyRouter = router;

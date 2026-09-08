import { policyService } from '../services/policyService.js';

export const policyController = {
  searchPolicies: async (req, res, next) => {
    try {
      const data = await policyService.searchPolicies(req.query);

      return res.status(200).json(data.Policies);
    } catch (error) {
      next(error);
    }
  },

  getPolicyDetails: async (req, res, next) => {
    try {
      const { policyNumber } = req.query;
      const data = await policyService.getPolicyDetails(policyNumber);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POLICY_NOT_FOUND',
            message: 'No policy found for the provided policy number.'
          }
        });
      }

      return res.status(200).json(data.Policies);
    } catch (error) {
      next(error);
    }
  }
};

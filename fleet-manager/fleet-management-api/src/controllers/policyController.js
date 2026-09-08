import { policyService } from '../services/policyService.js';

export const policyController = {
  searchPolicies: async (req, res, next) => {
    try {
      const { page, pageSize, ...filters } = req.query;
      
      const data = await policyService.searchPolicies(filters, { page, pageSize });
      
      return res.status(200).json({
        success: true,
        data: {
          total: data.total,
          page,
          pageSize,
          results: data.results
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getPolicyDetails: async (req, res, next) => {
    try {
      const { policyId } = req.params;
      const policy = await policyService.getPolicyDetails(policyId);
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: {
            code: "POLICY_NOT_FOUND",
            message: "No policy found with the provided ID."
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error) {
      next(error);
    }
  }
};

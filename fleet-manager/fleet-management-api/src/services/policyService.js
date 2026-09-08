import pool from '../core/db.js';

export const policyService = {
  searchPolicies: async (filters, pagination) => {
    let query = 'SELECT policy_id as policyId, policy_number as policyNumber, policy_holder_name as policyHolderName, product_type as productType, status, start_date as startDate, end_date as endDate, premium FROM policies WHERE 1=1';
    const params = [];

    if (filters.policyNumber) {
      query += ' AND policy_number = ?';
      params.push(filters.policyNumber);
    }
    if (filters.policyHolderName) {
      query += ' AND policy_holder_name LIKE ?';
      params.push(`%${filters.policyHolderName}%`);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.productType) {
      query += ' AND product_type = ?';
      params.push(filters.productType);
    }
    if (filters.startDateFrom) {
      query += ' AND start_date >= ?';
      params.push(filters.startDateFrom);
    }
    if (filters.startDateTo) {
      query += ' AND start_date <= ?';
      params.push(filters.startDateTo);
    }

    const countQuery = query.replace('SELECT policy_id as policyId, policy_number as policyNumber, policy_holder_name as policyHolderName, product_type as productType, status, start_date as startDate, end_date as endDate, premium', 'SELECT COUNT(*) as total');
    
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(pagination.pageSize, (pagination.page - 1) * pagination.pageSize);

    const [rows] = await pool.query(query, params);
    return {
      total,
      results: rows
    };
  },

  getPolicyDetails: async (policyId) => {
    const query = `
      SELECT 
        p.policy_id as policyId, p.policy_number as policyNumber, p.status, p.product_type as productType,
        p.policy_holder_name as policyHolderName, p.start_date as startDate, p.end_date as endDate,
        p.premium, p.sum_assured as sumAssured, p.created_at as createdAt, p.updated_at as updatedAt,
        n.name as nomineeName, n.relationship as nomineeRelationship, n.share_percentage as nomineeShare,
        r.rider_name as riderName
      FROM policies p
      LEFT JOIN nominees n ON p.policy_id = n.policy_id
      LEFT JOIN riders r ON p.policy_id = r.policy_id
      WHERE p.policy_id = ?
    `;
    const [rows] = await pool.query(query, [policyId]);

    if (rows.length === 0) {
      return null;
    }

    const policy = {
      policyId: rows[0].policyId,
      policyNumber: rows[0].policyNumber,
      status: rows[0].status,
      productType: rows[0].productType,
      policyHolderName: rows[0].policyHolderName,
      startDate: rows[0].startDate,
      endDate: rows[0].endDate,
      premium: rows[0].premium,
      sumAssured: rows[0].sumAssured,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
      nominees: [],
      riders: []
    };

    const nomineeSet = new Set();
    const riderSet = new Set();

    for (const row of rows) {
      if (row.nomineeName && !nomineeSet.has(row.nomineeName)) {
        nomineeSet.add(row.nomineeName);
        policy.nominees.push({
          name: row.nomineeName,
          relationship: row.nomineeRelationship,
          sharePercentage: row.nomineeShare
        });
      }
      
      if (row.riderName && !riderSet.has(row.riderName)) {
        riderSet.add(row.riderName);
        policy.riders.push(row.riderName);
      }
    }

    return policy;
  }
};

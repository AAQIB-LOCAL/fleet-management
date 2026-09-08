import pool from '../core/db.js';

function maskSsn(ssn) {
  if (!ssn) return ssn;
  const str = String(ssn);
  if (str.length === 9) {
    return '***-**-' + str.slice(-4);
  }
  return str;
}

function formatYYYYMMDD(val) {
  if (!val) return null;
  if (typeof val === 'string') return val.split('T')[0];
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val);
}

export const policyService = {
  searchPolicies: async (filters) => {
    // In a real application, we would build a SQL query and let the DB handle filtering.
    // However, since we are using a mock DB that returns all records, 
    // we implement the filtering logic here in the service layer.
    
    let [rows] = await pool.query('SELECT * FROM policies', []);

    // Apply filtering logic
    if (filters.policyNumber) {
      const pn = filters.policyNumber.toLowerCase();
      rows = rows.filter(row => row.policy_number.toLowerCase().includes(pn));
    }

    if (filters.system) {
      rows = rows.filter(row => row.system === filters.system);
    }

    if (filters.owner) {
      const owner = filters.owner.toLowerCase();
      rows = rows.filter(row => row.insured_name.toLowerCase().includes(owner));
    }

    if (filters.dob) {
      rows = rows.filter(row => row.dob === filters.dob);
    }

    if (filters.ssn) {
      rows = rows.filter(row => row.ssn === filters.ssn);
    }

    if (filters.status) {
      rows = rows.filter(row => row.status === filters.status);
    }

    if (filters.product) {
      const product = filters.product.toLowerCase();
      rows = rows.filter(row => row.product_name.toLowerCase().includes(product));
    }

    if (filters.agentCode) {
      rows = rows.filter(row => row.agent_code === filters.agentCode);
    }

    if (filters.minPremium !== undefined) {
      rows = rows.filter(row => Number(row.premium_amount) >= filters.minPremium);
    }

    if (filters.maxPremium !== undefined) {
      rows = rows.filter(row => Number(row.premium_amount) <= filters.maxPremium);
    }

    if (filters.startDate) {
      rows = rows.filter(row => row.issue_date >= filters.startDate);
    }

    if (filters.endDate) {
      rows = rows.filter(row => row.issue_date <= filters.endDate);
    }

    // Map to PascalCase response structure
    const Policies = rows.map(row => ({
      PolicyNumber:  row.policy_number   || null,
      InsuredName:   row.insured_name    || null,
      ProductName:   row.product_name    || null,
      AgentCode:     row.agent_code      || null,
      EndDate:       row.end_date        || null,
      PremiumAmount: row.premium_amount  !== undefined ? Number(row.premium_amount) : null
    }));

    return { Policies };
  },

  getPolicyDetails: async (policyNumber) => {
    const query = `
      SELECT 
        p.policy_number,
        o.name AS owner_name,
        i.name AS insurer_name,
        p.face_amount,
        p.insuring_agent,
        p.status AS policy_status,
        p.type_of_coverage,
        pr.name AS product_name,
        p.premium_amount,
        p.premium_due_amount,
        p.issue_date,
        p.issue_age,
        b.name AS primary_beneficiary
      FROM policies p
      LEFT JOIN owners o ON p.owner_id = o.id
      LEFT JOIN insurers i ON p.insurer_id = i.id
      LEFT JOIN products pr ON p.product_id = pr.id
      LEFT JOIN beneficiaries b ON b.policy_id = p.id AND b.is_primary = true
      WHERE p.policy_number LIKE ?
    `;

    const [rows] = await pool.query(query, [policyNumber]);

    if (rows.length === 0) {
      return null;
    }

    // Map all matching rows into camelCase detail objects and return as a plain list
    const Policies = rows.map(row => ({
      policyNumber:       row.policy_number    || null,
      ownerName:          row.owner_name       || null,
      insurerName:        row.insurer_name     || null,
      faceAmount:         row.face_amount      !== undefined ? Number(row.face_amount)      : null,
      insuringAgent:      row.insuring_agent   || null,
      policyStatus:       row.policy_status    || null,
      typeOfCoverage:     row.type_of_coverage  || null,
      productName:        row.product_name     || null,
      primaryBeneficiary: row.primary_beneficiary || null,
      premiumAmount:      row.premium_amount   !== undefined ? Number(row.premium_amount)   : null,
      premiumDueAmount:   row.premium_due_amount !== undefined ? Number(row.premium_due_amount) : null,
      issueDate:          formatYYYYMMDD(row.issue_date),
      issueAge:           row.issue_age        !== undefined ? parseInt(row.issue_age, 10)  : null
    }));

    return { Policies };
  }
};

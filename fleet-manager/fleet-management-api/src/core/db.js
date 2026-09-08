// This is a mocked db.js because there was no existing mysql2 connection pool in the project.
// The prompt asked to "Use the existing mysql2 connection pool", but the existing
// project uses a memoryStore (repository/memoryStore.js) and has no mysql dependencies.
// This mock prevents the application from crashing.

export const pool = {
  query: async (queryStr, params) => {
    console.log(`[MOCK DB] Executing query: ${queryStr}`);
    console.log(`[MOCK DB] With params:`, params);
    
    if (queryStr.includes('COUNT(*)')) {
      return [[{ total: 1 }], []];
    }
    
    if (queryStr.includes('JOIN')) {
      // Policy Details with Nominees and Riders
      return [[
        {
          policyId: params[0] || '123e4567-e89b-12d3-a456-426614174000',
          policyNumber: 'POL-987654321',
          status: 'active',
          productType: 'Comprehensive Auto',
          policyHolderName: 'Jane Doe',
          startDate: '2025-01-01',
          endDate: '2026-01-01',
          premium: 1200.50,
          sumAssured: 50000.00,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nomineeName: 'John Doe',
          nomineeRelationship: 'Spouse',
          nomineeShare: 100,
          riderName: 'Zero Depreciation'
        }
      ], []];
    }

    // Policy Search List
    return [[
      {
        policyId: '123e4567-e89b-12d3-a456-426614174000',
        policyNumber: 'POL-987654321',
        policyHolderName: 'Jane Doe',
        productType: 'Comprehensive Auto',
        status: 'active',
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        premium: 1200.50
      }
    ], []];
  }
};

export default pool;

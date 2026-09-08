export const healthHandler = (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
};

export const readinessHandler = (req, res) => {
  // Add checks for database, etc. here
  res.status(200).json({ status: 'READY', timestamp: new Date().toISOString() });
};

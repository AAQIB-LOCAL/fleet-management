export const notFoundHandler = (req, res) => {
  res.status(404).json({
    title: 'Not Found',
    status: 404,
    detail: `Route ${req.method} ${req.originalUrl} not found`,
    instance: req.originalUrl,
    traceId: req.traceId,
  });
};

export const sendProblem = (res, req, status, title, detail, extensions = {}) => {
  return res.status(status).json({
    type: 'about:blank',
    title,
    status,
    detail,
    instance: req.originalUrl,
    traceId: req.traceId,
    ...extensions,
  });
};

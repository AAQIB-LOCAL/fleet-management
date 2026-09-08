export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req properties with parsed/validated data (handles coercion and defaults)
    req.body = result.body;
    req.query = result.query;
    req.params = result.params;
    
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'Validation failed',
        instance: req.originalUrl,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        traceId: req.traceId,
      });
    }
    next(error);
  }
};

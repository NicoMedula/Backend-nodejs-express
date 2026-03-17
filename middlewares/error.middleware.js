const errorMiddleware = (err, _req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      success: false,
      error: `Duplicate value for: ${field}`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found',
    });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorMiddleware;

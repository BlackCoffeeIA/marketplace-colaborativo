export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Datos no válidos' });
  }
  if (err.code === 11000 || err.name === 'VersionError') {
    return res.status(409).json({ message: 'Conflicto de datos' });
  }
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Solicitud demasiado grande' });
  console.error('API error:', err.name || 'Error');
  return res.status(500).json({ message: 'Error interno del servidor' });
}

export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

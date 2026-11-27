import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './errorMiddleware.js';

export const protect = asyncHandler(async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('authorization') || '');
  if (!match) return res.status(401).json({ message: 'Autenticación requerida' });
  let decoded;
  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ message: 'Token no válido' });
  }
  if (!decoded || typeof decoded.id !== 'string' || !/^[a-f0-9]{24}$/i.test(decoded.id)) {
    return res.status(401).json({ message: 'Token no válido' });
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(401).json({ message: 'Usuario no autorizado' });
  req.user = user;
  next();
});

export function requireSelf(req, res, next) {
  if (String(req.user._id) !== req.params.id.toLowerCase()) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
}

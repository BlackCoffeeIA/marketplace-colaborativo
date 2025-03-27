import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Verificar si el header tiene el token y si comienza con "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener el usuario del token y agregarlo al objeto req
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Error al verificar el token:', error);
      res.status(401).json({ message: 'No autorizado, token no válido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no se proporcionó un token' });
  }
};

export { protect };

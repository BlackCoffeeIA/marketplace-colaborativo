import express from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100,
    standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use(compression());
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
  app.use(errorHandler);
  return app;
}

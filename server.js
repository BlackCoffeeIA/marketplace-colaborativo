import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Middlewares globales
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de solicitudes por IP
  message: 'Demasiadas solicitudes desde esta IP, inténtelo de nuevo más tarde',
});
app.use(limiter); // Aplica el límite de solicitudes

app.use(compression()); // Habilita compresión

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

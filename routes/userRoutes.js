import express from 'express';
import { registerUser, authUser, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, requireSelf } from '../middleware/authMiddleware.js';
import { validate, validateId, registerSchema, loginSchema, userUpdateSchema } from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
router.post('/register', authLimit, validate(registerSchema), registerUser);
router.post('/login', authLimit, validate(loginSchema), authUser);
router.get('/', protect, (req, res) => res.status(403).json({ message: 'Listado de usuarios no disponible' }));
router.get('/:id', protect, validateId, requireSelf, getUserById);
router.put('/:id', protect, validateId, requireSelf, validate(userUpdateSchema), updateUser);
router.delete('/:id', protect, validateId, requireSelf, deleteUser);
export default router;

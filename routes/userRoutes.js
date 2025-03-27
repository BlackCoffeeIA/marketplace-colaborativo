import express from 'express';
import { 
  registerUser, 
  authUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para autenticar al usuario (iniciar sesión)
router.post('/login', authUser);

// Ruta para obtener todos los usuarios
router.get('/', getAllUsers);

// Ruta para obtener un usuario por ID
router.get('/:id', getUserById);

// Ruta para actualizar un usuario por ID
router.put('/:id', updateUser);

// Ruta para eliminar un usuario por ID
router.delete('/:id', deleteUser);

export default router;

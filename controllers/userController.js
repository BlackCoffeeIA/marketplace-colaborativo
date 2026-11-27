import User from '../models/User.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const token = id => jwt.sign({ id: String(id) }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
const profile = u => ({ _id: u.id, name: u.name, email: u.email, role: u.role });
const missing = res => res.status(404).json({ message: 'Usuario no encontrado' });

export const registerUser = asyncHandler(async (req, res) => {
  if (await User.exists({ email: req.body.email })) return res.status(409).json({ message: 'El usuario ya existe' });
  const user = await User.create(req.body);
  res.status(201).json({ ...profile(user), token: token(user.id) });
});

export const authUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ message: 'Credenciales no válidas' });
  }
  res.json({ ...profile(user), token: token(user.id) });
});

export const getUserById = asyncHandler(async (req, res) => {
  res.json(profile(req.user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true, runValidators: true });
  if (!user) return missing(res);
  res.json(profile(user));
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (await Product.exists({ user: req.user._id })) return res.status(409).json({ message: 'Elimine sus productos antes de eliminar la cuenta' });
  const user = await User.findByIdAndDelete(req.user._id);
  if (!user) return missing(res);
  res.json({ message: 'Usuario eliminado' });
});

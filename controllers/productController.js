import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const missing = res => res.status(404).json({ message: 'Producto no encontrado' });
const denied = res => res.status(403).json({ message: 'Acceso denegado' });
const owner = (product, user) => String(product.user) === String(user._id);

export const getAllProducts = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const [products, total] = await Promise.all([
    Product.find({}).sort({ _id: 1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments({})
  ]);
  res.json({ success: true, data: products, message: 'Productos obtenidos correctamente', pagination: { page, limit, total } });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return missing(res);
  res.json({ success: true, data: product, message: 'Producto obtenido correctamente' });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: product, message: 'Producto creado correctamente' });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return missing(res);
  if (!owner(product, req.user)) return denied(res);
  Object.assign(product, req.body);
  res.json(await product.save());
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return missing(res);
  if (!owner(product, req.user)) return denied(res);
  const result = await Product.deleteOne({ _id: product._id, user: req.user._id });
  if (!result.deletedCount) return missing(res);
  res.json({ success: true, message: 'Producto eliminado correctamente' });
});

export const createProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return missing(res);
  if (product.reviews.some(r => String(r.user) === String(req.user._id))) {
    return res.status(409).json({ message: 'El producto ya ha sido reseñado por este usuario' });
  }
  product.reviews.push({ ...req.body, name: req.user.name, user: req.user._id });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.numReviews;
  await product.save();
  res.status(201).json({ message: 'Reseña añadida' });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return missing(res);
  res.json(product.reviews);
});

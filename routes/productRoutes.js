import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, getProductReviews } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateId, productCreateSchema, productUpdateSchema, reviewSchema, paginationSchema } from '../middleware/validation.js';

const router = express.Router();
router.get('/', validate(paginationSchema, 'query'), getAllProducts);
router.get('/:id', validateId, getProductById);
router.get('/:id/reviews', validateId, getProductReviews);
router.post('/', protect, validate(productCreateSchema), createProduct);
router.put('/:id', protect, validateId, validate(productUpdateSchema), updateProduct);
router.delete('/:id', protect, validateId, deleteProduct);
router.post('/:id/reviews', protect, validateId, validate(reviewSchema), createProductReview);
export default router;

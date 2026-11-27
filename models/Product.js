import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  countInStock: { type: Number, required: true, min: 0, validate: Number.isInteger },
  category: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true, optimisticConcurrency: true });
export default mongoose.model('Product', productSchema);

import Product from '../models/Product.js';
import Joi from 'joi';

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      success: true,
      data: products,
      message: 'Productos obtenidos correctamente',
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
    });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        res.status(200).json({
          success: true,
          data: product,
          message: 'Producto obtenido correctamente',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
      }
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el producto',
      });
    }
  };

// Esquema de validación para los productos
const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().required(),
    countInStock: Joi.number().integer().min(0).required(),
    category: Joi.string().required(),
    image: Joi.string().uri().required(),
  });

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  const { name, description, price, countInStock, category, image } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      countInStock,
      category,
      image,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      data: createdProduct,
      message: 'Producto creado correctamente',
    });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
    });
  }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
    const { name, description, price, countInStock, category, image } = req.body;
  
    try {
      const product = await Product.findById(req.params.id);
  
      if (product) {
        // Verificar si el usuario autenticado es el creador del producto
        if (product.user.toString() !== req.user._id.toString()) {
          return res.status(401).json({ message: 'No autorizado para modificar este producto' });
        }
  
        // Actualizar los campos del producto
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.countInStock = countInStock || product.countInStock;
        product.category = category || product.category;
        product.image = image || product.image;
  
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  };

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.status(200).json({
        success: true,
        message: 'Producto eliminado correctamente',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
    });
  }
};

// Crear una nueva reseña para un producto
export const createProductReview = async (req, res) => {
  // Validar la entrada usando Joi
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: `Error de validación: ${error.details[0].message}` });
  }

  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Verificar si el usuario ya dejó una reseña
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'El producto ya ha sido reseñado por este usuario' });
      }

      // Crear la nueva reseña
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      // Añadir la reseña al producto
      product.reviews.push(review);

      // Actualizar el rating promedio del producto
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Reseña añadida' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al crear la reseña:', error);
    res.status(500).json({ message: 'Error al crear la reseña' });
  }
};

// Obtener todas las reseñas de un producto
export const getProductReviews = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
  
      if (product) {
        res.json(product.reviews);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener las reseñas del producto:', error);
      res.status(500).json({ message: 'Error al obtener las reseñas del producto' });
    }
  };

// Esquema de validación para las reseñas
const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(3).max(500).required(),
});


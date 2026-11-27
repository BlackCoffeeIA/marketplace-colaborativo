import Joi from 'joi';

const name = Joi.string().trim().min(2).max(100);
const email = Joi.string().trim().lowercase().email().max(254);
const password = Joi.string().min(8).max(72).custom((value, helpers) =>
  Buffer.byteLength(value, 'utf8') <= 72 ? value : helpers.error('any.invalid'));
export const registerSchema = Joi.object({ name: name.required(), email: email.required(), password: password.required() }).required();
export const loginSchema = Joi.object({ email: email.required(), password: Joi.string().max(72).required() }).required();
export const userUpdateSchema = Joi.object({ name, email }).min(1).required();
const fields = {
  name: Joi.string().trim().min(3).max(100),
  description: Joi.string().trim().min(10).max(1000),
  price: Joi.number().positive(),
  countInStock: Joi.number().integer().min(0),
  category: Joi.string().trim().min(1).max(100),
  image: Joi.string().uri({ scheme: ['http', 'https'] }).max(2048)
};
export const productCreateSchema = Joi.object(Object.fromEntries(Object.entries(fields).map(([k,v]) => [k,v.required()]))).required();
export const productUpdateSchema = Joi.object(fields).min(1).required();
export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().min(3).max(500).required()
}).required();
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).max(10000).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, allowUnknown: false });
    if (error) return res.status(400).json({ message: 'Datos no válidos', details: error.details.map(x => x.path.join('.')) });
    if (source === 'query') req.validatedQuery = value;
    else req.body = value;
    next();
  };
}

export function validateId(req, res, next) {
  if (!/^[a-f0-9]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'ID no válido' });
  next();
}

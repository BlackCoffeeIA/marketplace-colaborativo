import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const own = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const other = 'bbbbbbbbbbbbbbbbbbbbbbbb';
let server, base, token;
const originals = { findUser: User.findById, findProduct: Product.findById, deleteProduct: Product.deleteOne };
before(async () => {
  process.env.JWT_SECRET = 'test-only-secret-not-for-real-use-123456';
  token = jwt.sign({ id: own }, process.env.JWT_SECRET, { algorithm: 'HS256' });
  User.findById = () => ({ select: async () => ({ _id: own, id: own, name: 'Test', email: 'test@example.com' }) });
  Product.findById = async () => ({ _id: other, user: other });
  Product.deleteOne = async () => { throw new Error('Unauthorized deletion must never be attempted'); };
  server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});
after(async () => {
  User.findById = originals.findUser;
  Product.findById = originals.findProduct;
  Product.deleteOne = originals.deleteProduct;
  if (server) await new Promise(resolve => server.close(resolve));
});
function request(path, method = 'GET', body, authenticated = false) {
  return fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: 'Bearer ' + token } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
test('user data requires authentication', async () => assert.equal((await request('/users')).status, 401));
test('authenticated users cannot list other accounts', async () => assert.equal((await request('/users', 'GET', undefined, true)).status, 403));
test('cannot read another account', async () => assert.equal((await request('/users/' + other, 'GET', undefined, true)).status, 403));
test('own profile omits password', async () => {
  const res = await request('/users/' + own, 'GET', undefined, true);
  assert.equal(res.status, 200);
  assert.equal(Object.hasOwn(await res.json(), 'password'), false);
});
test('cannot change account role', async () => assert.equal((await request('/users/' + own, 'PUT', { role: 'seller' }, true)).status, 400));
test('cannot delete another product', async () => assert.equal((await request('/products/' + other, 'DELETE', undefined, true)).status, 403));
test('invalid product data rejected', async () => assert.equal((await request('/products', 'POST', { price: -1 }, true)).status, 400));
test('invalid product ID rejected', async () => assert.equal((await request('/products/not-an-id')).status, 400));
test('invalid pagination rejected', async () => assert.equal((await request('/products?limit=1000')).status, 400));
test('invalid review rating rejected', async () => assert.equal((await request('/products/' + other + '/reviews', 'POST', { rating: 6, comment: 'Test' }, true)).status, 400));

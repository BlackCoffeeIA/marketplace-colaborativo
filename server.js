import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createApp } from './app.js';

dotenv.config();
async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configure MONGO_URI and a JWT_SECRET of at least 32 characters');
  }
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  await connectDB();
  createApp().listen(port, () => console.log('API listening on port ' + port));
}
start().catch(() => {
  console.error('Startup failed. Check configuration and database connectivity.');
  process.exitCode = 1;
});

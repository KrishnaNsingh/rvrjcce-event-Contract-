import app from '../backend/server.js';
import { connectDB } from '../backend/config/db.js';

// Ensure MongoDB Atlas is connected in serverless lambda lifecycle
connectDB().catch(err => {
  console.warn('[Vercel Serverless] MongoDB Connect Error:', err.message);
});

export default app;

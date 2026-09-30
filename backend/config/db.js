import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';

// Load .env from both project root and backend dir safely
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, '../../.env');
const backendEnv = path.resolve(__dirname, '../.env');

if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
} else {
  dotenv.config();
}

let isConnected = false;
let connectionError = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://Krishna:krishna2532@cluster0.bdf1zlp.mongodb.net/rvrjcce_events?retryWrites=true&w=majority&appName=Cluster0";

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    connectionError = null;
    console.log(`[Database] MongoDB Atlas Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    
    // Auto-seed initial registrations if collection is empty
    seedIfEmpty().catch(e => console.warn('[Database seed error]:', e.message));

    return true;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`[Database Warning] MongoDB Atlas connection unsuccessful: ${err.message}`);
    console.warn(`[Database Notice] Operating in dual-mode with resilient local JSON store. When MongoDB Atlas credentials in .env are updated, Atlas will connect seamlessly.`);
    return false;
  }
}

async function seedIfEmpty() {
  try {
    const { MongooseRegistration } = await import('../models/Registration.js');
    const { Counter } = await import('../models/Counter.js');
    const count = await MongooseRegistration.countDocuments();
    if (count === 0) {
      const dataFilePath = path.resolve(__dirname, '../../data/registrations.json');
      if (fs.existsSync(dataFilePath)) {
        const seed = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        for (const item of seed) {
          delete item._id;
          await MongooseRegistration.create(item);
        }
        await Counter.findByIdAndUpdate('registrationId', { seq: seed.length }, { upsert: true });
        console.log(`[Database] Seeded ${seed.length} initial registrations to MongoDB Atlas.`);
      }
    }
  } catch (err) {
    console.warn('[Database Seed Notice]:', err.message);
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionError = null;
  console.log('[Database] Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  connectionError = err.message;
  console.error('[Database] Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[Database] Mongoose disconnected from MongoDB Atlas');
});

export function getDbStatus() {
  const connected = mongoose.connection.readyState === 1;
  return {
    connected,
    mode: connected ? 'MongoDB Atlas' : 'Local Persistent Fallback Store',
    error: connectionError,
    host: connected ? mongoose.connection.host : 'local-store',
    name: connected ? mongoose.connection.name : 'rvrjcce_events'
  };
}

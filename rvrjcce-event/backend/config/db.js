import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

let isConnected = false;
let connectionError = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://krishna:krishna123@cluster0.bdf1zlp.mongodb.net/rvrjcce_events?retryWrites=true&w=majority&appName=Cluster0";

  if (isConnected) {
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
    return true;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`[Database Warning] MongoDB Atlas connection unsuccessful: ${err.message}`);
    console.warn(`[Database Notice] Operating in dual-mode with resilient local JSON store. When MongoDB Atlas credentials in .env are updated, Atlas will connect seamlessly.`);
    return false;
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
  return {
    connected: isConnected,
    mode: isConnected ? 'MongoDB Atlas' : 'Local Persistent Fallback Store',
    error: connectionError,
    host: isConnected ? mongoose.connection.host : 'local-store',
    name: isConnected ? mongoose.connection.name : 'rvrjcce_events'
  };
}

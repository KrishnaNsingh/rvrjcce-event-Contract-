import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'dist');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health / Status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: getDbStatus()
  });
});

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api', registrationRoutes);

// Static assets
app.use(express.static(PUBLIC_DIR));
if (fs.existsSync(path.join(process.cwd(), 'public'))) {
  app.use(express.static(path.join(process.cwd(), 'public')));
}

// SPA Fallback: send index.html for client-side routing
app.use((req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Resource not found. Please run "npm run build" first.');
  }
});

export function startServer(port = Number(PORT)) {
  return new Promise(async (resolve, reject) => {
    // Attempt MongoDB Atlas connection asynchronously
    connectDB().catch(err => {
      console.warn('[MongoDB Connect Exception]:', err.message);
    });

    const tryListen = (currentPort) => {
      const server = app.listen(currentPort, () => {
        console.log(`\n=============================================================`);
        console.log(`  COLORIDO 2K26 — RVRJCCE Production Server Active`);
        console.log(`  Backend: Node.js Express REST API (Standard Industry Architecture)`);
        console.log(`  Local URL: http://localhost:${currentPort}`);
        console.log(`  Database Mode: ${getDbStatus().mode}`);
        console.log(`=============================================================\n`);
        resolve(server);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${currentPort} is busy. Trying port ${currentPort + 1}...`);
          tryListen(currentPort + 1);
        } else {
          reject(err);
        }
      });
    };

    tryListen(port);
  });
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  startServer();
}

export default app;

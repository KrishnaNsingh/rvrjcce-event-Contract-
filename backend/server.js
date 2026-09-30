import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Load environment variables from root or backend
if (fs.existsSync(path.join(PROJECT_ROOT, '.env'))) {
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'dist');

// Cross-Origin Resource Sharing (Allows Vercel frontend to communicate with Render backend)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
}));
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
if (fs.existsSync(path.join(PROJECT_ROOT, 'public'))) {
  app.use(express.static(path.join(PROJECT_ROOT, 'public')));
}

// Fallback: send index.html if frontend is co-located, or return API welcome info
app.use((req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).json({
    service: 'COLORIDO 2K26 REST API',
    institution: 'R.V.R. & J.C. College of Engineering',
    status: 'online',
    endpoints: {
      health: '/api/health',
      events: '/api/events',
      registrations: '/api/registrations',
      stats: '/api/stats',
      adminLogin: '/api/admin/login'
    }
  });
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

/**
 * Express-compatible REST API & Static Server for RVRJCCE Inter-College Meet
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { Registration } from './models/Registration.js';
import { INSTITUTION, CATEGORIES, SPORTS_DIVISIONS, CULTURAL_EVENTS } from './config/eventConfig.js';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // API Routes
  try {
    // GET /api/stats
    if (pathname === '/api/stats' && method === 'GET') {
      const stats = await Registration.getStats();
      return sendJson(res, 200, { success: true, stats, institution: INSTITUTION });
    }

    // GET /api/events
    if (pathname === '/api/events' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        institution: INSTITUTION,
        categories: CATEGORIES,
        sports: SPORTS_DIVISIONS,
        cultural: CULTURAL_EVENTS
      });
    }

    // GET /api/registrations
    if (pathname === '/api/registrations' && method === 'GET') {
      const { category, division, event, search } = parsedUrl.query;
      const registrations = await Registration.find({ category, division, event, search });
      return sendJson(res, 200, {
        success: true,
        count: registrations.length,
        registrations
      });
    }

    // POST /api/registrations
    if (pathname === '/api/registrations' && method === 'POST') {
      const body = await parseJsonBody(req);
      try {
        const created = await Registration.create(body);
        return sendJson(res, 201, {
          success: true,
          message: "Registration submitted and recorded successfully.",
          registration: created
        });
      } catch (validationErr) {
        return sendJson(res, 400, {
          success: false,
          error: validationErr.message,
          validationErrors: validationErr.validationErrors || [validationErr.message]
        });
      }
    }

    // GET /api/registrations/:id
    if (pathname.startsWith('/api/registrations/') && method === 'GET') {
      const id = pathname.slice('/api/registrations/'.length);
      const reg = await Registration.findById(id);
      if (!reg) {
        return sendJson(res, 404, { success: false, error: "Registration not found" });
      }
      return sendJson(res, 200, { success: true, registration: reg });
    }

    // DELETE /api/registrations/:id
    if (pathname.startsWith('/api/registrations/') && method === 'DELETE') {
      const id = pathname.slice('/api/registrations/'.length);
      const deleted = await Registration.findByIdAndDelete(id);
      if (!deleted) {
        return sendJson(res, 404, { success: false, error: "Registration not found or already deleted" });
      }
      return sendJson(res, 200, {
        success: true,
        message: "Registration deleted successfully",
        registration: deleted
      });
    }

    // GET /api/export-csv
    if (pathname === '/api/export-csv' && method === 'GET') {
      const registrations = await Registration.find(parsedUrl.query);
      const headers = [
        "Registration ID",
        "Participant Name",
        "Team Name",
        "College / Institution",
        "Email",
        "Phone Number",
        "Category",
        "Division",
        "Event",
        "Status",
        "Registration Date"
      ];

      const csvRows = [headers.join(",")];
      for (const r of registrations) {
        const row = [
          `"${(r.registrationId || '').replace(/"/g, '""')}"`,
          `"${(r.participantName || '').replace(/"/g, '""')}"`,
          `"${(r.teamName || '').replace(/"/g, '""')}"`,
          `"${(r.college || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${(r.phoneNumber || '').replace(/"/g, '""')}"`,
          `"${(r.category || '').replace(/"/g, '""')}"`,
          `"${(r.division || '').replace(/"/g, '""')}"`,
          `"${(r.event || '').replace(/"/g, '""')}"`,
          `"${(r.status || '').replace(/"/g, '""')}"`,
          `"${(r.registrationDate || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\n");
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rvrjcce_registrations.csv"',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(csvContent);
    }
  } catch (err) {
    console.error("API error:", err);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }

  // Static file serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client routes (/register, /admin, etc.)
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Resource not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

export function startServer(port = PORT) {
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`RVRJCCE University Event Server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  startServer();
}

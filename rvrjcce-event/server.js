/**
 * RVR & JC College of Engineering — COLORIDO 2K26 Event Platform
 * Root server entrypoint delegating to standard backend/server.js
 */

import url from 'node:url';
import app, { startServer } from './backend/server.js';

export { app, startServer };

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  startServer();
}

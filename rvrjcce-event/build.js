import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

console.log('Bundling React client with esbuild...');

const esbuildBin = '/usr/share/npm-global/lib/node_modules/vercel/node_modules/esbuild/bin/esbuild';
const cmd = `${esbuildBin} src/index.jsx --bundle --outfile=dist/bundle.js --format=esm --jsx-factory=React.createElement --jsx-fragment=React.Fragment`;
execSync(cmd, { stdio: 'inherit' });

fs.copyFileSync(
  path.join(process.cwd(), 'src/styles/main.css'),
  path.join(DIST_DIR, 'main.css')
);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RVRJCCE — Inter-College Sports & Cultural Meet 2026</title>
  <meta name="description" content="Official website for RVR & JC College of Engineering Inter-College Sports and Literary & Cultural competitions. Guntur, Andhra Pradesh.">
  <link rel="stylesheet" href="/main.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/bundle.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf-8');
console.log('Build completed successfully.');

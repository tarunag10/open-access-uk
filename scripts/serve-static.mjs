import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || 'open-access-uk-site');
const port = Number(process.argv[3] || 4180);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0] || '/');
  const relativePath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const absolutePath = resolve(join(root, relativePath));

  if (absolutePath !== root && !absolutePath.startsWith(`${root}${sep}`)) return null;
  if (!existsSync(absolutePath)) return null;

  const stats = statSync(absolutePath);
  if (stats.isDirectory()) return join(absolutePath, 'index.html');
  return absolutePath;
}

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || '/');

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream'
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Open Access UK static server ready on http://127.0.0.1:${port}`);
});

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 58291;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // Normalize URL path
  let urlPath = req.url.split('?')[0];
  
  // SPA routing: redirect navigation paths (except assets) to index.html
  if (urlPath === '/' || urlPath === '/login' || urlPath === '/faculty' || (!urlPath.startsWith('/assets/') && !path.extname(urlPath))) {
    urlPath = '/index.html';
  }
  
  const filePath = path.join(DIST_DIR, urlPath);
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(DIST_DIR, 'index.html');
      serveFile(indexPath, res, req.headers['accept-encoding']);
    } else {
      serveFile(filePath, res, req.headers['accept-encoding']);
    }
  });
});

function serveFile(filePath, res, acceptEncoding = '') {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', contentType);
  // Serve with far-future caching for asset files, but no-cache for HTML to ensure instant updates
  if (filePath.includes('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  const rawStream = fs.createReadStream(filePath);
  
  // Only compress text/js/css/json assets
  const shouldCompress = /text|javascript|json|svg/.test(contentType);
  
  if (shouldCompress && acceptEncoding && acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    rawStream.pipe(zlib.createGzip()).pipe(res);
  } else {
    rawStream.pipe(res);
  }
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Native Gzip Preview Server running at: http://localhost:${PORT}`);
  console.log(`📂 Serving production directory: ${DIST_DIR}`);
  console.log(`======================================================\n`);
});

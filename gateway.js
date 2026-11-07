const http = require('http');

const PORT = process.env.GATEWAY_PORT || 8080;
const TARGET_HOST = process.env.TARGET_HOST || '127.0.0.1';
const BACKEND_PORT = process.env.BACKEND_PORT || 3000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173;

const server = http.createServer((req, res) => {
  const isBackend = req.url.startsWith('/api') || req.url.startsWith('/uploads');
  const targetPort = isBackend ? BACKEND_PORT : FRONTEND_PORT;

  const options = {
    hostname: TARGET_HOST,
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${TARGET_HOST}:${targetPort}`,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Gateway Error: service unavailable', details: err.message }));
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`ListoApp Unified Gateway running on http://0.0.0.0:${PORT}`);
  console.log(`-> /api & /uploads routed to ${TARGET_HOST}:${BACKEND_PORT}`);
  console.log(`-> Frontend routed to ${TARGET_HOST}:${FRONTEND_PORT}`);
});

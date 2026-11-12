import { request as httpRequest } from 'node:http';
import net from 'node:net';

/**
 * URL'nin Socket.IO el sıkışma/taşıma yoluna ait olup olmadığını kontrol eder.
 */
export function isSocketIoUrl(url) {
  if (typeof url !== 'string') return false;
  return (
    url === '/socket.io' ||
    url.startsWith('/socket.io/') ||
    url.startsWith('/socket.io?')
  );
}

/**
 * HTTP isteğinin NestJS arka ucuna (/socket.io* veya /api/health) yönlendirilip
 * yönlendirilmeyeceğini belirler.
 */
export function isBackendHttpProxyUrl(url) {
  if (typeof url !== 'string') return false;
  return (
    isSocketIoUrl(url) ||
    url === '/api/health' ||
    url.startsWith('/api/health?')
  );
}

/**
 * Proxy hedef yolunu normalize eder (`/socket.io` -> `/socket.io/`).
 */
export function normalizeProxyPath(url) {
  if (!isSocketIoUrl(url)) return url;
  return url.startsWith('/socket.io/')
    ? url
    : url.replace('/socket.io', '/socket.io/');
}

/**
 * HTTP isteklerini arka uç NestJS sunucusuna aktarır.
 */
export function forwardHttpToBackend({
  req,
  res,
  backendHost = '127.0.0.1',
  backendPort,
}) {
  const targetPath = normalizeProxyPath(req.url || '/');
  const proxyReq = httpRequest(
    {
      hostname: backendHost,
      port: backendPort,
      path: targetPath,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      proxyRes.on('error', () => {
        if (!res.writableEnded) {
          res.destroy();
        }
      });
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    },
  );

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502);
    }
    if (!res.writableEnded) {
      res.end('Socket.io arka uç sunucusuna ulaşılamadı.');
    }
  });

  req.on('error', () => proxyReq.destroy());
  res.on('close', () => {
    if (!res.writableEnded) {
      proxyReq.destroy();
    }
  });

  req.pipe(proxyReq, { end: true });
}

/**
 * WebSocket HTTP Upgrade el sıkışmasını ve ham TCP akışını sıfır Nagle gecikmesiyle
 * arka uç NestJS soketine yönlendirir.
 */
export function forwardUpgradeToBackend({
  req,
  socket,
  head,
  backendHost = '127.0.0.1',
  backendPort,
}) {
  const targetPath = normalizeProxyPath(req.url || '/');
  const proxySocket = net.connect(backendPort, backendHost, () => {
    proxySocket.setNoDelay(true);

    const headerLines = [`${req.method} ${targetPath} HTTP/${req.httpVersion}`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headerLines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    }
    headerLines.push('', '');

    proxySocket.write(headerLines.join('\r\n'));
    if (head && head.length > 0) {
      proxySocket.write(head);
    }

    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxySocket.on('error', () => socket.destroy());
  socket.on('error', () => proxySocket.destroy());
  proxySocket.on('close', () => socket.destroy());
  socket.on('close', () => proxySocket.destroy());
  proxySocket.on('end', () => {
    socket.end();
    socket.destroy();
  });
  socket.on('end', () => {
    proxySocket.end();
    proxySocket.destroy();
  });
}


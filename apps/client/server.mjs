import { createServer, request as httpRequest } from 'node:http';
import net from 'node:net';
import next from 'next';

if (process.argv.includes('--prod') && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const backendPort = parseInt(process.env.BACKEND_PORT || '4000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();
const nextUpgradeHandler = app.getUpgradeHandler();

function isSocketIoUrl(url) {
  return (
    url === '/socket.io' ||
    url.startsWith('/socket.io/') ||
    url.startsWith('/socket.io?')
  );
}

/**
 * Next.js ve NestJS Socket.io sunucusunu tek portta (3000) birleştiren,
 * Nagle algoritması devre dışı bırakılmış (TCP_NODELAY) sıfır gecikmeli WebSocket Proxy sunucusu.
 */
const server = createServer((req, res) => {
  if (req.url && isSocketIoUrl(req.url)) {
    const targetPath = req.url.startsWith('/socket.io/')
      ? req.url
      : req.url.replace('/socket.io', '/socket.io/');

    const proxyReq = httpRequest(
      {
        hostname: '127.0.0.1',
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
    return;
  }

  void handle(req, res);
});

// WebSocket (wss:// ve ws://) Upgrade İsteklerini Doğrudan NestJS (4000) Soketine Bağla
server.on('upgrade', (req, socket, head) => {
  socket.setNoDelay(true);

  if (req.url && isSocketIoUrl(req.url)) {
    const targetPath = req.url.startsWith('/socket.io/')
      ? req.url
      : req.url.replace('/socket.io', '/socket.io/');

    const proxySocket = net.connect(backendPort, '127.0.0.1', () => {
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
    return;
  }

  void nextUpgradeHandler(req, socket, head);
});

server.listen(port, hostname, () => {
  console.log(
    `> [GyroMaze] Düşük gecikmeli WebGL + WebSocket Proxy sunucusu hazır: http://${hostname}:${port}`,
  );
});

function closeServer() {
  const forceTimer = setTimeout(() => process.exit(0), 1500);
  forceTimer.unref();
  server.closeAllConnections?.();
  server.close(() => {
    clearTimeout(forceTimer);
    process.exit(0);
  });
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

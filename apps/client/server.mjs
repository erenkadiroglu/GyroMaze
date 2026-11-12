import { createServer } from 'node:http';
import next from 'next';
import {
  forwardHttpToBackend,
  forwardUpgradeToBackend,
  isBackendHttpProxyUrl,
  isSocketIoUrl,
} from './proxy-helpers.mjs';

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

/**
 * Next.js ve NestJS Socket.io sunucusunu tek portta (3000) birleştiren,
 * Nagle algoritması devre dışı bırakılmış (TCP_NODELAY) sıfır gecikmeli WebSocket Proxy sunucusu.
 */
const server = createServer((req, res) => {
  if (req.url && isBackendHttpProxyUrl(req.url)) {
    forwardHttpToBackend({ req, res, backendPort });
    return;
  }

  void handle(req, res);
});

// WebSocket (wss:// ve ws://) Upgrade İsteklerini Doğrudan NestJS (4000) Soketine Bağla
server.on('upgrade', (req, socket, head) => {
  socket.setNoDelay(true);

  if (req.url && isSocketIoUrl(req.url)) {
    forwardUpgradeToBackend({ req, socket, head, backendPort });
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

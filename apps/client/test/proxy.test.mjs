import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import net from 'node:net';
import {
  forwardHttpToBackend,
  forwardUpgradeToBackend,
  isBackendHttpProxyUrl,
  isSocketIoUrl,
  normalizeProxyPath,
} from '../proxy-helpers.mjs';

function listenOnEphemeralPort(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

function closeHttpServer(server, activeSockets = new Set()) {
  return new Promise((resolve) => {
    for (const s of activeSockets) {
      try {
        s.destroy();
      } catch {
        // yoksay
      }
    }
    server.closeAllConnections?.();
    server.close(() => resolve());
  });
}

describe('GyroMaze Client Proxy Helpers', () => {
  it('Socket.IO, /api/health ve statik uygulama yollarını doğru sınıflandırıp normalize eder', () => {
    assert.equal(isSocketIoUrl('/socket.io'), true);
    assert.equal(isSocketIoUrl('/socket.io/?EIO=4&transport=websocket'), true);
    assert.equal(isSocketIoUrl('/socket.io?EIO=4'), true);
    assert.equal(isSocketIoUrl('/socket.io-other'), false);
    assert.equal(isSocketIoUrl('/api/health'), false);

    assert.equal(isBackendHttpProxyUrl('/api/health'), true);
    assert.equal(isBackendHttpProxyUrl('/api/health?verbose=1'), true);
    assert.equal(isBackendHttpProxyUrl('/socket.io/?EIO=4'), true);
    assert.equal(isBackendHttpProxyUrl('/_next/static/chunk.js'), false);

    assert.equal(normalizeProxyPath('/socket.io'), '/socket.io/');
    assert.equal(normalizeProxyPath('/socket.io?EIO=4'), '/socket.io/?EIO=4');
    assert.equal(normalizeProxyPath('/socket.io/?EIO=4'), '/socket.io/?EIO=4');
    assert.equal(normalizeProxyPath('/api/health'), '/api/health');
  });

  it('HTTP /api/health, /socket.io iletimini ve kapalı arka uçta 502 yanıtını doğrular', async () => {
    const mockSockets = new Set();
    const proxySockets = new Set();
    const receivedPaths = [];
    const mockBackend = createServer((req, res) => {
      receivedPaths.push(req.url);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: req.url }));
    });
    mockBackend.on('connection', (sock) => {
      mockSockets.add(sock);
      sock.once('close', () => mockSockets.delete(sock));
    });
    const backendPort = await listenOnEphemeralPort(mockBackend);

    const proxyServer = createServer((req, res) => {
      if (req.url && isBackendHttpProxyUrl(req.url)) {
        forwardHttpToBackend({ req, res, backendPort });
        return;
      }
      res.writeHead(404);
      res.end('not found');
    });
    proxyServer.on('connection', (sock) => {
      proxySockets.add(sock);
      sock.once('close', () => proxySockets.delete(sock));
    });
    const proxyPort = await listenOnEphemeralPort(proxyServer);

    try {
      const healthRes = await fetch(`http://127.0.0.1:${proxyPort}/api/health`);
      assert.equal(healthRes.status, 200);
      assert.deepEqual(await healthRes.json(), { ok: true, path: '/api/health' });

      const sioRes = await fetch(`http://127.0.0.1:${proxyPort}/socket.io?EIO=4`);
      assert.equal(sioRes.status, 200);
      assert.deepEqual(await sioRes.json(), { ok: true, path: '/socket.io/?EIO=4' });
      assert.deepEqual(receivedPaths, ['/api/health', '/socket.io/?EIO=4']);

      await closeHttpServer(mockBackend, mockSockets);
      const downRes = await fetch(`http://127.0.0.1:${proxyPort}/api/health`);
      assert.equal(downRes.status, 502);
    } finally {
      await Promise.all([
        closeHttpServer(proxyServer, proxySockets),
        mockBackend.listening
          ? closeHttpServer(mockBackend, mockSockets)
          : Promise.resolve(),
      ]);
    }
  });

  it('WebSocket HTTP Upgrade el sıkışmasını normalize yol üzerinden çift yönlü tünel olarak iletir', async () => {
    const activeSockets = new Set();
    const mockBackend = createServer();
    mockBackend.on('connection', (sock) => {
      activeSockets.add(sock);
      sock.once('close', () => activeSockets.delete(sock));
    });
    mockBackend.on('upgrade', (req, socket) => {
      activeSockets.add(socket);
      socket.once('close', () => activeSockets.delete(socket));
      socket.on('end', () => socket.destroy());
      socket.write(
        [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          `X-Proxied-Url: ${req.url}`,
          '',
          '',
        ].join('\r\n'),
      );
      socket.on('data', (chunk) => {
        socket.write(`echo:${chunk.toString('utf8')}`);
      });
    });
    const backendPort = await listenOnEphemeralPort(mockBackend);

    const proxyServer = createServer();
    proxyServer.on('connection', (sock) => {
      activeSockets.add(sock);
      sock.once('close', () => activeSockets.delete(sock));
    });
    proxyServer.on('upgrade', (req, socket, head) => {
      activeSockets.add(socket);
      socket.once('close', () => activeSockets.delete(socket));
      forwardUpgradeToBackend({ req, socket, head, backendPort });
    });
    const proxyPort = await listenOnEphemeralPort(proxyServer);

    let clientSocket = null;
    try {
      const result = await new Promise((resolve, reject) => {
        const client = net.connect(proxyPort, '127.0.0.1', () => {
          client.write(
            [
              'GET /socket.io?EIO=4&transport=websocket HTTP/1.1',
              `Host: 127.0.0.1:${proxyPort}`,
              'Upgrade: websocket',
              'Connection: Upgrade',
              '',
              '',
            ].join('\r\n'),
          );
        });
        clientSocket = client;

        let buffer = '';
        let sentPayload = false;
        client.setTimeout(3000);
        client.on('timeout', () => {
          client.destroy();
          reject(new Error('Upgrade proxy zaman aşımına uğradı'));
        });
        client.on('error', reject);
        client.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
          if (!sentPayload && buffer.includes('\r\n\r\n')) {
            sentPayload = true;
            client.write('gyro-ping');
          }
          if (buffer.includes('echo:gyro-ping')) {
            client.destroy();
            resolve(buffer);
          }
        });
      });

      assert.match(result, /HTTP\/1\.1 101 Switching Protocols/);
      assert.match(result, /X-Proxied-Url: \/socket\.io\/\?EIO=4&transport=websocket/);
      assert.match(result, /echo:gyro-ping/);
    } finally {
      if (clientSocket) {
        try {
          clientSocket.destroy();
        } catch {
          // yoksay
        }
      }
      await Promise.all([
        closeHttpServer(proxyServer, activeSockets),
        closeHttpServer(mockBackend, activeSockets),
      ]);
    }
  });
});


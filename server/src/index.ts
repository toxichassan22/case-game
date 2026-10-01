import Fastify from 'fastify';
import { WebSocketServer, WebSocket } from 'ws';
import './db/index.js'; // Ensure DB is initialized
import { handleClientMessage, handlePlayerDisconnect } from './websocket/handler.js';
import os from 'os';
// @ts-expect-error - qrcode-terminal type definitions are missing
import qrcode from 'qrcode-terminal';

const IS_PROD = process.env.NODE_ENV === 'production';

/** Production-aware logger: suppresses verbose logs in production */
const serverLog = {
  log: (...args: unknown[]) => { if (!IS_PROD) console.log(...args); },
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => {
    if (IS_PROD) {
      const safe = args.map(a => a instanceof Error ? a.message : typeof a === 'string' ? a : '[hidden]');
      console.error('[Server Error]', ...safe);
    } else {
      console.error(...args);
    }
  },
};

function isPrivateIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

function getAllLocalIps(): string[] {
  const nets = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || record.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count++;
  return true;
}

// Periodically clean up stale rate limit entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (record.resetTime < now) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW * 2);

// Initialize Database (triggered reload)
serverLog.log('[DB] SQLite database initialized with schemas.');

// Initialize Fastify
const fastify = Fastify({
  logger: false, // Set to true for debugging HTTP requests
});

// Add Rate Limiting and CORS and Security Headers
fastify.addHook('onRequest', (request, reply, done) => {
  const ip = request.ip || request.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    reply.status(429).send({ error: 'Too Many Requests' });
    return;
  }

  // CSRF Protection for state-changing methods
  const method = request.method;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = request.headers.origin;
    const host = request.headers.host;
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (!host.includes(originHost.split(':')[0])) {
        reply.status(403).send({ error: 'CSRF validation failed' });
        return;
      }
    }
  }

  // Security Headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Enhanced CSP: removed unsafe-inline for better security
  reply.header('Content-Security-Policy', "default-src 'self'; connect-src 'self' ws: wss: http://localhost:* ws://localhost:*; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none';");

  const origin = request.headers.origin;
  if (origin) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
    } else {
      reply.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
  } else {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  }

  reply.header('Access-Control-Allow-Headers', 'Content-Type');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (request.method === 'OPTIONS') {
    reply.send();
    done();
    return;
  }
  done();
});

// Health Check Endpoint
fastify.get('/health', async () => {
  return { status: 'ok', uptime: process.uptime(), timestamp: Date.now() };
});

// Register Auth Routes
import { authRoutes } from './routes/auth.js';
authRoutes(fastify);

// Basic HTTP routes
fastify.get('/api/server-info', async (_request, _reply) => {
  const ips = getAllLocalIps();
  const preferredIp = ips.find(isPrivateIp) || ips[0] || 'localhost';
  return { status: 'ok', address: preferredIp, port: process.env.PORT || 3001, all_ips: ips };
});

fastify.get('/rooms', async (_request, _reply) => {
  const { roomManager } = await import('./managers/RoomManager.js');
  return roomManager.listRooms();
});

fastify.get('/rooms/lobby/:playerId', async (request, reply) => {
  const { playerId } = request.params as { playerId: string };
  if (!/^[a-zA-Z0-9-]+$/.test(playerId)) {
    return reply.status(400).send({ error: 'Invalid playerId format' });
  }
  const { roomManager } = await import('./managers/RoomManager.js');
  const [allRooms, activeRooms] = await Promise.all([
    roomManager.listRooms(),
    roomManager.listActiveRoomsForPlayer(playerId)
  ]);
  return { allRooms, activeRooms };
});

fastify.get('/rooms/active/:playerId', async (request, reply) => {
  const { playerId } = request.params as { playerId: string };
  if (!/^[a-zA-Z0-9-]+$/.test(playerId)) {
    return reply.status(400).send({ error: 'Invalid playerId format' });
  }
  const { roomManager } = await import('./managers/RoomManager.js');
  return roomManager.listActiveRoomsForPlayer(playerId);
});

// We will add more REST endpoints for profiles/rooms later in the implementation.

// Websocket logic
const wss = new WebSocketServer({ server: fastify.server });

wss.on('connection', (ws: WebSocket, req) => {
  const ip = req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    ws.close(1008, 'Rate limit exceeded');
    return;
  }
  
  serverLog.log('[WS] New connection established');

  ws.on('message', async (data: Buffer) => {
    let message: unknown;

    try {
      message = JSON.parse(data.toString());
    } catch (err) {
      serverLog.error('[WS] Failed to parse message', err);
      ws.send(JSON.stringify({ type: 'ERROR', payload: { code: 'PARSE_ERROR', message: 'Invalid message format' } }));
      return;
    }

    try {
      await handleClientMessage(ws, message as Record<string, unknown>);
    } catch (err) {
      serverLog.error('[WS] Failed to handle message', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          payload: {
            code: 'MESSAGE_HANDLER_ERROR',
            message: 'تعذر تنفيذ الإجراء المطلوب',
          },
        }));
      }
    }
  });

  ws.on('close', (code, reason) => {
    serverLog.log(`[WS] Connection closed. Code: ${code}, Reason: ${reason}`);
    handlePlayerDisconnect(ws);
  });
});

// Start the server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    // Print ASCII Info
    const ips = getAllLocalIps();
    const preferredIp = ips.find(isPrivateIp) || ips[0] || 'localhost';
    const webUrl = `http://${preferredIp}:5173`;

    console.log(`\n\x1b[36m══════════════════════════════════════════════════`);
    console.log(`  نظام التحقيق الموحد - جاهز للعب`);
    console.log(`══════════════════════════════════════════════════\x1b[0m`);
    console.log(`  الجهاز الحالي: http://localhost:5173`);
    
    if (ips.length > 0) {
      console.log(`  أجهزة أخرى (LAN):`);
      ips.forEach(ip => {
        const marker = ip === preferredIp ? ' ← (المفضل)' : '';
        console.log(`    - http://${ip}:5173${marker}`);
      });
    } else {
      console.log(`  أجهزة أخرى:   (لم يتم العثور على واجهات شبكة خارجية)`);
    }
    console.log(``);
    
    qrcode.generate(webUrl, { small: true });
    
    console.log(`\x1b[36m  اضغط Ctrl+C للإيقاف`);
    console.log(`══════════════════════════════════════════════════\x1b[0m\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful Shutdown
process.on('SIGTERM', async () => {
  serverLog.log('[Server] SIGTERM received. Shutting down gracefully...');
  try {
    await fastify.close();
    wss.close(() => {
      serverLog.log('[WS] All connections closed');
      process.exit(0);
    });
  } catch (err) {
    serverLog.error('[Server] Error during shutdown', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  serverLog.log('[Server] SIGINT received. Shutting down gracefully...');
  try {
    await fastify.close();
    wss.close(() => {
      serverLog.log('[WS] All connections closed');
      process.exit(0);
    });
  } catch (err) {
    serverLog.error('[Server] Error during shutdown', err);
    process.exit(1);
  }
});

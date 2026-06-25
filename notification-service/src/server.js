import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import subscriber from './config/redis.js';
import healthRoutes from './routes/health.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use('/health', healthRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('error', console.error);
});

subscriber.subscribe('dog-events', (err) => {
  if (err) console.error('Redis subscribe error:', err);
});

subscriber.on('message', (_channel, message) => {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
});

server.listen(process.env.PORT || 3003, () => {
  console.log(`Notification service running on port ${process.env.PORT || 3003}`);
});

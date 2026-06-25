import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';
import healthRoutes from './routes/health.js';
import { setupSubscriber } from './models/subscriber.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(morgan('combined'));
app.use('/health', healthRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('error', console.error);
});

setupSubscriber(wss);

server.listen(process.env.PORT || 3003, () => {
  console.log(`Notification service running on port ${process.env.PORT || 3003}`);
});

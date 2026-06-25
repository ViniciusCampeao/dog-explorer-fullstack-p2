import { WebSocket } from 'ws';
import subscriber from '../config/redis.js';

export function setupSubscriber(wss) {
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
}

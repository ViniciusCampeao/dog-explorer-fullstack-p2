import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { sanitize } from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import dogsRoutes from './routes/dogs.js';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('trust proxy', 1)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(morgan(':date[iso] [resource-service] :method :url :status :res[content-length]B :response-time ms'));
app.use(express.json());
app.use((req, _res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  next();
});
app.use(limiter);

app.use('/dogs', dogsRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 3002, () => {
    console.log(`Resource service running on port ${process.env.PORT || 3002}`);
  });
});

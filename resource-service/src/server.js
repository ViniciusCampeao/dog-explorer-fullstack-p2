import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
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

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(mongoSanitize());
app.use(limiter);

app.use('/dogs', dogsRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 3002, () => {
    console.log(`Resource service running on port ${process.env.PORT || 3002}`);
  });
});

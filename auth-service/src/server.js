import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();

app.set('trust proxy', 1)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(mongoSanitize());

app.use('/auth', authRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Auth service running on port ${process.env.PORT || 3001}`);
  });
});

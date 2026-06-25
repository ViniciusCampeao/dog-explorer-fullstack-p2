import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/auth', authRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Auth service running on port ${process.env.PORT || 3001}`);
  });
});

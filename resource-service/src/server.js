import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import dogsRoutes from './routes/dogs.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/dogs', dogsRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 3002, () => {
    console.log(`Resource service running on port ${process.env.PORT || 3002}`);
  });
});

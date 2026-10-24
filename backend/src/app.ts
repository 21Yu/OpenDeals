import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import shoppingRouter from './routes/shopping.js';
import usersRouter from './routes/users.js';
import cronRouter from './routes/cron.js';

const app = express();
const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: origins,
  credentials: true,
}));

app.use('/shopping', shoppingRouter);
app.use('/users', usersRouter);
app.use('/cron', cronRouter);
app.use('/api/shopping', shoppingRouter);
app.use('/api/users', usersRouter);
app.use('/api/cron', cronRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

export default app;
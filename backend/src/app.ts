import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import shoppingRouter from './routes/shopping.js';
import usersRouter from './routes/users.js';

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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

export default app;
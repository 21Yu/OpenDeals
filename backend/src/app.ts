import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import shoppingRouter from './routes/shopping.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use('/shopping', shoppingRouter);
app.use('/users', usersRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

export default app;
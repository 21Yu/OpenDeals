import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import cors from 'cors'
import shoppingRouter from './routes/shopping';
import usersRouter from './routes/users';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
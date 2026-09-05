import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import shoppingRouter from './routes/shopping';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use('/api/shopping', shoppingRouter);


app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
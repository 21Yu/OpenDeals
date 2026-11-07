import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import shoppingRouter from './routes/shopping.js';
import usersRouter from './routes/users.js';
import cronRouter from './routes/cron.js';
import productsRouter from './routes/products.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Routes
app.use('/api/shopping', shoppingRouter);
app.use('/api/users', usersRouter);
app.use('/api/cron', cronRouter);
app.use('/api/products', productsRouter);
app.use('/api/notifications', notificationsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

// Local dev listener (Vercel ignores this in production)
const PORT = process.env.PORT || 3001;
if (require.main === module && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
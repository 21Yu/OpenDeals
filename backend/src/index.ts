import app from './app.js';

const PORT = process.env.PORT || 3000;

// Local development server listener
// Vercel will ignore app.listen() and invoke the exported app instance directly
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

export default app;
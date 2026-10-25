declare global {
  namespace Express {
    interface Request {
      user?: import('./types.js').UserPayload;
    }
  }
}

export {};
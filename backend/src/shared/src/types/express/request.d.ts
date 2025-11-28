import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    validated?: {
      body?: any;
      query?: any;
      params?: any;
      headers?: any;
    };
  }
}

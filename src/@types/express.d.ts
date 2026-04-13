import { Request } from 'express';
import { IPayload } from '../jwt/types/IPayload';

declare global {
  namespace Express {
    interface Request {
      user?: IPayload;
    }
  }
}

export {};

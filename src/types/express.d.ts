import 'express';
import type { IPayload } from '../jwt/types/IPayload';

declare global {
  namespace Express {
    interface Request {
      user: IPayload;
    }
  }
}

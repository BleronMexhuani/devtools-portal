import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/** Validate that :id param is a valid MongoDB ObjectId */
export function validateObjectId(req: Request, res: Response, next: NextFunction): void {
  const id = req.params.id as string;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  next();
}

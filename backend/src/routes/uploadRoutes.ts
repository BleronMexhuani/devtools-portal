import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/upload';
import { uploadIcon } from '../controllers/uploadController';
import multer from 'multer';

const router = Router();

/** Handle multer errors with proper HTTP responses */
function handleMulterError(err: Error, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File is too large. Maximum size is 2 MB.' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  if (err.message.includes('Only image files')) {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
}

router.post('/icon', authenticate, upload.single('icon'), uploadIcon, handleMulterError);

export default router;

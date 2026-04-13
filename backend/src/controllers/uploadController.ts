import { Request, Response } from 'express';

/** POST /api/uploads/icon — Upload an icon image file (admin only) */
export async function uploadIcon(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const iconUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: iconUrl });
}

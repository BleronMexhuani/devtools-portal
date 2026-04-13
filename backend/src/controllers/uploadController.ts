import { Request, Response } from 'express';
import fs from 'fs';

/** Magic byte signatures for allowed image types */
const MAGIC_BYTES: { mime: string; bytes: number[] }[] = [
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
];

function isValidImage(filePath: string): boolean {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(8);
  fs.readSync(fd, buf, 0, 8, 0);
  fs.closeSync(fd);
  return MAGIC_BYTES.some(({ bytes }) => bytes.every((b, i) => buf[i] === b));
}

/** POST /api/uploads/icon — Upload an icon image file (admin only) */
export async function uploadIcon(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Verify actual file content matches an image format (prevent MIME spoofing)
  if (!isValidImage(req.file.path)) {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ error: 'File content does not match a valid image format' });
    return;
  }

  const iconUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: iconUrl });
}

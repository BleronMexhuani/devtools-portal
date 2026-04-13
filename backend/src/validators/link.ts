import { z } from 'zod';

export const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  url: z.string().url('Must be a valid URL'),
  description: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateLinkSchema = createLinkSchema.partial();

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

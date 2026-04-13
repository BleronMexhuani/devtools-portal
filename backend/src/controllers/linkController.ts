import { Request, Response } from 'express';
import { Link } from '../models/Link';

/** GET /api/links — Return all links sorted by category then sortOrder */
export async function getLinks(_req: Request, res: Response): Promise<void> {
  const links = await Link.find().sort({ categoryOrder: 1, category: 1, sortOrder: 1, createdAt: -1 });
  res.json(links);
}

/** GET /api/links/:id — Return a single link by ID */
export async function getLinkById(req: Request, res: Response): Promise<void> {
  const link = await Link.findById(req.params.id);
  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }
  res.json(link);
}

/** POST /api/links — Create a new link (admin only) */
export async function createLink(req: Request, res: Response): Promise<void> {
  const link = await Link.create(req.body);
  res.status(201).json(link);
}

/** PUT /api/links/:id — Update an existing link (admin only) */
export async function updateLink(req: Request, res: Response): Promise<void> {
  const link = await Link.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }
  res.json(link);
}

/** DELETE /api/links/:id — Delete a link (admin only) */
export async function deleteLink(req: Request, res: Response): Promise<void> {
  const link = await Link.findByIdAndDelete(req.params.id);
  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }
  res.status(204).send();
}

/** PATCH /api/links/reorder — Bulk update sort orders (admin only) */
export async function reorderLinks(req: Request, res: Response): Promise<void> {
  const { orders } = req.body as { orders: { id: string; sortOrder: number }[] };

  const ops = orders.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { sortOrder: item.sortOrder } },
    },
  }));

  await Link.bulkWrite(ops);
  res.json({ success: true });
}

/** PATCH /api/links/reorder-categories — Bulk update category orders (admin only) */
export async function reorderCategories(req: Request, res: Response): Promise<void> {
  const { orders } = req.body as { orders: { category: string; categoryOrder: number }[] };

  const ops = orders.map((item) => ({
    updateMany: {
      filter: { category: item.category },
      update: { $set: { categoryOrder: item.categoryOrder } },
    },
  }));

  await Link.bulkWrite(ops);
  res.json({ success: true });
}

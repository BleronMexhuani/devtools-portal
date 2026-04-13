import { Router } from 'express';
import { getLinks, getLinkById, createLink, updateLink, deleteLink } from '../controllers/linkController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateObjectId } from '../middleware/validateObjectId';
import { createLinkSchema, updateLinkSchema } from '../validators/link';

const router = Router();

// Public
router.get('/', getLinks);
router.get('/:id', validateObjectId, getLinkById);

// Protected (admin only)
router.post('/', authenticate, validate(createLinkSchema), createLink);
router.put('/:id', authenticate, validateObjectId, validate(updateLinkSchema), updateLink);
router.delete('/:id', authenticate, validateObjectId, deleteLink);

export default router;

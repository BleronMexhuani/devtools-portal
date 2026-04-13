import { Router } from 'express';
import { login } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/link';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), login);

export default router;

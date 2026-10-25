import { Router } from 'express';
import { z } from 'zod';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'TAILOR'], {
    errorMap: () => ({ message: 'Role must be either CUSTOMER or TAILOR' }),
  }),
  shopName: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  workingHours: z.string().optional(),
  bio: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

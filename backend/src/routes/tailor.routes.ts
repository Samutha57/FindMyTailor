import { Router } from 'express';
import { z } from 'zod';
import tailorController from '../controllers/tailor.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

const updateProfileSchema = z.object({
  shopName: z.string().min(2, 'Shop name is required').optional(),
  ownerName: z.string().min(2, 'Owner name is required').optional(),
  address: z.string().min(3, 'Address is required').optional(),
  contactPhone: z.string().min(5, 'Valid contact phone is required').optional(),
  workingHours: z.string().optional(),
  bio: z.string().optional(),
});

// Protected tailor endpoints
router.get('/me/profile', authenticate, requireRole(['TAILOR']), tailorController.getMyProfile);
router.put(
  '/me/profile',
  authenticate,
  requireRole(['TAILOR']),
  validate(updateProfileSchema),
  tailorController.updateMyProfile
);

// Public tailor discovery endpoints
router.get('/', tailorController.getAllTailors);
router.get('/:id', tailorController.getTailorById);

export default router;

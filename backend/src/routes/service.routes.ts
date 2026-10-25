import { Router } from 'express';
import { z } from 'zod';
import serviceController from '../controllers/service.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be greater than 0'),
  estimatedDays: z.number().int().positive('Estimated days must be at least 1 day'),
});

const updateServiceSchema = serviceSchema.partial();

// Tailor manages their services
router.post(
  '/',
  authenticate,
  requireRole(['TAILOR']),
  validate(serviceSchema),
  serviceController.createService
);

router.put(
  '/:id',
  authenticate,
  requireRole(['TAILOR']),
  validate(updateServiceSchema),
  serviceController.updateService
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['TAILOR']),
  serviceController.deleteService
);

// Public routes
router.get('/tailor/:tailorProfileId', serviceController.getTailorServices);
router.get('/:id', serviceController.getServiceById);

export default router;

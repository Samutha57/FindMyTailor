import { Router } from 'express';
import { z } from 'zod';
import orderController from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

const createOrderSchema = z.object({
  tailorProfileId: z.string().uuid('Invalid tailor profile ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  requestedDeliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid requested delivery date format',
  }),
  instructions: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'ACCEPTED',
    'MEASUREMENT',
    'CUTTING',
    'STITCHING',
    'FINISHING',
    'QUALITY_CHECK',
    'READY_FOR_PICKUP',
    'COMPLETED',
    'REJECTED',
  ]),
  note: z.string().optional(),
});

// Customer routes
router.post(
  '/',
  authenticate,
  requireRole(['CUSTOMER']),
  validate(createOrderSchema),
  orderController.createOrder
);

router.get(
  '/my-orders',
  authenticate,
  requireRole(['CUSTOMER']),
  orderController.getCustomerOrders
);

// Tailor routes
router.get(
  '/tailor-orders',
  authenticate,
  requireRole(['TAILOR']),
  orderController.getTailorOrders
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole(['TAILOR']),
  validate(updateStatusSchema),
  orderController.updateOrderStatus
);

// Common route to view an order with full tracking details
router.get('/:id', authenticate, orderController.getOrderById);

export default router;

import prisma from '../config/db';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderDTO {
  tailorProfileId: string;
  serviceId: string;
  quantity: number;
  requestedDeliveryDate: string;
  instructions?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  note?: string;
}

export const WORKFLOW_STAGES: OrderStatus[] = [
  'ORDER_PLACED',
  'ACCEPTED',
  'MEASUREMENT',
  'CUTTING',
  'STITCHING',
  'FINISHING',
  'QUALITY_CHECK',
  'READY_FOR_PICKUP',
  'COMPLETED',
];

export class OrderService {
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FMT-${timestamp}-${random}`;
  }

  async createOrder(customerId: string, data: CreateOrderDTO) {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: { tailorProfile: true },
    });

    if (!service) {
      throw new Error('Selected stitching service not found');
    }

    if (service.tailorProfileId !== data.tailorProfileId) {
      throw new Error('Service does not belong to the selected tailor');
    }

    const quantity = Math.max(1, data.quantity || 1);
    const totalPrice = service.price * quantity;
    const orderNumber = this.generateOrderNumber();
    const deliveryDate = new Date(data.requestedDeliveryDate);

    if (isNaN(deliveryDate.getTime())) {
      throw new Error('Invalid requested delivery date');
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        tailorProfileId: data.tailorProfileId,
        serviceId: data.serviceId,
        quantity,
        totalPrice,
        requestedDeliveryDate: deliveryDate,
        instructions: data.instructions || '',
        status: 'ORDER_PLACED',
        statusHistory: {
          create: {
            status: 'ORDER_PLACED',
            note: 'Order successfully placed by customer',
            changedById: customerId,
          },
        },
      },
      include: {
        service: true,
        tailorProfile: true,
        statusHistory: {
          include: {
            changedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    return order;
  }

  async getCustomerOrders(customerId: string) {
    return await prisma.order.findMany({
      where: { customerId },
      include: {
        service: true,
        tailorProfile: {
          include: {
            user: {
              select: { name: true, phone: true, email: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTailorOrders(userId: string, filter?: 'incoming' | 'active' | 'completed' | 'all') {
    const tailorProfile = await prisma.tailorProfile.findUnique({
      where: { userId },
    });

    if (!tailorProfile) {
      throw new Error('Tailor profile not found');
    }

    let statusCondition: any = undefined;

    if (filter === 'incoming') {
      statusCondition = 'ORDER_PLACED';
    } else if (filter === 'active') {
      statusCondition = {
        in: [
          'ACCEPTED',
          'MEASUREMENT',
          'CUTTING',
          'STITCHING',
          'FINISHING',
          'QUALITY_CHECK',
          'READY_FOR_PICKUP',
        ],
      };
    } else if (filter === 'completed') {
      statusCondition = { in: ['COMPLETED', 'REJECTED'] };
    }

    return await prisma.order.findMany({
      where: {
        tailorProfileId: tailorProfile.id,
        ...(statusCondition && { status: statusCondition }),
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tailorProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Role check: customer must be owner of order; tailor must be owner of tailorProfile
    if (role === 'CUSTOMER' && order.customerId !== userId) {
      throw new Error('Unauthorized: You can only view your own orders');
    }

    if (role === 'TAILOR' && order.tailorProfile.userId !== userId) {
      throw new Error('Unauthorized: You can only view orders assigned to your shop');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    newStatus: OrderStatus,
    note?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { tailorProfile: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Strict validation: tailor must own the order
    if (order.tailorProfile.userId !== userId) {
      throw new Error('Unauthorized: You can only manage orders assigned to your shop');
    }

    const currentStatus = order.status;

    // Validate status transition
    this.validateStatusTransition(currentStatus, newStatus);

    // Update order status and record in history within a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newStatus,
          note: note || `Order transitioned from ${currentStatus} to ${newStatus}`,
          changedById: userId,
        },
      });

      return updated;
    });

    return await this.getOrderById(orderId, userId, 'TAILOR');
  }

  private validateStatusTransition(current: OrderStatus, target: OrderStatus): void {
    if (current === target) {
      throw new Error(`Order is already in ${current} status`);
    }

    if (current === 'COMPLETED' || current === 'REJECTED') {
      throw new Error(`Order is ${current} and cannot be modified further`);
    }

    // From ORDER_PLACED: Can only go to ACCEPTED or REJECTED
    if (current === 'ORDER_PLACED') {
      if (target !== 'ACCEPTED' && target !== 'REJECTED') {
        throw new Error(`From ORDER_PLACED, order can only be transitioned to ACCEPTED or REJECTED`);
      }
      return;
    }

    // Cannot transition to REJECTED once accepted and work has started
    if (target === 'REJECTED') {
      throw new Error(`Order cannot be rejected after it has already been accepted and started`);
    }

    // Check pipeline progression
    const currentIndex = WORKFLOW_STAGES.indexOf(current);
    const targetIndex = WORKFLOW_STAGES.indexOf(target);

    if (currentIndex === -1 || targetIndex === -1) {
      throw new Error(`Invalid status specified: ${target}`);
    }

    if (targetIndex <= currentIndex) {
      throw new Error(`Cannot transition backwards from ${current} to ${target}`);
    }
  }
}

export default new OrderService();

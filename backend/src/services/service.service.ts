import prisma from '../config/db';

export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  estimatedDays?: number;
}

export class ServiceService {
  async getTailorServices(tailorProfileId: string) {
    return await prisma.service.findMany({
      where: { tailorProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        tailorProfile: {
          include: {
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    return service;
  }

  async createService(userId: string, data: CreateServiceDTO) {
    const tailorProfile = await prisma.tailorProfile.findUnique({
      where: { userId },
    });

    if (!tailorProfile) {
      throw new Error('Tailor profile not found. Please set up your profile first.');
    }

    return await prisma.service.create({
      data: {
        tailorProfileId: tailorProfile.id,
        name: data.name,
        description: data.description,
        price: data.price,
        estimatedDays: data.estimatedDays,
      },
    });
  }

  async updateService(userId: string, serviceId: string, data: UpdateServiceDTO) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { tailorProfile: true },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (service.tailorProfile.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own services');
    }

    return await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.estimatedDays !== undefined && { estimatedDays: data.estimatedDays }),
      },
    });
  }

  async deleteService(userId: string, serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { tailorProfile: true },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (service.tailorProfile.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own services');
    }

    // Check if there are active orders for this service
    const activeOrders = await prisma.order.count({
      where: {
        serviceId,
        status: {
          notIn: ['COMPLETED', 'REJECTED'],
        },
      },
    });

    if (activeOrders > 0) {
      throw new Error(
        `Cannot delete service because it currently has ${activeOrders} active order(s).`
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return { message: 'Service deleted successfully' };
  }
}

export default new ServiceService();

import prisma from '../config/db';

export interface UpdateTailorProfileDTO {
  shopName?: string;
  ownerName?: string;
  address?: string;
  contactPhone?: string;
  workingHours?: string;
  bio?: string;
}

export class TailorService {
  async getAllTailors(search?: string, serviceName?: string) {
    const whereClause: any = {};

    if (search && search.trim() !== '') {
      const query = search.trim();
      whereClause.OR = [
        { shopName: { contains: query, mode: 'insensitive' } },
        { ownerName: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        {
          services: {
            some: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (serviceName && serviceName.trim() !== '') {
      const sQuery = serviceName.trim();
      if (!whereClause.services) {
        whereClause.services = {
          some: {
            name: { contains: sQuery, mode: 'insensitive' },
          },
        };
      }
    }

    const tailors = await prisma.tailorProfile.findMany({
      where: whereClause,
      include: {
        services: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        shopName: 'asc',
      },
    });

    return tailors;
  }

  async getTailorById(id: string) {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!tailor) {
      throw new Error('Tailor not found');
    }

    return tailor;
  }

  async getProfileByUserId(userId: string) {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId },
      include: {
        services: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!tailor) {
      throw new Error('Tailor profile not found for this user');
    }

    return tailor;
  }

  async updateProfile(userId: string, data: UpdateTailorProfileDTO) {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId },
    });

    if (!tailor) {
      // Create if it doesn't exist
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      return await prisma.tailorProfile.create({
        data: {
          userId,
          shopName: data.shopName || `${user.name}'s Shop`,
          ownerName: data.ownerName || user.name,
          address: data.address || '',
          contactPhone: data.contactPhone || user.phone || '',
          workingHours: data.workingHours || 'Mon-Sat: 9AM - 8PM',
          bio: data.bio || '',
        },
        include: { services: true },
      });
    }

    const updated = await prisma.tailorProfile.update({
      where: { userId },
      data: {
        ...(data.shopName !== undefined && { shopName: data.shopName }),
        ...(data.ownerName !== undefined && { ownerName: data.ownerName }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.workingHours !== undefined && { workingHours: data.workingHours }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
      include: {
        services: true,
      },
    });

    return updated;
  }
}

export default new TailorService();

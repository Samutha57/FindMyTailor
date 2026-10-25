import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { signToken } from '../config/jwt';
import { Role } from '@prisma/client';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'TAILOR';
  // Optional initial shop details for tailors
  shopName?: string;
  address?: string;
  contactPhone?: string;
  workingHours?: string;
  bio?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        phone: data.phone || null,
        role: data.role as Role,
        ...(data.role === 'TAILOR'
          ? {
              tailorProfile: {
                create: {
                  shopName: data.shopName || `${data.name}'s Tailoring Studio`,
                  ownerName: data.name,
                  address: data.address || 'Address pending update',
                  contactPhone: data.contactPhone || data.phone || 'Contact pending update',
                  workingHours: data.workingHours || 'Mon - Sat: 9:00 AM - 8:00 PM',
                  bio: data.bio || 'Professional custom tailoring & alterations',
                },
              },
            }
          : {}),
      },
      include: {
        tailorProfile: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tailorProfileId: user.tailorProfile?.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tailorProfile: user.tailorProfile,
      },
      token,
    };
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { tailorProfile: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tailorProfileId: user.tailorProfile?.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tailorProfile: user.tailorProfile,
      },
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        tailorProfile: {
          include: {
            services: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();

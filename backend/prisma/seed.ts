import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.tailorProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: defaultPassword,
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'arun@example.com',
      password: defaultPassword,
      name: 'Arun Patel',
      phone: '+91 91234 56789',
      role: Role.CUSTOMER,
    },
  });

  // 2. Create Tailors with Profiles & Services
  const tailorUser1 = await prisma.user.create({
    data: {
      email: 'royal.tailors@example.com',
      password: defaultPassword,
      name: 'Master Rajesh Kumar',
      phone: '+91 98450 11223',
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          shopName: 'Royal Heritage Bespoke Tailors',
          ownerName: 'Master Rajesh Kumar',
          address: '42 Gandhi Road, Commercial Street, Central District',
          contactPhone: '+91 98450 11223',
          workingHours: 'Mon - Sat: 9:30 AM - 8:30 PM',
          bio: 'Specializing in fine bespoke men and women ethnic and formal wear since 1995. Handcrafted perfection with precise fitting.',
          services: {
            create: [
              {
                name: 'Shirt Stitching',
                description: 'Formal & Casual custom fit shirts with choice of collar, cuffs, and premium finish.',
                price: 450,
                estimatedDays: 3,
              },
              {
                name: 'Pant Stitching',
                description: 'Tailored trousers & chinos with custom waistband, pleats, and durability stitching.',
                price: 550,
                estimatedDays: 4,
              },
              {
                name: 'Suit 2-Piece Tailoring',
                description: 'Bespoke blazer and matching trousers with imported canvas lining and hand-finished lapels.',
                price: 3500,
                estimatedDays: 10,
              },
              {
                name: 'Alterations & Fitting',
                description: 'Quick alterations, waist adjustment, shoulder tapering, and sleeve adjustments.',
                price: 150,
                estimatedDays: 1,
              },
            ],
          },
        },
      },
    },
    include: {
      tailorProfile: {
        include: { services: true },
      },
    },
  });

  const tailorUser2 = await prisma.user.create({
    data: {
      email: 'silkstitch@example.com',
      password: defaultPassword,
      name: 'Meera Nambiar',
      phone: '+91 98860 33445',
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          shopName: 'Silk & Needle Boutique Tailoring',
          ownerName: 'Meera Nambiar',
          address: '18 Lotus Enclave, 100ft Road, Fashion District',
          contactPhone: '+91 98860 33445',
          workingHours: 'Tue - Sun: 10:00 AM - 8:00 PM',
          bio: 'Designer blouse stitching, bridal lehenga fitting, designer churidars, and delicate silk embroidery work.',
          services: {
            create: [
              {
                name: 'Designer Blouse Stitching',
                description: 'Princess cut, padded, boat neck, and dori designs with intricate piping finish.',
                price: 650,
                estimatedDays: 4,
              },
              {
                name: 'Churidar / Salwar Kameez Stitching',
                description: 'Custom tailored ethnic suit with high-grade lining and decorative piping details.',
                price: 750,
                estimatedDays: 5,
              },
              {
                name: 'Anarkali Gown Tailoring',
                description: 'Flared floor-length anarkali suit with inner can-can and custom necklines.',
                price: 1800,
                estimatedDays: 7,
              },
              {
                name: 'Blouse Alteration & Resizing',
                description: 'Express margin expansion, sleeve readjustment, and shoulder tightening.',
                price: 200,
                estimatedDays: 1,
              },
            ],
          },
        },
      },
    },
    include: {
      tailorProfile: {
        include: { services: true },
      },
    },
  });

  const tailorUser3 = await prisma.user.create({
    data: {
      email: 'urbanfit@example.com',
      password: defaultPassword,
      name: 'Suresh Verma',
      phone: '+91 97412 88990',
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          shopName: 'UrbanFit Modern Tailors',
          ownerName: 'Suresh Verma',
          address: '7 Metro Plaza, Sector 14, Near Tech Park',
          contactPhone: '+91 97412 88990',
          workingHours: 'Mon - Sat: 10:00 AM - 9:00 PM',
          bio: 'Express tailoring, modern slim-fit apparel, and precision alteration studio for working professionals.',
          services: {
            create: [
              {
                name: 'Shirt Stitching (Slim Fit)',
                description: 'Modern slim fit cotton shirts with reinforced seams and buttonholes.',
                price: 500,
                estimatedDays: 2,
              },
              {
                name: 'Formal Trouser Stitching',
                description: 'Flat front slim comfort stretch formal trousers.',
                price: 600,
                estimatedDays: 3,
              },
              {
                name: 'Jeans & Trouser Alteration',
                description: 'Original hem reattachment, length trimming, and waist adjustment.',
                price: 180,
                estimatedDays: 1,
              },
            ],
          },
        },
      },
    },
    include: {
      tailorProfile: {
        include: { services: true },
      },
    },
  });

  // 3. Create Sample Orders with Status History
  const royalProfile = tailorUser1.tailorProfile!;
  const shirtService = royalProfile.services.find((s) => s.name === 'Shirt Stitching')!;
  const pantService = royalProfile.services.find((s) => s.name === 'Pant Stitching')!;

  const silkProfile = tailorUser2.tailorProfile!;
  const blouseService = silkProfile.services.find((s) => s.name === 'Designer Blouse Stitching')!;

  // Order 1: Incoming order (ORDER_PLACED)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'FMT-261025-1001',
      customerId: customer1.id,
      tailorProfileId: royalProfile.id,
      serviceId: shirtService.id,
      quantity: 2,
      totalPrice: shirtService.price * 2,
      requestedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      instructions: 'Mandarin collar on one shirt, cutaway collar on the second. Slim fit with pocket on left.',
      status: OrderStatus.ORDER_PLACED,
      statusHistory: {
        create: [
          {
            status: OrderStatus.ORDER_PLACED,
            note: 'Order placed by customer Priya Sharma',
            changedById: customer1.id,
          },
        ],
      },
    },
  });

  // Order 2: In-Progress Active order (STITCHING)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'FMT-261025-1002',
      customerId: customer1.id,
      tailorProfileId: royalProfile.id,
      serviceId: pantService.id,
      quantity: 1,
      totalPrice: pantService.price,
      requestedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      instructions: 'Charcoal grey fabric provided. Flat front, no cuffs, 32 inch inseam.',
      status: OrderStatus.STITCHING,
      statusHistory: {
        create: [
          {
            status: OrderStatus.ORDER_PLACED,
            note: 'Order placed by customer',
            changedById: customer1.id,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.ACCEPTED,
            note: 'Order accepted by tailor Master Rajesh Kumar',
            changedById: tailorUser1.id,
            createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.MEASUREMENT,
            note: 'Customer measurements recorded and pattern prepared',
            changedById: tailorUser1.id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.CUTTING,
            note: 'Fabric cut according to specifications',
            changedById: tailorUser1.id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.STITCHING,
            note: 'Main assembly and inner lining stitching in progress',
            changedById: tailorUser1.id,
            createdAt: new Date(),
          },
        ],
      },
    },
  });

  // Order 3: Completed order
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'FMT-261025-1003',
      customerId: customer2.id,
      tailorProfileId: silkProfile.id,
      serviceId: blouseService.id,
      quantity: 1,
      totalPrice: blouseService.price,
      requestedDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      instructions: 'Deep boat neck, gold piping along borders, padded cups.',
      status: OrderStatus.COMPLETED,
      statusHistory: {
        create: [
          {
            status: OrderStatus.ORDER_PLACED,
            note: 'Order placed',
            changedById: customer2.id,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.ACCEPTED,
            note: 'Order accepted by Meera Nambiar',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.MEASUREMENT,
            note: 'Measurements verified',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.CUTTING,
            note: 'Raw silk cut to size',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.STITCHING,
            note: 'Stitching completed',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.FINISHING,
            note: 'Latkan and hooks attached',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.QUALITY_CHECK,
            note: 'Inspected for seam strength and finish',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.READY_FOR_PICKUP,
            note: 'Ready for customer pickup at store',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.COMPLETED,
            note: 'Picked up by customer. Order completed successfully.',
            changedById: tailorUser2.id,
            createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully:');
  console.log(`- Created 2 customers: Priya Sharma (${customer1.email}), Arun Patel (${customer2.email})`);
  console.log(`- Created 3 tailors with services: Royal Heritage, Silk & Needle, UrbanFit`);
  console.log(`- Created 3 sample orders demonstrating ORDER_PLACED, STITCHING, and COMPLETED states`);
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

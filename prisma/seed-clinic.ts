import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { hashPassword } from 'better-auth/crypto';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Creating clinic account with STARTER plan...');

  const hashedPassword = await hashPassword('password123');
  const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Create Clinic Organization with STARTER plan
    const clinicId = generateId('org');
    const clinicLocationId = generateId('loc');

    await prisma.organization.create({
      data: {
        id: clinicId,
        name: 'Community Health Clinic',
        type: 'CLINIC',
        subscription: {
          create: {
            planTier: 'STARTER',
            status: 'ACTIVE',
            billingCycle: 'MONTHLY',
            maxDoctors: 5,
            maxAppointmentsPerMonth: 200,
            features: ['Up to 5 doctors', '200 appointments/month', 'Basic analytics', 'Email support', '1 location'],
          },
        },
      },
    });

    const clinicAdminId = generateId('user');
    await prisma.user.create({
      data: {
        id: clinicAdminId,
        email: 'clinic.starter@unihealth.com',
        name: 'Clinic Administrator',
        password: hashedPassword,
        role: 'ORG_ADMIN',
        emailVerified: true,
        phoneNumber: '+1234567892',
        organizationId: clinicId,
        accounts: {
          create: [{
            accountId: clinicAdminId,
            providerId: 'credential',
            password: hashedPassword,
          }]
        }
      },
    });

    await prisma.location.create({
      data: {
        id: clinicLocationId,
        name: 'Main Clinic',
        address: '123 Health Street',
        city: 'Wellness City',
        state: 'HC',
        country: 'USA',
        phone: '+1-555-0123',
        isActive: true,
        organizationId: clinicId,
      },
    });

    console.log('✅ Created Clinic Admin: clinic.starter@unihealth.com');
    console.log('📧 Email: clinic.starter@unihealth.com');
    console.log('🔑 Password: password123');
    console.log('🏥 Organization: Community Health Clinic');
    console.log('📊 Plan: STARTER (5 doctors, 200 appointments/month)');
  } catch (error) {
    console.error('❌ Error creating clinic account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

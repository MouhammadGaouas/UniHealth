import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcrypt'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const password = await bcrypt.hash('password123', 10)

    const doctors = [
        {
            email: 'dr.smith@unihealth.com',
            name: 'Dr. Sarah Smith',
            specialty: 'Psychologist',
            bio: 'Specialist in student anxiety and stress management.',
        },
        {
            email: 'dr.jones@unihealth.com',
            name: 'Dr. Michael Jones',
            specialty: 'General Practitioner',
            bio: 'General health and urgent care services.',
        },
        {
            email: 'dr.lee@unihealth.com',
            name: 'Dr. Emily Lee',
            specialty: 'Dermatologist',
            bio: 'Expert in skin care and acne treatment for young adults.',
        },
        {
            email: 'dr.patel@unihealth.com',
            name: 'Dr. Raj Patel',
            specialty: 'Nutritionist',
            bio: 'Helping students maintain a healthy diet and lifestyle.',
        },
        {
            email: 'dr.garcia@unihealth.com',
            name: 'Dr. Elena Garcia',
            specialty: 'Sports Medicine',
            bio: 'Focus on sports injuries and physical therapy.',
        }
    ]

    console.log('Seeding doctors...')

    for (const doc of doctors) {
        const user = await prisma.user.upsert({
            where: { email: doc.email },
            update: {},
            create: {
                email: doc.email,
                name: doc.name,
                password,
                role: 'DOCTOR',
                doctorProfile: {
                    create: {
                        specialty: doc.specialty,
                        bio: doc.bio,
                        available: true,
                    },
                },
            },
        })
        console.log(`Created/Updated: ${user.name}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

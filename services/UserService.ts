import { prisma } from '@/lib/prisma';
import { updateUserProfileSchema } from '@/lib/schemas';
import { z } from 'zod';

export class UserService {
    /**
     * Updates an authenticated user's profile
     */
    async updateProfile(userId: string, data: z.infer<typeof updateUserProfileSchema>) {
        const validData = updateUserProfileSchema.parse(data);

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const updateData: any = {};
        if (validData.name !== undefined) updateData.name = validData.name;
        if (validData.phoneNumber !== undefined) updateData.phoneNumber = validData.phoneNumber;
        if (validData.gender !== undefined) updateData.gender = validData.gender;
        if (validData.birthday !== undefined) {
            updateData.birthday = validData.birthday ? new Date(validData.birthday) : null;
        }

        return prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true, name: true, email: true, role: true,
                phoneNumber: true, gender: true, birthday: true
            }
        });
    }

    /**
     * Fetches consultation notes relevant to the user (either authored by them if doctor, or about them if patient)
     */
    async getConsultations(userId: string, role: string) {
        if (role === 'DOCTOR') {
            const doctor = await prisma.doctor.findUnique({
                where: { userId },
                select: { id: true }
            });

            if (!doctor) throw new Error("Doctor profile not found");

            return prisma.consultationNote.findMany({
                where: { doctorId: doctor.id },
                include: {
                    patient: { select: { name: true, email: true } },
                    appointment: { select: { dateTime: true, status: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        }

        // Default to patient view
        return prisma.consultationNote.findMany({
            where: { patientId: userId },
            include: {
                doctor: { include: { user: { select: { name: true } } } },
                appointment: { select: { dateTime: true, status: true } }
            },
            orderBy: { createdAt: "desc" }
        });
    }
}

export const userService = new UserService();

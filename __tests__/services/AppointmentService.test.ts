import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from '../setup';
import { appointmentService } from '../../services/AppointmentService';
import { notificationService } from '../../lib/notifications';
import { addMinutes, subMinutes } from 'date-fns';

// Mocks
vi.mock('../../lib/notifications', () => ({
    notificationService: {
        sendAppointmentConfirmation: vi.fn().mockResolvedValue(true),
        sendAppointmentCancellation: vi.fn().mockResolvedValue(true),
    }
}));

vi.mock('../../lib/subscription-limits', () => ({
    enforceAppointmentLimit: vi.fn(),
}));

describe('AppointmentService', () => {

    const mockDoctorId = '11111111-1111-1111-1111-111111111111';
    const mockPatientId = '22222222-2222-4222-8222-222222222222';
    const mockOrgId = '33333333-3333-4333-8333-333333333333';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createAppointment', () => {

        it('1. should throw error if date is in the past', async () => {
            const pastDate = subMinutes(new Date(), 10).toISOString();
            await expect(appointmentService.createAppointment(mockPatientId, {
                doctorId: mockDoctorId, dateTime: pastDate
            })).rejects.toThrow("Appointment must be in the future");
        });

        it('2. should throw error if doctor is not found', async () => {
            const futureDate = addMinutes(new Date(), 60).toISOString();
            prismaMock.doctor.findUnique.mockResolvedValue(null);

            await expect(appointmentService.createAppointment(mockPatientId, {
                doctorId: mockDoctorId, dateTime: futureDate
            })).rejects.toThrow("Doctor not found");
        });

        it('3. should throw error if doctor is not available', async () => {
            const futureDate = addMinutes(new Date(), 60).toISOString();
            prismaMock.doctor.findUnique.mockResolvedValue({
                id: mockDoctorId, organizationId: mockOrgId, available: false
            } as any);

            await expect(appointmentService.createAppointment(mockPatientId, {
                doctorId: mockDoctorId, dateTime: futureDate
            })).rejects.toThrow("Doctor is not currently available");
        });

        it('4. should throw error on time slot conflict (overlap logic)', async () => {
            const futureDate = addMinutes(new Date(), 60).toISOString();

            prismaMock.doctor.findUnique.mockResolvedValue({
                id: mockDoctorId, organizationId: mockOrgId, available: true
            } as any);

            // Mock an existing conflicting appointment
            prismaMock.appointment.findFirst.mockResolvedValue({ id: 'conflict-1' } as any);

            await expect(appointmentService.createAppointment(mockPatientId, {
                doctorId: mockDoctorId, dateTime: futureDate
            })).rejects.toThrow("Time slot conflicts with an existing appointment");

            expect(prismaMock.appointment.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: { in: ["PENDING", "CONFIRMED"] },
                        doctorId: mockDoctorId
                    })
                })
            );
        });

        it('5. should successfully create appointment and trigger async notification', async () => {
            const futureDate = addMinutes(new Date(), 60).toISOString();

            prismaMock.doctor.findUnique.mockResolvedValue({
                id: mockDoctorId, organizationId: mockOrgId, available: true
            } as any);

            prismaMock.appointment.findFirst.mockResolvedValue(null); // No conflict

            const mockCreatedApt = {
                id: 'apt-123',
                dateTime: new Date(futureDate),
                patient: { name: 'John Doe', email: 'john@test.com' },
                doctor: { user: { name: 'Dr. Smith' } }
            };

            prismaMock.appointment.create.mockResolvedValue(mockCreatedApt as any);

            const result = await appointmentService.createAppointment(mockPatientId, {
                doctorId: mockDoctorId, dateTime: futureDate
            });

            expect(result).toBeDefined();
            expect(prismaMock.appointment.create).toHaveBeenCalled();
            expect(notificationService.sendAppointmentConfirmation).toHaveBeenCalled();
        });
    });

    describe('updateStatus', () => {

        it('6. should allow PATIENT to CANCEL their own appointment', async () => {
            prismaMock.appointment.findUnique.mockResolvedValue({
                id: '11111111-1111-1111-9211-111111111111', patientId: mockPatientId, doctor: { userId: '11111111-1111-1111-1211-111111111111' }, status: 'PENDING'
            } as any);

            prismaMock.appointment.update.mockResolvedValue({ id: '11111111-1111-1111-9211-111111111111', dateTime: new Date() } as any);

            await expect(appointmentService.updateStatus(mockPatientId, 'PATIENT', '11111111-1111-1111-9211-111111111111', { status: 'CANCELLED' }))
                .resolves.toBeDefined();
        });

        it('7. should FORBID PATIENT from confirming an appointment', async () => {
            prismaMock.appointment.findUnique.mockResolvedValue({
                id: '11111111-1111-1111-9211-111111111111', patientId: mockPatientId, doctor: { userId: '11111111-1111-1111-1211-111111111111' }, status: 'PENDING'
            } as any);

            await expect(appointmentService.updateStatus(mockPatientId, 'PATIENT', '11111111-1111-1111-9211-111111111111', { status: 'CONFIRMED' }))
                .rejects.toThrow("Forbidden: Patients can only cancel appointments");
        });

        it('8. should FORBID DOCTOR from updating someone elses appointment', async () => {
            prismaMock.appointment.findUnique.mockResolvedValue({
                id: '11111111-1111-1111-9211-111111111111', patientId: mockPatientId, doctor: { userId: '11111111-1111-1111-9211-111111111112' }, status: 'PENDING'
            } as any);

            await expect(appointmentService.updateStatus('11111111-1111-1111-9211-111111111113', 'DOCTOR', '11111111-1111-1111-9211-111111111111', { status: 'CONFIRMED' }))
                .rejects.toThrow("Forbidden: Appointment not found for this doctor");
        });

        it('9. should trigger cancellation notification if status is changed to CANCELLED with reason', async () => {
            prismaMock.appointment.findUnique.mockResolvedValue({
                id: '11111111-1111-1111-9211-111111111111', patientId: mockPatientId, doctor: { userId: '11111111-1111-1111-1211-111111111111' }, status: 'PENDING'
            } as any);

            prismaMock.appointment.update.mockResolvedValue({
                id: '11111111-1111-1111-9211-111111111111', dateTime: new Date(), status: 'CANCELLED'
            } as any);

            await appointmentService.updateStatus(mockPatientId, 'PATIENT', '11111111-1111-1111-9211-111111111111', { status: 'CANCELLED', reason: 'Sick' });

            expect(notificationService.sendAppointmentCancellation).toHaveBeenCalledWith(
                expect.any(Object),
                'Sick'
            );
        });

        it('10. should allow ORG_ADMIN to manage appointments within their org', async () => {
            prismaMock.appointment.findUnique.mockResolvedValue({
                id: '11111111-1111-1111-9211-111111111111',
                patientId: mockPatientId,
                doctor: { userId: '11111111-1111-1111-1211-111111111111', organizationId: mockOrgId },
                status: 'PENDING'
            } as any);

            prismaMock.user.findUnique.mockResolvedValue({
                organizationId: mockOrgId
            } as any);

            prismaMock.appointment.update.mockResolvedValue({ id: '11111111-1111-1111-9211-111111111111' } as any);

            await expect(appointmentService.updateStatus('11111111-1111-1111-9211-111111111114', 'ORG_ADMIN', '11111111-1111-1111-9211-111111111111', { status: 'CONFIRMED' }))
                .resolves.toBeDefined();
        });
    });
});

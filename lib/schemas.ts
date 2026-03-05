import { z } from 'zod';

// Shared Schemas
export const paginationSchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const idSchema = z.string().uuid("Invalid UUID format");

// ---------------------------------------------------------------------------
// DOCTOR SCHEMAS
// ---------------------------------------------------------------------------

export const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const updateDoctorSettingsSchema = z.object({
    startTime: z.string().regex(timeFormatRegex, "Invalid startTime format. Use HH:MM").optional(),
    endTime: z.string().regex(timeFormatRegex, "Invalid endTime format. Use HH:MM").optional(),
    specialty: z.string().min(2).max(100).optional(),
    bio: z.string().max(1000).optional(),
    available: z.boolean().optional(),
    locationId: idSchema.optional().nullable(),
}).refine(data => {
    if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
}).refine(data => Object.keys(data).length > 0, {
    message: "No fields to update provided",
});

export const addDoctorLocationSchema = z.object({
    locationId: idSchema,
});

export const getDoctorAvailabilityQuerySchema = z.object({
    doctorId: idSchema,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
});

// ---------------------------------------------------------------------------
// APPOINTMENT SCHEMAS
// ---------------------------------------------------------------------------

export const createAppointmentSchema = z.object({
    doctorId: idSchema,
    dateTime: z.string().datetime({ message: "Invalid ISO 8601 datetime" }),
    appointmentTypeId: idSchema.optional().nullable(),
    reason: z.string().max(500).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
}).refine(data => {
    const aptDate = new Date(data.dateTime);
    return aptDate > new Date();
}, {
    message: "Appointment must be in the future",
    path: ["dateTime"],
});

export const appointmentHistoryQuerySchema = z.object({
    status: z.enum(['COMPLETED', 'CANCELLED']).optional().nullable(),
});

export const updateAppointmentStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
    reason: z.string().max(500).optional(),
});

export const createConsultationNoteSchema = z.object({
    title: z.string().min(2, "Title is required").max(100),
    content: z.string().min(10, "Note must be at least 10 characters long").max(5000),
    category: z.enum(['GENERAL', 'PRESCRIPTION', 'FOLLOW_UP', 'DIAGNOSIS']).default('GENERAL'),
});

// ---------------------------------------------------------------------------
// ORGANIZATION SCHEMAS
// ---------------------------------------------------------------------------

export const createOrganizationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    type: z.enum(['HOSPITAL', 'CLINIC', 'LABORATORY', 'PHARMACY', 'OTHER']),
});

export const addOrganizationLocationSchema = z.object({
    name: z.string().min(2).max(100),
    address: z.string().min(5).max(255),
    phone: z.string().min(5).max(20).optional().nullable(),
    email: z.string().email().optional().nullable(),
});

export const addOrganizationDoctorSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    specialty: z.string().min(2).max(100),
});

export const assignResourceSchema = z.object({
    doctorId: idSchema,
    locationId: idSchema,
});

// ---------------------------------------------------------------------------
// ADMIN SCHEMAS
// ---------------------------------------------------------------------------

export const adminMakeDoctorSchema = z.object({
    userId: idSchema,
    specialty: z.string().min(2).max(100),
});

export const adminUsersQuerySchema = z.object({
    role: z.enum(['PATIENT', 'DOCTOR', 'ORG_ADMIN', 'ADMIN']).optional(),
    search: z.string().optional(),
});

export const adminUserActionSchema = z.object({
    action: z.enum(['ban', 'unban']),
    reason: z.string().max(500).optional(),
});

export const adminOrganizationsQuerySchema = z.object({
    type: z.enum(['HOSPITAL', 'CLINIC', 'LABORATORY', 'PHARMACY', 'OTHER']).optional(),
    search: z.string().optional(),
});

export const bulkNotificationSchema = z.object({
    hoursBefore: z.coerce.number().min(1).max(168).default(24),
});

// ---------------------------------------------------------------------------
// USER SCHEMAS
// ---------------------------------------------------------------------------

export const updateUserProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phoneNumber: z.string().max(20).optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
    birthday: z.string().datetime().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
    message: "No fields to update provided",
});

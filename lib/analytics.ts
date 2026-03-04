import { prisma } from "./prisma";

export interface OrganizationMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowRate: number;
  averageAppointmentsPerDay: number;
  doctorUtilizationRate: number;
  patientSatisfactionScore: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;
  newPatientsThisMonth: number;
  returningPatients: number;
  topDoctors: Array<{
    id: string;
    name: string;
    appointmentsCount: number;
    revenue: number;
  }>;
  appointmentsByStatus: Record<string, number>;
  appointmentsByType: Array<{
    name: string;
    count: number;
  }>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
}

export interface PlatformMetrics {
  totalOrganizations: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  appointmentsGrowth: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  organizationsByType: Record<string, number>;
  doctorsBySpecialty: Array<{
    specialty: string;
    count: number;
  }>;
}

export async function getOrganizationMetrics(organizationId: string): Promise<OrganizationMetrics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = startOfMonth;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShows,
    doctors,
    appointmentsByStatus,
    appointmentsByType,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        doctor: { organizationId }
      }
    }),
    prisma.appointment.count({
      where: {
        doctor: { organizationId },
        status: 'COMPLETED'
      }
    }),
    prisma.appointment.count({
      where: {
        doctor: { organizationId },
        status: 'CANCELLED'
      }
    }),
    prisma.appointment.count({
      where: {
        doctor: { organizationId },
        status: 'CANCELLED',
        notes: { contains: 'no-show', mode: 'insensitive' }
      }
    }),
    prisma.doctor.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { appointments: true }
        },
        appointments: {
          where: { status: 'COMPLETED' },
          select: { id: true }
        },
        user: { select: { name: true } }
      }
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      where: { doctor: { organizationId } },
      _count: true
    }),
    prisma.appointmentType.findMany({
      where: { doctor: { organizationId } },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    })
  ]);

  // Calculate no-show rate
  const noShowRate = totalAppointments > 0 
    ? (noShows / totalAppointments) * 100 
    : 0;

  // Calculate average appointments per day (last 30 days)
  const appointmentsLast30Days = await prisma.appointment.count({
    where: {
      doctor: { organizationId },
      dateTime: { gte: thirtyDaysAgo }
    }
  });
  const averageAppointmentsPerDay = appointmentsLast30Days / 30;

  // Calculate doctor utilization rate
  const totalDoctorCapacity = doctors.length * 8 * 30; // 8 hours/day * 30 days
  const totalBookedHours = doctors.reduce((sum, doc) => sum + doc._count.appointments * 0.5, 0); // avg 30 min per appointment
  const doctorUtilizationRate = totalDoctorCapacity > 0 
    ? (totalBookedHours / totalDoctorCapacity) * 100 
    : 0;

  // Get top doctors
  const topDoctors = doctors
    .map(doc => ({
      id: doc.id,
      name: doc.user.name || 'Unknown',
      appointmentsCount: doc._count.appointments,
      revenue: doc._count.appointments * 50 // Placeholder revenue calculation
    }))
    .sort((a, b) => b.appointmentsCount - a.appointmentsCount)
    .slice(0, 5);

  // Format appointments by status
  const appointmentsByStatusMap: Record<string, number> = {};
  appointmentsByStatus.forEach(item => {
    appointmentsByStatusMap[item.status] = item._count;
  });

  // Format appointments by type
  const appointmentsByTypeFormatted = appointmentsByType.map(item => ({
    name: item.name,
    count: item._count.appointments
  }));

  // Calculate peak hours (last 30 days)
  const recentAppointments = await prisma.appointment.findMany({
    where: {
      doctor: { organizationId },
      dateTime: { gte: thirtyDaysAgo }
    },
    select: { dateTime: true }
  });

  const hourCounts: Record<number, number> = {};
  recentAppointments.forEach(apt => {
    const hour = apt.dateTime.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Revenue calculations (placeholder - would need actual payment data)
  const revenueThisMonth = completedAppointments * 75; // $75 avg per appointment
  const revenueLastMonth = revenueThisMonth * 0.9; // Placeholder
  const revenueGrowth = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

  // Patient calculations
  const uniquePatientsThisMonth = await prisma.appointment.findMany({
    where: {
      doctor: { organizationId },
      dateTime: { gte: startOfMonth }
    },
    distinct: ['patientId'],
    select: { patientId: true }
  });

  const newPatientsThisMonth = uniquePatientsThisMonth.length;
  const returningPatients = totalAppointments - newPatientsThisMonth;

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowRate: Math.round(noShowRate * 100) / 100,
    averageAppointmentsPerDay: Math.round(averageAppointmentsPerDay * 100) / 100,
    doctorUtilizationRate: Math.round(doctorUtilizationRate * 100) / 100,
    patientSatisfactionScore: 4.5, // Would come from actual ratings
    revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
    revenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    newPatientsThisMonth,
    returningPatients,
    topDoctors,
    appointmentsByStatus: appointmentsByStatusMap,
    appointmentsByType: appointmentsByTypeFormatted,
    peakHours
  };
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalOrganizations,
    totalDoctors,
    totalPatients,
    totalAppointments,
    appointmentsThisMonth,
    appointmentsLastMonth,
    activeSubscriptions,
    organizationsByType,
    doctorsBySpecialty,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { dateTime: { gte: startOfMonth } } }),
    prisma.appointment.count({ 
      where: { 
        dateTime: { gte: startOfLastMonth, lt: startOfMonth } 
      } 
    }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.organization.groupBy({
      by: ['type'],
      _count: true
    }),
    prisma.doctor.groupBy({
      by: ['specialty'],
      _count: true
    })
  ]);

  const appointmentsGrowth = appointmentsLastMonth > 0
    ? ((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth) * 100
    : 0;

  const revenueThisMonth = appointmentsThisMonth * 75; // $75 avg per appointment

  // Format organizations by type
  const orgsByTypeMap: Record<string, number> = {};
  organizationsByType.forEach(item => {
    orgsByTypeMap[item.type] = item._count;
  });

  // Format doctors by specialty
  const doctorsBySpecialtyFormatted = doctorsBySpecialty.map(item => ({
    specialty: item.specialty,
    count: item._count
  }));

  return {
    totalOrganizations,
    totalDoctors,
    totalPatients,
    totalAppointments,
    appointmentsThisMonth,
    appointmentsGrowth: Math.round(appointmentsGrowth * 100) / 100,
    revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
    activeSubscriptions,
    organizationsByType: orgsByTypeMap,
    doctorsBySpecialty: doctorsBySpecialtyFormatted
  };
}

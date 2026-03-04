import { prisma } from "./prisma";
import { getPlan } from "./subscription";

export interface SubscriptionLimitCheck {
  canAddDoctor: boolean;
  canAddAppointment: boolean;
  canAddLocation: boolean;
  currentDoctors: number;
  currentAppointmentsThisMonth: number;
  currentLocations: number;
  maxDoctors: number;
  maxAppointmentsPerMonth: number;
  maxLocations: number;
  planTier: string;
}

export async function checkSubscriptionLimits(
  organizationId: string
): Promise<SubscriptionLimitCheck> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId }
  });

  if (!subscription) {
    throw new Error("No subscription found for organization");
  }

  const plan = getPlan(subscription.planTier);
  if (!plan) {
    throw new Error("Invalid plan tier");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [doctorCount, appointmentCount, locationCount] = await Promise.all([
    prisma.doctor.count({
      where: { organizationId }
    }),
    prisma.appointment.count({
      where: {
        doctor: { organizationId },
        dateTime: { gte: startOfMonth }
      }
    }),
    prisma.location.count({
      where: { 
        organizationId,
        isActive: true 
      }
    })
  ]);

  // Max locations based on plan
  const maxLocationsMap: Record<string, number> = {
    STARTER: 1,
    PROFESSIONAL: 5,
    ENTERPRISE: 100,
    UNLIMITED: 10000
  };
  const maxLocations = maxLocationsMap[subscription.planTier] || 1;

  return {
    canAddDoctor: doctorCount < plan.maxDoctors,
    canAddAppointment: appointmentCount < plan.maxAppointmentsPerMonth,
    canAddLocation: locationCount < maxLocations,
    currentDoctors: doctorCount,
    currentAppointmentsThisMonth: appointmentCount,
    currentLocations: locationCount,
    maxDoctors: plan.maxDoctors,
    maxAppointmentsPerMonth: plan.maxAppointmentsPerMonth,
    maxLocations,
    planTier: subscription.planTier
  };
}

export async function enforceDoctorLimit(organizationId: string): Promise<void> {
  const limits = await checkSubscriptionLimits(organizationId);
  
  if (!limits.canAddDoctor) {
    throw new Error(
      `Doctor limit reached. Current: ${limits.currentDoctors}/${limits.maxDoctors}. ` +
      `Upgrade your plan to add more doctors.`
    );
  }
}

export async function enforceAppointmentLimit(organizationId: string): Promise<void> {
  const limits = await checkSubscriptionLimits(organizationId);
  
  if (!limits.canAddAppointment) {
    throw new Error(
      `Monthly appointment limit reached. Current: ${limits.currentAppointmentsThisMonth}/${limits.maxAppointmentsPerMonth}. ` +
      `Upgrade your plan to book more appointments.`
    );
  }
}

export async function enforceLocationLimit(organizationId: string): Promise<void> {
  const limits = await checkSubscriptionLimits(organizationId);
  
  if (!limits.canAddLocation) {
    throw new Error(
      `Location limit reached. Current: ${limits.currentLocations}/${limits.maxLocations}. ` +
      `Upgrade your plan to add more locations.`
    );
  }
}

export async function getSubscriptionUsage(organizationId: string) {
  const limits = await checkSubscriptionLimits(organizationId);
  
  return {
    doctors: {
      used: limits.currentDoctors,
      limit: limits.maxDoctors,
      percentage: Math.round((limits.currentDoctors / limits.maxDoctors) * 100)
    },
    appointments: {
      used: limits.currentAppointmentsThisMonth,
      limit: limits.maxAppointmentsPerMonth,
      percentage: Math.round((limits.currentAppointmentsThisMonth / limits.maxAppointmentsPerMonth) * 100)
    },
    locations: {
      used: limits.currentLocations,
      limit: limits.maxLocations,
      percentage: Math.round((limits.currentLocations / limits.maxLocations) * 100)
    },
    planTier: limits.planTier
  };
}

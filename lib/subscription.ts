/**
 * Subscription plan configurations
 */
export interface SubscriptionPlan {
  planTier: string;
  maxDoctors: number;
  maxAppointmentsPerMonth: number;
  features: string[];
}

const PLANS: Record<string, SubscriptionPlan> = {
  STARTER: {
    planTier: "STARTER",
    maxDoctors: 5,
    maxAppointmentsPerMonth: 200,
    features: [
      "Up to 5 doctors",
      "200 appointments/month",
      "Basic analytics",
      "Email support",
      "1 location",
    ],
  },
  PROFESSIONAL: {
    planTier: "PROFESSIONAL",
    maxDoctors: 20,
    maxAppointmentsPerMonth: 1000,
    features: [
      "Up to 20 doctors",
      "1000 appointments/month",
      "Advanced analytics",
      "Priority support",
      "Up to 5 locations",
      "Custom appointment types",
      "SMS notifications",
    ],
  },
  ENTERPRISE: {
    planTier: "ENTERPRISE",
    maxDoctors: 100,
    maxAppointmentsPerMonth: 10000,
    features: [
      "Up to 100 doctors",
      "10000 appointments/month",
      "Full analytics suite",
      "24/7 dedicated support",
      "Unlimited locations",
      "Custom integrations",
      "API access",
      "White-label option",
    ],
  },
  UNLIMITED: {
    planTier: "UNLIMITED",
    maxDoctors: 10000,
    maxAppointmentsPerMonth: 1000000,
    features: [
      "Unlimited doctors",
      "Unlimited appointments",
      "Full analytics suite",
      "24/7 dedicated support",
      "Unlimited locations",
      "Custom integrations",
      "API access",
      "White-label option",
      "Custom contracts",
    ],
  },
};

export function getDefaultSubscriptionPlan(planTier: string): SubscriptionPlan {
  return PLANS[planTier] || PLANS.STARTER;
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(PLANS);
}

export function getPlan(planTier: string): SubscriptionPlan | undefined {
  return PLANS[planTier];
}

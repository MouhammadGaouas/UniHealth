"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { FaCheck, FaCrown, FaBuilding, FaBolt, FaRocket, FaInfinity } from "react-icons/fa";

const plans = [
    {
        id: "STARTER",
        name: "Starter",
        icon: <FaBuilding size={28} />,
        description: "Perfect for small clinics getting started",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            "Up to 5 doctors",
            "200 appointments/month",
            "Basic analytics",
            "Email support",
            "1 location",
            "Patient management",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        id: "PROFESSIONAL",
        name: "Professional",
        icon: <FaBolt size={28} />,
        description: "For growing healthcare facilities",
        monthlyPrice: 49,
        yearlyPrice: 470,
        features: [
            "Up to 20 doctors",
            "1000 appointments/month",
            "Advanced analytics",
            "Priority support",
            "Up to 5 locations",
            "Custom appointment types",
            "SMS notifications",
            "Insurance integration",
        ],
        cta: "Start Free Trial",
        highlighted: true,
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        icon: <FaRocket size={28} />,
        description: "For large hospitals and networks",
        monthlyPrice: 149,
        yearlyPrice: 1420,
        features: [
            "Up to 100 doctors",
            "10000 appointments/month",
            "Full analytics suite",
            "24/7 dedicated support",
            "Unlimited locations",
            "Custom integrations",
            "API access",
            "White-label option",
            "Multi-department support",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
    {
        id: "UNLIMITED",
        name: "Unlimited",
        icon: <FaInfinity size={28} />,
        description: "Maximum scale and flexibility",
        monthlyPrice: 299,
        yearlyPrice: 2850,
        features: [
            "Unlimited doctors",
            "Unlimited appointments",
            "Custom contracts",
            "Dedicated account manager",
            "On-premise deployment",
            "Custom SLA",
            "Advanced security",
            "Training sessions",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

export default function PricingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

    const handleSelectPlan = (planId: string) => {
        if (!session?.user) {
            router.push("/auth/register");
            return;
        }
        // Redirect to organization creation or upgrade
        router.push("/dashboard/organization");
    };

    return (
        <main className="min-h-screen bg-[#020617] relative overflow-hidden font-sans pt-20">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
            <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
                    <FaCrown size={14} />
                    Flexible Pricing for Every Organization
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Choose Your <span className="text-gradient">Perfect Plan</span>
                </h1>
                <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
                    From small clinics to large hospital networks, we have a plan that fits your needs.
                    All plans include a 14-day free trial.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className={`text-sm font-medium ${billingCycle === "MONTHLY" ? "text-white" : "text-gray-400"}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === "MONTHLY" ? "YEARLY" : "MONTHLY")}
                        className="relative w-14 h-7 bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-blue-600 rounded-full transition-transform ${billingCycle === "YEARLY" ? "left-8" : "left-1"}`}></div>
                    </button>
                    <span className={`text-sm font-medium ${billingCycle === "YEARLY" ? "text-white" : "text-gray-400"}`}>
                        Yearly <span className="text-green-400 text-xs ml-1">(Save 20%)</span>
                    </span>
                </div>
            </section>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`glass rounded-2xl border p-6 flex flex-col relative transition-all duration-300 hover:-translate-y-2 ${plan.highlighted
                                    ? "border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-900/10"
                                    : "border-gray-800 hover:border-gray-600"
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${plan.highlighted ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-400"}`}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">
                                        ${billingCycle === "MONTHLY" ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                                    </span>
                                    <span className="text-gray-400 text-sm">/month</span>
                                </div>
                                {billingCycle === "YEARLY" && plan.yearlyPrice > 0 && (
                                    <p className="text-gray-500 text-xs mt-1">Billed ${plan.yearlyPrice} yearly</p>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                                        <FaCheck className="text-green-400 mt-0.5 flex-shrink-0" size={12} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${plan.highlighted
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                        : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Enterprise CTA */}
                <section className="mt-20 py-16 px-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-4">Need a Custom Solution?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                            For organizations with unique requirements, we offer custom plans tailored to your specific needs.
                        </p>
                        <button className="bg-white text-blue-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:scale-105">
                            Contact Our Sales Team
                        </button>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mt-20">
                    <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <FAQItem
                            question="Can I change plans later?"
                            answer="Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
                        />
                        <FAQItem
                            question="Is there a free trial?"
                            answer="All plans come with a 14-day free trial. No credit card required to start."
                        />
                        <FAQItem
                            question="What payment methods do you accept?"
                            answer="We accept all major credit cards, bank transfers, and can accommodate enterprise invoicing."
                        />
                        <FAQItem
                            question="Can I cancel anytime?"
                            answer="Absolutely. You can cancel your subscription at any time with no cancellation fees."
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <div className="glass border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">{question}</h3>
            <p className="text-gray-400 text-sm">{answer}</p>
        </div>
    );
}

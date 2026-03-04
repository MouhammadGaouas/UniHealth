"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBuilding, FaUsers, FaCalendarCheck, FaChartLine, FaArrowUp, FaCrown, FaCheckCircle } from "react-icons/fa";

export default function OrganizationDashboard() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [orgData, setOrgData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [monthlyApptCount, setMonthlyApptCount] = useState(0);

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/auth/login");
        }
        if (!isPending && session?.user && (session.user as any).role === "PATIENT") {
            router.push("/dashboard");
        }
    }, [isPending, session, router]);

    useEffect(() => {
        const fetchOrg = async () => {
            if (!session?.user) return;
            try {
                const res = await fetch("/api/organizations");
                if (res.ok) {
                    const data = await res.json();
                    setOrgData(data.organization);
                }
            } catch (err) {
                console.error("Failed to fetch organization", err);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchOrg();
        }
    }, [session]);

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!orgData) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="text-center">
                        <FaBuilding className="mx-auto text-6xl text-gray-700 mb-6" />
                        <h1 className="text-3xl font-bold text-white mb-3">No Organization Found</h1>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            You're not part of an organization yet. Register a clinic or hospital to get started.
                        </p>
                        <Link href="/auth/register">
                            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all">
                                Register Organization
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const subscription = orgData.subscription;
    const doctorUsage = (orgData._count?.doctors || 0) / (subscription?.maxDoctors || 1) * 100;
    const isUnlimitedDocs = subscription?.maxDoctors > 1000;

    const appointmentUsage = monthlyApptCount / (subscription?.maxAppointmentsPerMonth || 1) * 100;
    const isUnlimitedAppts = subscription?.maxAppointmentsPerMonth > 10000;

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col font-sans">

            <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FaBuilding className="text-blue-400" size={24} />
                            <h1 className="text-3xl font-bold text-white">{orgData.name}</h1>
                        </div>
                        <p className="text-gray-400 text-sm">
                            {orgData.type?.replace("_", " ")} • Organization Dashboard
                        </p>
                    </div>
                    {subscription && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-5 py-2">
                            <FaCrown className="text-yellow-400" size={14} />
                            <span className="text-sm font-bold text-white">{subscription.planTier} Plan</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Subscription Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <FaChartLine className="text-blue-400" /> Plan Usage
                            </h2>

                            {/* Doctors Usage */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <p className="text-gray-400 flex items-center gap-2">
                                        <FaUsers className="text-blue-400" size={14} /> Doctors
                                    </p>
                                    <div className="text-sm">
                                        <span className="text-white font-bold">{orgData._count?.doctors || 0}</span>
                                        <span className="text-gray-500"> / {isUnlimitedDocs ? "Unlimited" : subscription?.maxDoctors}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                                        style={{ width: `${isUnlimitedDocs ? 10 : Math.min(doctorUsage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Appointments Usage */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <p className="text-gray-400 flex items-center gap-2">
                                        <FaCalendarCheck className="text-emerald-400" size={14} /> Monthly Appointments
                                    </p>
                                    <div className="text-sm">
                                        <span className="text-white font-bold">{monthlyApptCount}</span>
                                        <span className="text-gray-500"> / {isUnlimitedAppts ? "Unlimited" : subscription?.maxAppointmentsPerMonth}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                                        style={{ width: `${isUnlimitedAppts ? 5 : Math.min(appointmentUsage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Locations */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <p className="text-gray-400 flex items-center gap-2">
                                        <FaBuilding className="text-purple-400" size={14} /> Locations
                                    </p>
                                    <span className="text-white font-bold">{orgData._count?.locations || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        {subscription?.features && subscription.features.length > 0 && (
                            <div className="glass border border-gray-800 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-white mb-4">Included Features</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {subscription.features.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <FaCheckCircle className="text-green-400 flex-shrink-0" size={14} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        <div className="glass border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link href="/dashboard/organization/team" className="block">
                                    <div className="p-4 rounded-xl border border-gray-800 hover:bg-gray-800/30 transition cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FaUsers size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium text-sm">Manage Team</h3>
                                                <p className="text-xs text-gray-500">Add or remove doctors</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/dashboard/organization/locations" className="block">
                                    <div className="p-4 rounded-xl border border-gray-800 hover:bg-gray-800/30 transition cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FaBuilding size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium text-sm">Locations Center</h3>
                                                <p className="text-xs text-gray-500">Manage facility locations</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/pricing" className="block">
                                    <div className="p-4 rounded-xl border border-gray-800 hover:bg-gray-800/30 transition cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FaArrowUp size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium text-sm">Upgrade Plan</h3>
                                                <p className="text-xs text-gray-500">View pricing options</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

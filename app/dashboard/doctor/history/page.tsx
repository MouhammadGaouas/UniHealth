"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaCalendarAlt,
    FaUser,
    FaClock,
    FaCheckCircle,
    FaExclamationCircle,
    FaSearch,
    FaArrowLeft,
    FaHistory,
    FaFilter,
} from "react-icons/fa";

interface HistoryAppointment {
    id: string;
    dateTime: string;
    status: string;
    reason?: string | null;
    notes?: string | null;
    patient: {
        name: string | null;
        email: string;
    };
    appointmentType?: {
        name: string;
        duration: number;
    } | null;
}

type FilterStatus = "ALL" | "COMPLETED" | "CANCELLED";

export default function DoctorHistoryPage() {
    const [appointments, setAppointments] = useState<HistoryAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("ALL");
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const url =
                    filter === "ALL"
                        ? "/api/appointments/doctor/history"
                        : `/api/appointments/doctor/history?status=${filter}`;
                const res = await fetch(url);

                if (res.status === 401) {
                    router.push("/auth/login");
                    return;
                }
                if (res.status === 403) {
                    router.push("/unauthorized");
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data.appointments || []);
                } else {
                    const data = await res.json().catch(() => ({}));
                    setError(data.message || "Failed to load history");
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
                setError("Failed to load appointment history");
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchHistory();
    }, [filter, router]);

    const filtered = appointments.filter((apt) => {
        if (!search) return true;
        const patientName = apt.patient?.name || "";
        const patientEmail = apt.patient?.email || "";
        const q = search.toLowerCase();
        return (
            patientName.toLowerCase().includes(q) ||
            patientEmail.toLowerCase().includes(q)
        );
    });

    const stats = {
        total: appointments.length,
        completed: appointments.filter((a) => a.status === "COMPLETED").length,
        cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="animate-pulse text-gray-400">Loading History...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <div className="text-center space-y-4">
                    <p className="text-red-400 font-semibold">{error}</p>
                    <Link
                        href="/dashboard/doctor"
                        className="text-blue-500 hover:text-blue-400 hover:underline"
                    >
                        Go back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-16 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            {/* Background accents */}
            <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/doctor"
                            className="w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"
                        >
                            <FaArrowLeft size={14} />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                                <FaHistory className="text-emerald-400" size={32} />
                                Patient History
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Review all past patient appointments
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-8 animate-[slideUp_0.5s_ease-out]">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400">
                            <FaCalendarAlt size={18} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Total Past</p>
                            <p className="text-xl font-semibold text-white">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-green-400">
                            <FaCheckCircle size={18} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
                            <p className="text-xl font-semibold text-white">{stats.completed}</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center text-red-400">
                            <FaExclamationCircle size={18} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Cancelled</p>
                            <p className="text-xl font-semibold text-white">{stats.cancelled}</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="glass border border-gray-800 rounded-2xl p-6 mb-8 animate-[slideUp_0.55s_ease-out]">
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaSearch size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by patient name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full rounded-xl border border-gray-700 bg-gray-900/50 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors outline-none"
                            />
                        </div>

                        {/* Status filter tabs */}
                        <div className="flex items-center gap-1 bg-gray-900/60 rounded-xl p-1 border border-gray-800">
                            <FaFilter size={12} className="text-gray-500 ml-2 mr-1" />
                            {(["ALL", "COMPLETED", "CANCELLED"] as FilterStatus[]).map(
                                (status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === status
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                                            }`}
                                    >
                                        {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Appointment List */}
                <div className="glass border border-gray-800 rounded-2xl p-8 shadow-xl animate-[slideUp_0.6s_ease-out]">
                    <h2 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4">
                        Past Appointments
                        <span className="text-gray-500 text-base font-normal ml-3">
                            ({filtered.length} records)
                        </span>
                    </h2>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                <FaHistory size={32} />
                            </div>
                            <p className="text-lg mb-2">No past appointments found.</p>
                            <p className="text-sm text-gray-600">
                                {search
                                    ? "Try adjusting your search or filter."
                                    : "Completed and cancelled appointments will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filtered.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-800/40 transition-colors group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-full bg-emerald-900/20 flex items-center justify-center text-emerald-400 border border-emerald-900/30 flex-shrink-0">
                                            <FaUser size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {apt.patient?.name || "Patient"}
                                            </h3>
                                            <p className="text-sm text-gray-500 break-all">
                                                {apt.patient?.email}
                                            </p>
                                            {apt.appointmentType && (
                                                <p className="text-sm text-cyan-400/80 mt-0.5">
                                                    {apt.appointmentType.name} • {apt.appointmentType.duration} min
                                                </p>
                                            )}
                                            <div className="flex flex-col sm:flex-row sm:items-center text-gray-400 text-sm mt-2 gap-2 sm:gap-4">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt size={13} className="text-gray-500" />
                                                    <span>
                                                        {new Date(apt.dateTime).toLocaleDateString(undefined, {
                                                            weekday: "short",
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
                                                <div className="flex items-center gap-2">
                                                    <FaClock size={13} className="text-gray-500" />
                                                    <span>
                                                        {new Date(apt.dateTime).toLocaleTimeString(undefined, {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            {(apt.reason || apt.notes) && (
                                                <div className="mt-2 text-sm text-gray-500 space-y-1">
                                                    {apt.reason && (
                                                        <p>
                                                            <span className="font-semibold text-gray-400">Reason:</span>{" "}
                                                            {apt.reason}
                                                        </p>
                                                    )}
                                                    {apt.notes && (
                                                        <p>
                                                            <span className="font-semibold text-gray-400">Notes:</span>{" "}
                                                            {apt.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <StatusBadge status={apt.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let styles = "bg-gray-800 text-gray-300 border-gray-700";
    let icon = null;

    if (status === "COMPLETED") {
        styles = "bg-green-500/10 text-green-400 border-green-500/20";
        icon = <FaCheckCircle size={12} />;
    } else if (status === "CANCELLED") {
        styles = "bg-red-500/10 text-red-400 border-red-500/20";
        icon = <FaExclamationCircle size={12} />;
    } else if (status === "PENDING") {
        styles = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        icon = <FaClock size={12} />;
    } else if (status === "CONFIRMED") {
        styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        icon = <FaCheckCircle size={12} />;
    }

    return (
        <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold w-full md:w-auto text-center border flex items-center justify-center gap-2 uppercase tracking-wider flex-shrink-0 ${styles}`}
        >
            {icon}
            {status}
        </span>
    );
}

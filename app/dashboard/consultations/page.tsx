"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaFileAlt,
    FaArrowLeft,
    FaCalendarAlt,
    FaClock,
    FaUserMd,
    FaLock,
    FaChevronDown,
    FaChevronUp,
    FaPills,
    FaStethoscope,
    FaClipboardList,
    FaNotesMedical,
} from "react-icons/fa";

interface ConsultationNote {
    id: string;
    title: string;
    content: string;
    category: string;
    isConfidential: boolean;
    createdAt: string;
    doctor: {
        user: { name: string | null };
    };
    appointment: {
        dateTime: string;
        status: string;
    };
}

const categoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    DIAGNOSIS: { label: "Diagnosis", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: <FaStethoscope size={12} /> },
    PRESCRIPTION: { label: "Prescription", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <FaPills size={12} /> },
    FOLLOW_UP: { label: "Follow-up", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: <FaClipboardList size={12} /> },
    GENERAL: { label: "General", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: <FaNotesMedical size={12} /> },
};

export default function ConsultationsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [notes, setNotes] = useState<ConsultationNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!isPending && !session?.user) router.push("/auth/login");
    }, [isPending, session, router]);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/consultations")
                .then(res => res.ok ? res.json() : { notes: [] })
                .then(data => setNotes(data.notes || []))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="animate-pulse text-gray-400">Loading consultations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-16 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-10 animate-[fadeIn_0.5s_ease-out]">
                    <Link
                        href="/dashboard"
                        className="w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"
                    >
                        <FaArrowLeft size={14} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                            <FaFileAlt className="text-cyan-400" size={28} />
                            Consultation Notes
                        </h1>
                        <p className="text-gray-400 mt-1">Documents and notes from your doctors</p>
                    </div>
                    <span className="px-4 py-1.5 bg-cyan-500/20 text-cyan-400 text-sm font-bold rounded-full border border-cyan-500/30">
                        {notes.length} Note{notes.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {notes.length === 0 ? (
                    <div className="glass border border-gray-800 rounded-2xl p-12 text-center animate-[slideUp_0.5s_ease-out]">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <FaFileAlt size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Consultation Notes Yet</h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            After completing appointments, your doctors can send you consultation summaries, prescriptions, and follow-up instructions here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-[slideUp_0.5s_ease-out]">
                        {notes.map((note) => {
                            const cat = categoryConfig[note.category] || categoryConfig.GENERAL;
                            const isExpanded = expandedId === note.id;

                            return (
                                <div
                                    key={note.id}
                                    className="glass border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
                                >
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : note.id)}
                                        className="w-full p-5 flex items-start md:items-center justify-between gap-4 text-left"
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-cyan-900/20 flex items-center justify-center text-cyan-400 border border-cyan-900/30 flex-shrink-0 mt-0.5">
                                                <FaUserMd size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-white font-semibold truncate">{note.title}</h3>
                                                    {note.isConfidential && (
                                                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">
                                                            <FaLock size={8} /> Confidential
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                                    <span>Dr. {note.doctor.user.name || "Unknown"}</span>
                                                    <span className="w-1 h-1 bg-gray-700 rounded-full hidden sm:block" />
                                                    <span className="flex items-center gap-1">
                                                        <FaCalendarAlt size={10} />
                                                        {new Date(note.appointment.dateTime).toLocaleDateString(undefined, {
                                                            month: "short", day: "numeric", year: "numeric"
                                                        })}
                                                    </span>
                                                    <span className="w-1 h-1 bg-gray-700 rounded-full hidden sm:block" />
                                                    <span className="flex items-center gap-1">
                                                        <FaClock size={10} />
                                                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                                                            month: "short", day: "numeric"
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${cat.color}`}>
                                                {cat.icon} {cat.label}
                                            </span>
                                            {isExpanded ? <FaChevronUp size={12} className="text-gray-500" /> : <FaChevronDown size={12} className="text-gray-500" />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-gray-800/50">
                                            <div className="bg-gray-900/50 rounded-xl p-5 mt-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {note.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

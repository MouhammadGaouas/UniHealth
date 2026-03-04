"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUsers, FaArrowLeft, FaMapMarkerAlt, FaTrash, FaUserMd } from "react-icons/fa";

interface TeamDoctor {
    id: string;
    specialty: string;
    available: boolean;
    user: { id: string; name: string | null; email: string };
    location: { id: string; name: string } | null;
}

export default function ManageTeamPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [doctors, setDoctors] = useState<TeamDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isPending && !session?.user) router.push("/auth/login");
    }, [isPending, session, router]);

    useEffect(() => {
        if (session?.user) fetchTeam();
    }, [session]);

    const fetchTeam = async () => {
        try {
            const res = await fetch("/api/organizations/team");
            if (res.ok) {
                const data = await res.json();
                setDoctors(data.doctors || []);
            }
        } catch (err) {
            console.error("Failed to fetch team", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (doctorId: string) => {
        if (!confirm("Remove this doctor from the organization? They will lose access to organization features.")) return;
        setRemovingId(doctorId);
        try {
            const res = await fetch("/api/organizations/team", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId })
            });
            if (res.ok) {
                setDoctors(prev => prev.filter(d => d.id !== doctorId));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to remove doctor");
            }
        } catch {
            alert("Failed to remove doctor");
        } finally {
            setRemovingId(null);
        }
    };

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col font-sans">
            <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <Link href="/dashboard/organization" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-4">
                        <FaArrowLeft size={12} /> Back to Organization
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <FaUsers className="text-blue-400" /> Manage Team
                            </h1>
                            <p className="text-gray-400 mt-1">View and manage doctors in your organization</p>
                        </div>
                        <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-bold rounded-full border border-blue-500/30">
                            {doctors.length} Doctor{doctors.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {doctors.length === 0 ? (
                    <div className="glass border border-gray-800 rounded-2xl p-12 text-center">
                        <FaUserMd className="mx-auto text-5xl text-gray-700 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No Doctors Yet</h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Your organization doesn't have any doctors assigned yet. Ask your system admin to promote users and assign them to your organization.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {doctors.map(doc => (
                            <div key={doc.id} className="glass border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-800/30 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-900/40 shrink-0">
                                        <FaUserMd size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{doc.user.name || "Unnamed Doctor"}</p>
                                        <p className="text-xs text-gray-500">{doc.user.email}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-xs text-gray-400">
                                                <span className="text-gray-500">Specialty:</span> {doc.specialty}
                                            </span>
                                            {doc.location && (
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <FaMapMarkerAlt size={10} className="text-purple-400" /> {doc.location.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${doc.available ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
                                        {doc.available ? "Available" : "Unavailable"}
                                    </span>
                                    <button
                                        onClick={() => handleRemove(doc.id)}
                                        disabled={removingId === doc.id}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <FaTrash size={10} />
                                        {removingId === doc.id ? "Removing..." : "Remove"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

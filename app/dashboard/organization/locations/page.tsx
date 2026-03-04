"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBuilding, FaArrowLeft, FaMapMarkerAlt, FaPlus, FaUserMd, FaCalendarCheck, FaBan } from "react-icons/fa";

interface OrgLocation {
    id: string;
    name: string;
    address: string;
    city: string | null;
    state: string | null;
    phone: string | null;
    isActive: boolean;
    _count: { doctors: number; appointments: number };
}

export default function LocationsCenterPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [locations, setLocations] = useState<OrgLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", address: "", city: "", state: "", phone: "" });
    const [submitting, setSubmitting] = useState(false);
    const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isPending && !session?.user) router.push("/auth/login");
    }, [isPending, session, router]);

    useEffect(() => {
        if (session?.user) fetchLocations();
    }, [session]);

    const fetchLocations = async () => {
        try {
            const res = await fetch("/api/organizations/locations");
            if (res.ok) {
                const data = await res.json();
                setLocations(data.locations || []);
            }
        } catch (err) {
            console.error("Failed to fetch locations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.address.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/organizations/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ name: "", address: "", city: "", state: "", phone: "" });
                setShowForm(false);
                fetchLocations();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create location");
            }
        } catch {
            alert("Failed to create location");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (locationId: string) => {
        if (!confirm("Deactivate this location? It will no longer be available for new appointments.")) return;
        setDeactivatingId(locationId);
        try {
            const res = await fetch("/api/organizations/locations", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locationId })
            });
            if (res.ok) {
                setLocations(prev => prev.map(l => l.id === locationId ? { ...l, isActive: false } : l));
            }
        } catch {
            alert("Failed to deactivate location");
        } finally {
            setDeactivatingId(null);
        }
    };

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition";

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
                                <FaBuilding className="text-purple-400" /> Locations Center
                            </h1>
                            <p className="text-gray-400 mt-1">Manage your clinics and facility locations</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:scale-[1.02] transition-all"
                        >
                            <FaPlus size={12} /> Add Location
                        </button>
                    </div>
                </div>

                {/* Add Location Form */}
                {showForm && (
                    <div className="glass border border-gray-800 rounded-2xl p-6 mb-8">
                        <h2 className="text-lg font-bold text-white mb-4">New Location</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Location Name *</label>
                                    <input type="text" required className={inputClass} placeholder="e.g. Main Campus" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Address *</label>
                                    <input type="text" required className={inputClass} placeholder="e.g. 123 Medical Plaza" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">City</label>
                                    <input type="text" className={inputClass} placeholder="e.g. New York" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">State</label>
                                    <input type="text" className={inputClass} placeholder="e.g. NY" value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone</label>
                                    <input type="tel" className={inputClass} placeholder="e.g. +1 555 1234" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition text-sm">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm disabled:opacity-50">{submitting ? "Creating..." : "Create Location"}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Locations Grid */}
                {locations.length === 0 ? (
                    <div className="glass border border-gray-800 rounded-2xl p-12 text-center">
                        <FaMapMarkerAlt className="mx-auto text-5xl text-gray-700 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No Locations Yet</h2>
                        <p className="text-gray-400">Add your first clinic or facility location above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {locations.map(loc => (
                            <div key={loc.id} className={`glass border rounded-xl p-5 transition ${loc.isActive ? "border-gray-800 hover:bg-gray-800/30" : "border-red-900/30 opacity-60"}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-purple-400" size={14} />
                                            {loc.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">{loc.address}{loc.city ? `, ${loc.city}` : ""}{loc.state ? `, ${loc.state}` : ""}</p>
                                    </div>
                                    {loc.isActive ? (
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30">Active</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded border border-red-500/30">Inactive</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1"><FaUserMd size={11} className="text-blue-400" /> {loc._count.doctors} Doctor{loc._count.doctors !== 1 ? "s" : ""}</span>
                                    <span className="flex items-center gap-1"><FaCalendarCheck size={11} className="text-emerald-400" /> {loc._count.appointments} Appt{loc._count.appointments !== 1 ? "s" : ""}</span>
                                    {loc.phone && <span>{loc.phone}</span>}
                                </div>
                                {loc.isActive && (
                                    <button
                                        onClick={() => handleDeactivate(loc.id)}
                                        disabled={deactivatingId === loc.id}
                                        className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        <FaBan size={10} />
                                        {deactivatingId === loc.id ? "Deactivating..." : "Deactivate Location"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

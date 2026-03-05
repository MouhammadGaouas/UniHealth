"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { FaUser, FaPhone, FaVenusMars, FaBirthdayCake, FaArrowLeft, FaSave, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string | null;
    gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null;
    birthday: string | null;
    role: string;
}

export default function PatientProfilePage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [gender, setGender] = useState<UserProfile["gender"]>(null);
    const [birthday, setBirthday] = useState("");

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/auth/login");
            return;
        }

        if (session?.user) {
            fetchProfile();
        }
    }, [isPending, session, router]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                const userProfile = data.user;
                setProfile(userProfile);

                // Populate form
                setName(userProfile.name || "");
                setPhoneNumber(userProfile.phoneNumber || "");
                setGender(userProfile.gender);
                // Convert ISO datetime to YYYY-MM-DD for date input
                if (userProfile.birthday) {
                    setBirthday(new Date(userProfile.birthday).toISOString().split('T')[0]);
                }
            } else {
                setMessage({ type: 'error', text: "Failed to load profile details." });
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setMessage({ type: 'error', text: "Error connecting to server." });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name || undefined,
                    phoneNumber: phoneNumber || null,
                    gender: gender || null,
                    // If a birthday is selected, parse it into an ISO string. Otherwise, null.
                    birthday: birthday ? new Date(birthday).toISOString() : null,
                })
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setMessage({ type: 'success', text: "Profile updated successfully!" });
            } else {
                const errorData = await res.json();
                const errorMessage = Array.isArray(errorData.error)
                    ? errorData.error.map((err: any) => err.message).join(", ")
                    : errorData.error || "Failed to update profile.";

                setMessage({ type: 'error', text: errorMessage });
            }
        } catch (error) {
            console.error("Failed to save profile", error);
            setMessage({ type: 'error', text: "An unexpected error occurred." });
        } finally {
            setSaving(false);
            // Clear success message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#020617] pt-28 px-4 md:px-8">
                <div className="max-w-3xl mx-auto animate-pulse">
                    <div className="h-10 bg-gray-800 rounded w-1/3 mb-8"></div>
                    <div className="h-[500px] bg-gray-800 rounded-2xl w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-16 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            {/* Ambient Backgrounds */}
            <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10 animate-[fadeIn_0.5s_ease-out]">
                    <Link
                        href="/dashboard"
                        className="w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"
                    >
                        <FaArrowLeft size={14} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                            <FaUser className="text-blue-400" size={24} />
                            Personal Profile
                        </h1>
                        <p className="text-gray-400 mt-1">Manage your health and contact details</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-[slideDown_0.3s_ease-out] ${message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <FaCheckCircle className="mt-0.5 flex-shrink-0" /> : <FaExclamationCircle className="mt-0.5 flex-shrink-0" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                {/* Main Form Form */}
                <div className="glass border border-gray-800 rounded-2xl overflow-hidden shadow-xl animate-[slideUp_0.5s_ease-out]">
                    {/* Read-only Immutable Info Row */}
                    <div className="bg-gray-900/60 p-6 md:p-8 border-b border-gray-800 flex flex-col sm:flex-row gap-6 justify-between sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-900/30 border-2 border-blue-900 flex items-center justify-center text-blue-400 text-2xl font-bold">
                                {profile?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{profile?.name || "Patient"}</h2>
                                <p className="text-sm text-gray-400">{profile?.email}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700">
                                {profile?.role}
                            </span>
                        </div>
                    </div>

                    {/* Editable Form */}
                    <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <FaUser size={12} className="text-blue-400" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <FaPhone size={12} className="text-blue-400" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+1 (234) 567-8900"
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <FaVenusMars size={12} className="text-blue-400" /> Gender
                                </label>
                                <select
                                    value={gender || ""}
                                    onChange={(e) => setGender(e.target.value as UserProfile["gender"])}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                                >
                                    <option value="">Select gender...</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                                </select>
                            </div>

                            {/* Birthday */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <FaBirthdayCake size={12} className="text-blue-400" /> Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </div>
                                ) : (
                                    <>
                                        <FaSave size={14} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

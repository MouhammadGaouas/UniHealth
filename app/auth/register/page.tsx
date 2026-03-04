"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaPhone, FaVenusMars, FaCalendarAlt, FaBuilding } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
    const [birthday, setBirthday] = useState("");
    const [registerAsOrg, setRegisterAsOrg] = useState(false);
    const [organizationName, setOrganizationName] = useState("");
    const [organizationType, setOrganizationType] = useState<"HOSPITAL" | "CLINIC" | "LABORATORY" | "PHARMACY" | "">("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const genderMap: Record<string, string> = {
        MALE: "male",
        FEMALE: "female",
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // First, create the user account
            const result = await authClient.signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Registration failed");
                setIsLoading(false);
                return;
            }

            // Update user profile with additional fields
            try {
                const profileData: Record<string, string | null> = {};
                if (phoneNumber) profileData.phoneNumber = phoneNumber;
                if (gender && genderMap[gender]) profileData.gender = genderMap[gender];
                if (birthday) profileData.birthday = new Date(birthday).toISOString();

                if (Object.keys(profileData).length > 0) {
                    await fetch("/api/user/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(profileData),
                    });
                }
            } catch (profileError) {
                console.error("Profile update error:", profileError);
                // Non-critical, continue
            }

            // If registering as organization, create it after user creation
            if (registerAsOrg && organizationName && organizationType) {
                try {
                    const orgResponse = await fetch("/api/organizations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: organizationName,
                            type: organizationType,
                            planTier: "STARTER",
                        }),
                    });

                    if (!orgResponse.ok) {
                        const orgError = await orgResponse.json().catch(() => ({}));
                        console.error("Organization creation failed:", orgError);
                        // Continue anyway - user is created
                    }
                } catch (orgError) {
                    console.error("Organization creation error:", orgError);
                    // Continue - user account is still valid
                }
            }

            router.push("/auth/login");
        } catch (err) {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const inputClass =
        "block w-full rounded-lg border border-gray-700 bg-gray-900/50 py-3 pl-10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors outline-none";

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>

            <div className="w-full max-w-md space-y-8 glass p-10 rounded-2xl border border-gray-800 shadow-2xl relative z-10">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Join UniHealth to prioritize your wellbeing
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaUser />
                            </div>
                            <input
                                type="text"
                                required
                                className={inputClass}
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaEnvelope />
                            </div>
                            <input
                                type="email"
                                required
                                className={inputClass}
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaLock />
                            </div>
                            <input
                                type="password"
                                required
                                className={inputClass}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaPhone />
                            </div>
                            <input
                                type="tel"
                                className={inputClass}
                                placeholder="Phone Number (optional)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        {/* Gender */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaVenusMars />
                            </div>
                            <select
                                className={`${inputClass} appearance-none`}
                                value={gender}
                                onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE" | "")}
                            >
                                <option value="" className="bg-gray-900 text-gray-500">Gender (optional)</option>
                                <option value="MALE" className="bg-gray-900 text-white">Male</option>
                                <option value="FEMALE" className="bg-gray-900 text-white">Female</option>
                            </select>
                        </div>

                        {/* Birthday */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaCalendarAlt />
                            </div>
                            <input
                                type="date"
                                className={`${inputClass} [color-scheme:dark]`}
                                placeholder="Birthday (optional)"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">{error}</div>}

                    {/* Organization Registration Toggle */}
                    <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <input
                            type="checkbox"
                            id="registerAsOrg"
                            checked={registerAsOrg}
                            onChange={(e) => setRegisterAsOrg(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-800"
                        />
                        <label htmlFor="registerAsOrg" className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer">
                            <FaBuilding className="text-blue-400" />
                            Register as Healthcare Organization
                        </label>
                    </div>

                    {/* Organization Details */}
                    {registerAsOrg && (
                        <div className="space-y-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <FaBuilding />
                                </div>
                                <input
                                    type="text"
                                    required={registerAsOrg}
                                    className={inputClass}
                                    placeholder="Organization Name"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <FaBuilding />
                                </div>
                                <select
                                    required={registerAsOrg}
                                    className={`${inputClass} appearance-none`}
                                    value={organizationType}
                                    onChange={(e) => setOrganizationType(e.target.value as any)}
                                >
                                    <option value="" className="bg-gray-900 text-gray-500">Organization Type</option>
                                    <option value="HOSPITAL" className="bg-gray-900 text-white">Hospital</option>
                                    <option value="CLINIC" className="bg-gray-900 text-white">Clinic</option>
                                    <option value="LABORATORY" className="bg-gray-900 text-white">Laboratory</option>
                                    <option value="PHARMACY" className="bg-gray-900 text-white">Pharmacy</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? "Creating Account..." : (
                                <span className="flex items-center gap-2">
                                    Sign Up <FaUserPlus />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUserMd,
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaPlus,
} from "react-icons/fa";

interface Doctor {
  id: string;
  specialty: string;
  available: boolean;
  user: {
    name: string | null;
    email: string;
  };
}

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteMessage, setPromoteMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (res.status === 403) {
          router.push("/unauthorized");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Failed to load doctors");
          return;
        }

        const data = await res.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [router]);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteMessage(null);

    if (!userId || !specialty) {
      setPromoteMessage("User ID and specialty are required.");
      return;
    }

    setPromoteLoading(true);
    try {
      const res = await fetch("/api/admin/make-doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, specialty }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPromoteMessage(data.message || "Failed to promote user to doctor.");
        return;
      }

      setPromoteMessage(data.message || "User promoted to Doctor successfully.");
      setUserId("");
      setSpecialty("");

      // Refresh doctors list
      const doctorsRes = await fetch("/api/doctors");
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData.doctors || []);
      }
    } catch (err) {
      console.error("Error promoting user to doctor", err);
      setPromoteMessage("Error promoting user to doctor.");
    } finally {
      setPromoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse text-gray-400">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage doctors and elevate users to doctor role
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2 text-xs uppercase tracking-wide text-gray-400">
            <FaUserShield size={14} className="text-blue-400" />
            <span>Admin access</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="glass border border-gray-800 rounded-2xl p-7 shadow-xl animate-[slideUp_0.6s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaUserMd className="text-blue-400" />
                Current Doctors
              </h2>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 text-gray-400">
                {doctors.length} total
              </span>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                <p className="text-sm">
                  No doctors registered yet. Promote users to doctors using the
                  form on the right.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-gray-900/40 border border-gray-800 rounded-xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-900/40">
                        <FaUserMd size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {doctor.user.name || "Unnamed Doctor"}
                        </p>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <FaEnvelope size={11} className="text-gray-500" />
                          <span className="break-all">{doctor.user.email}</span>
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          <span className="text-gray-500">Specialty:</span>{" "}
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          doctor.available
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }`}
                      >
                        {doctor.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass border border-gray-800 rounded-2xl p-7 shadow-xl animate-[slideUp_0.7s_ease-out]">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-blue-400" />
              Promote User to Doctor
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Enter the user ID and desired specialty to create a doctor
              profile and upgrade the user&apos;s role. In a full admin panel,
              you would typically select the user from a list instead of typing
              the ID.
            </p>

            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter user ID to promote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g. Cardiology, Pediatrics"
                />
              </div>

              {promoteMessage && (
                <p
                  className={`text-sm ${
                    promoteMessage.toLowerCase().includes("error") ||
                    promoteMessage.toLowerCase().includes("fail")
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {promoteMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={promoteLoading}
                className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
              >
                <FaPlus size={12} />
                {promoteLoading ? "Promoting..." : "Promote to Doctor"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}


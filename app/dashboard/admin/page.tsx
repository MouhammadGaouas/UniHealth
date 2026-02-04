"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUserMd,
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaSearch,
  FaUsers,
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

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface Stats {
  users: {
    total: number;
    doctors: number;
    patients: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteMessage, setPromoteMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"doctors" | "users">("doctors");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [router]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [searchQuery, roleFilter, activeTab]);

  const fetchData = async () => {
    try {
      const [doctorsRes, statsRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/admin/stats")
      ]);

      if (doctorsRes.status === 401 || statsRes.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (doctorsRes.status === 403 || statsRes.status === 403) {
        router.push("/unauthorized");
        return;
      }

      if (doctorsRes.ok) {
        const data = await doctorsRes.json();
        setDoctors(data.doctors || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

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
        headers: { "Content-Type": "application/json" },
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
      fetchData();
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
          <p className="animate-pulse text-gray-400">Loading Admin Dashboard...</p>
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">System overview and management</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2 text-xs uppercase tracking-wide text-gray-400">
            <FaUserShield size={14} className="text-blue-400" />
            <span>Admin access</span>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400">
                <FaUsers size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.users.total}</p>
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center text-green-400">
                <FaUserMd size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Doctors</p>
                <p className="text-2xl font-bold text-white">{stats.users.doctors}</p>
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
                <FaCalendarAlt size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Appointments</p>
                <p className="text-2xl font-bold text-white">{stats.appointments.total}</p>
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-900/30 flex items-center justify-center text-yellow-400">
                <FaClock size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.appointments.pending}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === "doctors"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
          >
            All Users
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Main Content */}
          <section className="glass border border-gray-800 rounded-2xl p-7 shadow-xl">
            {activeTab === "doctors" ? (
              <>
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
                    <p className="text-sm">No doctors registered yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
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
                              <span className="text-gray-500">Specialty:</span> {doctor.specialty}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${doctor.available
                              ? "bg-green-500/10 text-green-400 border-green-500/30"
                              : "bg-gray-800 text-gray-400 border-gray-700"
                            }`}
                        >
                          {doctor.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaUsers className="text-blue-400" />
                    All Users
                  </h2>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">All Roles</option>
                    <option value="PATIENT">Patients</option>
                    <option value="DOCTOR">Doctors</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-900/40 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-purple-900/30 text-purple-400' :
                            user.role === 'DOCTOR' ? 'bg-blue-900/30 text-blue-400' :
                              'bg-gray-800 text-gray-400'
                          }`}>
                          {user.role === 'ADMIN' ? <FaUserShield size={18} /> :
                            user.role === 'DOCTOR' ? <FaUserMd size={18} /> :
                              <FaUser size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                          user.role === 'DOCTOR' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                            'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Promote User Form */}
          <section className="glass border border-gray-800 rounded-2xl p-7 shadow-xl h-fit">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-blue-400" />
              Promote User to Doctor
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Enter the user ID and specialty to create a doctor profile.
            </p>

            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter user ID to promote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. Cardiology, Pediatrics"
                />
              </div>

              {promoteMessage && (
                <p className={`text-sm ${promoteMessage.toLowerCase().includes("error") || promoteMessage.toLowerCase().includes("fail")
                    ? "text-red-400"
                    : "text-green-400"
                  }`}>
                  {promoteMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={promoteLoading}
                className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  FaBuilding,
  FaBan,
  FaUnlock,
  FaExclamationTriangle
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
  banned?: boolean;
}

interface Stats {
  totalOrganizations: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  appointmentsGrowth: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
}

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"doctors" | "users">("doctors");
  const router = useRouter();

  // Inline Promotion State
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [promotionSpecialty, setPromotionSpecialty] = useState("");

  // Ban action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const handleInlinePromote = async (userId: string) => {
    if (!promotionSpecialty) {
      alert("Specialty is required to promote a user to Doctor");
      return;
    }

    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin/make-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, specialty: promotionSpecialty }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || data.message || "Failed to promote user to doctor.");
        return;
      }

      setPromotingUserId(null);
      setPromotionSpecialty("");
      fetchData();
      if (activeTab === 'users') fetchUsers();

    } catch (err) {
      console.error("Error promoting user to doctor", err);
      alert("Error promoting user to doctor.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (action === 'ban' && !confirm("Are you sure you want to ban this user?")) return;

    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === 'ban' ? 'Admin dashboard action' : undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update user status.");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.error(`Error trying to ${action} user`, err);
      alert(`Error trying to ${action} user.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-28 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 bg-gray-800 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-800 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="text-center space-y-4">
          <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
          <p className="text-red-400 font-semibold">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">Retry</button>
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
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-700 transition">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Organizations</p>
                <p className="text-3xl font-bold text-white">{stats.totalOrganizations}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <FaBuilding size={20} />
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-700 transition">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Doctors</p>
                <p className="text-3xl font-bold text-white">{stats.totalDoctors}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <FaUserMd size={20} />
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-700 transition">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Patients</p>
                <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <FaUsers size={20} />
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-700 transition">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Appointments</p>
                <p className="text-3xl font-bold text-white">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <FaCalendarAlt size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-900/30 rounded-2xl p-5">
              <p className="text-sm text-green-400/80 mb-1 tracking-wide">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-400">${stats.revenueThisMonth.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-900/30 rounded-2xl p-5">
              <p className="text-sm text-blue-400/80 mb-1 tracking-wide">Appointments (30d)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-400">{stats.appointmentsThisMonth}</p>
                <span className={`text-xs ${stats.appointmentsGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.appointmentsGrowth > 0 ? '+' : ''}{stats.appointmentsGrowth}%
                </span>
              </div>
            </div>
          </div>
        )}


        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === "doctors"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === "users"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
          >
            All Users Management
          </button>
          <Link href="/dashboard/admin/organizations">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-colors bg-gray-800 text-gray-400 hover:bg-gray-700 flex items-center gap-2`}
            >
              <FaBuilding size={14} />
              Organizations
            </button>
          </Link>
        </div>

        <div>
          {/* Main Content */}
          <section className="glass border border-gray-800 rounded-2xl p-7 shadow-xl">
            {activeTab === "doctors" ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaUserMd className="text-cyan-400" />
                    Doctor Directory
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 text-gray-400">
                    {doctors.length} active
                  </span>
                </div>

                {doctors.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                    <p className="text-sm">No doctors registered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-900/40">
                            <FaUserMd size={22} />
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doctor.available
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                              }`}
                          >
                            {doctor.available ? "Active" : "Away"}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-lg truncate">
                          {doctor.user.name || "Unnamed Doctor"}
                        </h3>
                        <p className="text-sm text-cyan-400/80 mb-3">{doctor.specialty}</p>

                        <div className="space-y-2 mt-4 pt-4 border-t border-gray-800/50">
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <FaEnvelope className="text-gray-600" />
                            <span className="truncate">{doctor.user.email}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <FaUsers className="text-blue-400" />
                      Platform Users
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Manage access control and promote doctors</p>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-3 mb-6 bg-gray-900/30 p-4 rounded-xl border border-gray-800/50">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="md:w-48 px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Roles</option>
                    <option value="PATIENT">Patients</option>
                    <option value="DOCTOR">Doctors</option>
                    <option value="ORG_ADMIN">Org Admins</option>
                    <option value="ADMIN">System Admins</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs uppercase bg-gray-900/50 text-gray-500 border-b border-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-4">User</th>
                        <th scope="col" className="px-6 py-4">Role</th>
                        <th scope="col" className="px-6 py-4">Status</th>
                        <th scope="col" className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.banned ? 'bg-red-900/30 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                                {user.banned ? <FaBan size={12} /> : <FaUser size={12} />}
                              </div>
                              <div>
                                <div className={`font-semibold ${user.banned ? 'text-gray-500 line-through' : 'text-white'}`}>{user.name || "Unnamed"}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                                user.role === 'ORG_ADMIN' ? 'bg-orange-500/10 text-orange-400' :
                                  user.role === 'DOCTOR' ? 'bg-cyan-500/10 text-cyan-400' :
                                    'bg-gray-800 text-gray-300'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.banned ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Banned
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {user.role === 'PATIENT' && !user.banned && (
                              <>
                                {promotingUserId === user.id ? (
                                  <div className="inline-flex items-center gap-2">
                                    <input
                                      autoFocus
                                      type="text"
                                      className="px-3 py-1 bg-gray-900 border border-blue-500/50 rounded text-xs text-white outline-none w-32"
                                      placeholder="Specialty..."
                                      value={promotionSpecialty}
                                      onChange={e => setPromotionSpecialty(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && handleInlinePromote(user.id)}
                                    />
                                    <button
                                      disabled={actionLoadingId === user.id}
                                      onClick={() => handleInlinePromote(user.id)}
                                      className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs transition"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => { setPromotingUserId(null); setPromotionSpecialty(""); }}
                                      className="text-gray-400 hover:text-white px-2 py-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    disabled={actionLoadingId === user.id}
                                    onClick={() => setPromotingUserId(user.id)}
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg"
                                  >
                                    <FaUserMd size={10} />
                                    Promote
                                  </button>
                                )}
                              </>
                            )}

                            {user.role !== 'ADMIN' && (
                              <button
                                disabled={actionLoadingId === user.id}
                                onClick={() => handleToggleBan(user.id, !!user.banned)}
                                className={`inline-flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg ${user.banned
                                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                                    : 'text-red-400 hover:bg-red-500/10'
                                  }`}
                              >
                                {actionLoadingId === user.id ? (
                                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                ) : user.banned ? (
                                  <><FaUnlock size={10} /> Unban</>
                                ) : (
                                  <><FaBan size={10} /> Ban</>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-t border-gray-800/40">
                      No users found matching the criteria.
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

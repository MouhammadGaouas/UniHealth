"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaCalendarAlt, FaUserMd, FaPlus, FaClock, FaCheckCircle, FaExclamationCircle, FaTimes, FaFileMedical, FaUser, FaInfoCircle, FaHeartbeat } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

interface Appointment {
  id: string;
  dateTime: string;
  doctor: {
    user: {
      name: string;
    }
  };
  status: string;
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchAppointments();
  }, []);

  const fetchUser = async () => {
    try {
      const sessionResult = await authClient.getSession();
      if (!sessionResult.data) {
        router.push("/auth/login");
        return;
      }
      const data = sessionResult.data.user;
      setUser(data);
      const userRole = (data as Record<string, unknown>).role as string;
      // Redirect doctors to their dedicated dashboard
      if (userRole === "DOCTOR") {
        router.push("/dashboard/doctor");
        return;
      }
      // Redirect admins to their dedicated dashboard
      if (userRole === "ADMIN") {
        router.push("/dashboard/admin");
        return;
      }
      // Redirect organization admins to their organization dashboard
      if (userRole === "ORG_ADMIN") {
        router.push("/dashboard/organization");
        return;
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments/my");
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        setAppointments(prev =>
          prev.map(apt => apt.id === id ? { ...apt, status: "CANCELLED" } : apt)
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Failed to cancel appointment", error);
      alert("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter appointments: upcoming first, then past
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.dateTime) >= now && apt.status !== "CANCELLED" && apt.status !== "COMPLETED")
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastAppointments = appointments
    .filter(apt => new Date(apt.dateTime) < now || apt.status === "CANCELLED" || apt.status === "COMPLETED")
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Welcome back, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-gray-400 mt-2">Manage your health records and appointments</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2 text-xs uppercase tracking-wide text-gray-400">
            <FaUser size={14} className="text-blue-400" />
            <span>Patient Portal</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Actions & Hub */}
          <div className="space-y-6">
            <div className="glass border border-gray-800 rounded-2xl p-6 shadow-xl animate-[slideUp_0.5s_ease-out]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-red-400" />
                Quick Actions
              </h2>
              <div className="grid gap-3">
                <Link href="/book" className="group flex items-center p-4 bg-gradient-to-r from-blue-900/40 to-cyan-900/20 border border-blue-800/50 rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 group-hover:bg-white/20 group-hover:text-white transition">
                    <FaPlus />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white">Book Appointment</p>
                    <p className="text-xs text-blue-200/70 group-hover:text-white/80 transition text-wrap pr-2">Schedule a new visit</p>
                  </div>
                </Link>

                <Link href="/dashboard/history" className="group flex items-center p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                    <FaHistoryIcon />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white">History</p>
                    <p className="text-xs text-gray-500">View past appointments</p>
                  </div>
                </Link>

                <Link href="/dashboard/consultations" className="group flex items-center p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                    <FaFileMedical />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white">Consultation Notes</p>
                    <p className="text-xs text-gray-500">Access doctors' feedback</p>
                  </div>
                </Link>

                <Link href="/dashboard/profile" className="group flex items-center p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                    <FaUser />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white">My Profile</p>
                    <p className="text-xs text-gray-500">Update personal details</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="glass border border-gray-800 rounded-2xl p-6 shadow-xl animate-[slideUp_0.6s_ease-out]">
              <div className="flex items-start gap-4">
                <FaInfoCircle className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-300">Need Help?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    If you have questions about your appointments or need Technical Assistance, please contact our support desk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming Appointments */}
          <div className="glass border border-gray-800 rounded-2xl p-8 shadow-xl animate-[slideUp_0.7s_ease-out] mb-8 h-fit">
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4">Upcoming Appointments</h2>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                  <FaCalendarAlt size={32} />
                </div>
                <p className="text-lg mb-2">You have no upcoming appointments.</p>
                <Link href="/book" className="text-blue-500 hover:text-blue-400 hover:underline font-medium">
                  Schedule your first visit
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {upcomingAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onCancel={handleCancelAppointment}
                    isCancelling={cancellingId === apt.id}
                  />
                ))}
              </div>
            )}
          </div>
          {/* End of Grid */}
        </div>
      </div>
    </div>
  );
}

// Simple history icon wrapper
function FaHistoryIcon() {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M504 255.531c.253 136.64-111.18 248.372-247.82 248.468-59.015.042-113.223-20.53-155.822-54.671-5.704-4.576-6.195-13.116-1.077-18.234l34.428-34.428c4.017-4.017 10.435-4.481 14.93-1.057 32.748 24.932 73.911 39.814 118.298 39.814 105.8 0 191.737-85.836 191.737-191.684.053-100.999-78.079-183.856-177.307-191.139-4.819-54.606-25.753-106.31-59.817-148.971-4.831-6.042-14.153-6.521-19.638-1.036L4.01 101.996c-5.32 5.32-5.337 13.987-.04 19.324l198.053 199.309c5.446 5.48 14.64 5.093 19.559-.838 35.195-42.503 57.075-94.673 63.029-149.805 101.488 4.708 183.27 88.082 183.389 190.545zM172.502 112v-111c0-2-2.1-3.2-3.8-2l-108 73c-1.3.9-1.3 2.9 0 3.8l108 73c1.7 1.2 3.8 0 3.8-2z"></path>
    </svg>
  )
}

function AppointmentCard({
  appointment: apt,
  onCancel,
  isCancelling,
  isPast
}: {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
  isPast?: boolean;
}) {
  const canCancel = !isPast && apt.status !== "CANCELLED" && apt.status !== "COMPLETED";

  return (
    <div className={`bg-gray-900/40 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gray-800/40 transition-colors group ${isPast ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 border border-blue-900/30">
          <FaUserMd size={26} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{apt.doctor.user.name || "Doctor"}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-400 text-sm mt-2 gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt size={14} className="text-gray-500" />
              <span>{new Date(apt.dateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <FaClock size={14} className="text-gray-500" />
              <span>{new Date(apt.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
        <StatusBadge status={apt.status} />
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(apt.id)}
            disabled={isCancelling}
            className="px-4 py-2 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCancelling ? (
              <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaTimes size={12} />
            )}
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let styles = "bg-gray-800 text-gray-300 border-gray-700";
  let icon = null;

  if (status === "CONFIRMED") {
    styles = "bg-green-500/10 text-green-400 border-green-500/20";
    icon = <FaCheckCircle size={12} />;
  } else if (status === "PENDING") {
    styles = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    icon = <FaClock size={12} />;
  } else if (status === "CANCELLED") {
    styles = "bg-red-500/10 text-red-400 border-red-500/20";
    icon = <FaExclamationCircle size={12} />;
  } else if (status === "COMPLETED") {
    styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    icon = <FaCheckCircle size={12} />;
  }

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold w-full md:w-auto text-center border flex items-center justify-center gap-2 uppercase tracking-wider ${styles}`}>
      {icon}
      {status}
    </span>
  );
}

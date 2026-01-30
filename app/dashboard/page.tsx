"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaCalendarAlt, FaUserMd, FaPlus, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

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
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [savingSettings, setSavingSettings] = useState(false);
  const router = useRouter();


  useEffect(() => {
    fetchUser();
    fetchAppointments();
  }, []);




  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.role === "DOCTOR") {
          fetchDoctorSettings();
        }
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchDoctorSettings = async () => {
    try {
      const res = await fetch("/api/doctor/settings");
      if (res.ok) {
        const data = await res.json();
        setStartTime(data.startTime);
        setEndTime(data.endTime);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime, endTime })
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings");
    } finally {
      setSavingSettings(false);
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

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">My Dashboard</h1>
            <p className="text-gray-400 mt-2">Manage your appointments and health records</p>
          </div>
          <Link href="/book">
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300">
              <FaPlus size={14} /> Book New Appointment
            </button>
          </Link>
        </div>

        {/* Doctor Settings Section */}
        {user?.role === "DOCTOR" && (
          <div className="glass border border-gray-800 rounded-2xl p-8 shadow-xl mb-8 animate-[slideUp_0.6s_ease-out]">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Availability Settings</h2>
            <p className="text-gray-400 mb-6">Set your working hours. Patients will only see available slots within these times.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full rounded-xl border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full rounded-xl border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                />
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}

        <div className="glass border border-gray-800 rounded-2xl p-8 shadow-xl animate-[slideUp_0.6s_ease-out]">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4">Upcoming Appointments</h2>

          {appointments.length === 0 ? (
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
              {appointments.map((apt) => (
                <div key={apt.id} className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gray-800/40 transition-colors group">
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
                  </div>
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

  if (status === "CONFIRMED") {
    styles = "bg-green-500/10 text-green-400 border-green-500/20";
    icon = <FaCheckCircle size={12} />;
  } else if (status === "PENDING") {
    styles = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    icon = <FaClock size={12} />;
  } else if (status === "CANCELLED") {
    styles = "bg-red-500/10 text-red-400 border-red-500/20";
    icon = <FaExclamationCircle size={12} />;
  }

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold w-full md:w-auto text-center border flex items-center justify-center gap-2 uppercase tracking-wider ${styles}`}>
      {icon}
      {status}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaUser,
  FaUserMd,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaCog,
  FaFileMedical,
  FaTimes,
  FaSave,
} from "react-icons/fa";

interface DoctorAppointment {
  id: string;
  dateTime: string;
  status: string;
  reason?: string | null;
  notes?: string | null;
  patient: {
    name: string | null;
    email: string;
  };
}

interface NoteFormData {
  title: string;
  content: string;
  category: "DIAGNOSIS" | "PRESCRIPTION" | "FOLLOW_UP" | "GENERAL";
  isConfidential: boolean;
}

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState<NoteFormData>({
    title: "",
    content: "",
    category: "GENERAL",
    isConfidential: false,
  });
  const [submittingNote, setSubmittingNote] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments/doctor");

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
          setError(data.message || "Failed to load appointments");
          return;
        }

        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch doctor appointments", err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/doctor/settings");
        if (res.ok) {
          const data = await res.json();
          setStartTime(data.startTime || "09:00");
          setEndTime(data.endTime || "17:00");
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    fetchAppointments();
    fetchSettings();
  }, [router]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime, endTime })
      });
      if (res.ok) {
        setShowSettings(false);
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

  const handleStatusChange = async (id: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    try {
      setActionLoadingId(id);

      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (res.status === 403) {
        router.push("/unauthorized");
        return;
      }

      if (!res.ok) {
        console.error("Failed to update appointment status");
        return;
      }

      const data = await res.json();
      const updated = data.appointment as DoctorAppointment;

      // If marking as completed, open notes modal
      if (status === "COMPLETED") {
        setSelectedAppointmentId(id);
        setShowNoteModal(true);
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      } else if (updated.status === "COMPLETED" || updated.status === "CANCELLED") {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      } else {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: updated.status } : apt))
        );
      }
    } catch (err) {
      console.error("Error updating appointment status", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenNoteModal = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setNoteForm({
      title: "",
      content: "",
      category: "GENERAL",
      isConfidential: false,
    });
    setShowNoteModal(true);
  };

  const handleSubmitNote = async () => {
    if (!selectedAppointmentId || !noteForm.title.trim() || !noteForm.content.trim()) {
      alert("Title and content are required");
      return;
    }

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointmentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });

      if (res.ok) {
        setShowNoteModal(false);
        setSelectedAppointmentId(null);
        setNoteForm({
          title: "",
          content: "",
          category: "GENERAL",
          isConfidential: false,
        });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse text-gray-400">
            Loading Doctor Dashboard...
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
          <Link
            href="/dashboard"
            className="text-blue-500 hover:text-blue-400 hover:underline"
          >
            Go back to main dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasAppointments = appointments.length > 0;

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Doctor Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              View and manage your upcoming appointments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/doctor/history"
              className="flex items-center gap-2 bg-gray-900/60 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold border border-gray-700 shadow-lg shadow-black/40 hover:shadow-gray-900 transition-all duration-300"
            >
              <FaCalendarAlt size={16} />
              History
            </Link>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-gray-900/60 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold border border-gray-700 shadow-lg shadow-black/40 hover:shadow-gray-900 transition-all duration-300"
            >
              <FaCog size={16} />
              Availability
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-2">Availability Settings</h2>
              <p className="text-gray-400 mb-6 text-sm">Set your working hours. Patients will only see available slots within these times.</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400">
              <FaCalendarAlt size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Upcoming
              </p>
              <p className="text-xl font-semibold text-white">
                {appointments.length}
              </p>
            </div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center text-yellow-400">
              <FaClock size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Pending
              </p>
              <p className="text-xl font-semibold text-white">
                {appointments.filter((a) => a.status === "PENDING").length}
              </p>
            </div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-green-400">
              <FaCheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Confirmed
              </p>
              <p className="text-xl font-semibold text-white">
                {appointments.filter((a) => a.status === "CONFIRMED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass border border-gray-800 rounded-2xl p-8 shadow-xl animate-[slideUp_0.6s_ease-out]">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4">
            Today&apos;s and upcoming appointments
          </h2>

          {!hasAppointments ? (
            <div className="text-center py-16 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                <FaCalendarAlt size={32} />
              </div>
              <p className="text-lg mb-2">You have no upcoming appointments.</p>
              <p className="text-sm text-gray-500">
                Once patients book with you, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gray-800/40 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 border border-blue-900/30">
                      <FaUser size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {apt.patient.name || "Patient"}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {apt.patient.email}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center text-gray-400 text-sm mt-3 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt
                            size={14}
                            className="text-gray-500"
                          />
                          <span>
                            {new Date(apt.dateTime).toLocaleDateString(
                              undefined,
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
                        <div className="flex items-center gap-2">
                          <FaClock size={14} className="text-gray-500" />
                          <span>
                            {new Date(apt.dateTime).toLocaleTimeString(
                              undefined,
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                      </div>
                      {(apt.reason || apt.notes) && (
                        <div className="mt-3 text-sm text-gray-400 space-y-1">
                          {apt.reason && (
                            <p>
                              <span className="font-semibold text-gray-300">
                                Reason:
                              </span>{" "}
                              {apt.reason}
                            </p>
                          )}
                          {apt.notes && (
                            <p>
                              <span className="font-semibold text-gray-300">
                                Notes:
                              </span>{" "}
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <StatusBadge status={apt.status} />
                    <div className="flex flex-wrap gap-2">
                      {apt.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(apt.id, "CONFIRMED")}
                            disabled={actionLoadingId === apt.id}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                          >
                            {actionLoadingId === apt.id ? "Updating..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                            disabled={actionLoadingId === apt.id}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                          >
                            {actionLoadingId === apt.id ? "Updating..." : "Cancel"}
                          </button>
                        </>
                      )}
                      {apt.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(apt.id, "COMPLETED")}
                            disabled={actionLoadingId === apt.id}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                          >
                            {actionLoadingId === apt.id ? "Updating..." : "Mark Completed"}
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                            disabled={actionLoadingId === apt.id}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                          >
                            {actionLoadingId === apt.id ? "Updating..." : "Cancel"}
                          </button>
                        </>
                      )}
                      {apt.status === "COMPLETED" && (
                        <button
                          onClick={() => handleOpenNoteModal(apt.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-1"
                        >
                          <FaFileMedical size={10} />
                          Add Note
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNoteModal(false)}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaFileMedical className="text-blue-400" />
                  Add Consultation Note
                </h2>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    className="block w-full rounded-xl border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g. Follow-up Instructions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["DIAGNOSIS", "PRESCRIPTION", "FOLLOW_UP", "GENERAL"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNoteForm({ ...noteForm, category: cat })}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${noteForm.category === cat
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
                          }`}
                      >
                        {cat.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Content *</label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    rows={6}
                    className="block w-full rounded-xl border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Enter detailed notes, instructions, prescriptions, etc."
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    id="isConfidential"
                    checked={noteForm.isConfidential}
                    onChange={(e) => setNoteForm({ ...noteForm, isConfidential: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-800"
                  />
                  <label htmlFor="isConfidential" className="text-sm font-medium text-gray-300 cursor-pointer">
                    Mark as confidential (only visible to healthcare providers)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-800">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNote}
                  disabled={submittingNote || !noteForm.title.trim() || !noteForm.content.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaSave size={14} />
                  {submittingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
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
  }

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold w-full md:w-auto text-center border flex items-center justify-center gap-2 uppercase tracking-wider ${styles}`}>
      {icon}
      {status}
    </span>
  );
}


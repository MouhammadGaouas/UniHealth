"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import DoctorCard from "@/components/DoctorCard";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import { FaClock, FaStethoscope, FaUserMd } from "react-icons/fa";

interface Doctor {
    id: string;
    specialty: string;
    bio: string | null;
    user: {
        name: string;
    };
}

interface AppointmentType {
    id: string;
    name: string;
    duration: number;
    price: number | null;
}

export default function BookingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Data
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
    const [bookedSlots, setBookedSlots] = useState<{ start: string; end: string }[]>([]);
    const [workHours, setWorkHours] = useState<{ start: string; end: string }>({ start: "09:00", end: "17:00" });

    // Selection
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState("");

    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (selectedDoctor) {
            fetchAppointmentTypes(selectedDoctor.id);
        }
    }, [selectedDoctor]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchAvailability(selectedDoctor.id, selectedDate);
        }
    }, [selectedDoctor, selectedDate]);

    const fetchDoctors = async () => {
        try {
            const res = await fetch("/api/doctors");
            if (res.ok) {
                const data = await res.json();
                setDoctors(data.doctors);
            } else {
                setError("Failed to load doctors. Please refresh the page.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load doctors. Please refresh the page.");
        }
    };

    const fetchAppointmentTypes = async (doctorId: string) => {
        try {
            const res = await fetch(`/api/doctors/appointment-types?doctorId=${doctorId}`);
            if (res.ok) {
                const data = await res.json();
                setAppointmentTypes(data.appointmentTypes);
            } else {
                setError("Failed to load appointment types.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load appointment types.");
        }
    };

    const fetchAvailability = async (doctorId: string, date: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/doctors/availability?doctorId=${doctorId}&date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setBookedSlots(data.bookedSlots);
                setWorkHours({ start: data.workDayStart, end: data.workDayEnd });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedDoctor) setStep(2);
        else if (step === 2 && selectedType) setStep(3);
        else if (step === 3 && selectedTime) setStep(4);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!selectedDoctor || !selectedTime || !selectedType) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/appointments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: selectedDoctor.id,
                    dateTime: selectedTime,
                    appointmentTypeId: selectedType.id,
                    reason,
                }),
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                setError(data.message || "Booking failed");
                if (res.status === 401) router.push("/auth/login");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Helper to calculate end time for display
    const getEndTime = () => {
        if (!selectedTime || !selectedType) return null;
        const start = new Date(selectedTime);
        return new Date(start.getTime() + selectedType.duration * 60000);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-12 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Book an Appointment</h1>
                    <p className="text-gray-400">Simple, fast, and secure booking for your healthcare needs.</p>

                    {/* Progress Steps */}
                    <div className="flex justify-center items-center mt-8 gap-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors
                                    ${step >= s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 border border-gray-700"}
                                `}>
                                    {s}
                                </div>
                                {s < 4 && <div className={`w-8 md:w-16 h-1 rounded-full mx-2 ${step > s ? "bg-blue-600" : "bg-gray-800"}`} />}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-10 md:gap-24 mt-2 text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray-500">
                        <span>Doctor</span>
                        <span>Type</span>
                        <span>Time</span>
                        <span>Confirm</span>
                    </div>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 md:p-10 shadow-xl shadow-gray-950/50 border border-gray-800 min-h-[500px]">

                    {/* Step 1: Select Doctor */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold text-white">Select a Specialist</h2>
                            <p className="text-gray-400 -mt-4">Choose from our team of experienced professionals.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {doctors.map((doc) => (
                                    <DoctorCard
                                        key={doc.id}
                                        doctor={doc}
                                        isSelected={selectedDoctor?.id === doc.id}
                                        onSelect={() => setSelectedDoctor(doc)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Appointment Type */}
                    {step === 2 && selectedDoctor && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center gap-4 border-b border-gray-800 pb-6 mb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl">
                                    <FaUserMd />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Selected Doctor</p>
                                    <h3 className="text-xl font-bold text-white">{selectedDoctor.user.name}</h3>
                                    <p className="text-xs text-blue-400">{selectedDoctor.specialty}</p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white">Choose Appointment Type</h2>
                            <p className="text-gray-400 -mt-4">Select the duration and type of consultation you need.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                {appointmentTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type)}
                                        className={`
                                            cursor-pointer p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group
                                            ${selectedType?.id === type.id
                                                ? "bg-blue-600/10 border-blue-500 shadow-blue-900/20 shadow-lg"
                                                : "bg-gray-800/30 border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-gray-900 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                                                <FaStethoscope size={20} />
                                            </div>
                                            {selectedType?.id === type.id && (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">{type.name}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                            <FaClock className="text-gray-500" />
                                            <span>{type.duration} Minutes</span>
                                        </div>

                                    </div>
                                ))}
                                {appointmentTypes.length === 0 && (
                                    <div className="col-span-3 text-center py-10 text-gray-500 bg-gray-800/20 rounded-xl border border-dashed border-gray-800">
                                        No appointment types defined for this doctor.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Select Time */}
                    {step === 3 && selectedDoctor && selectedType && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Select Availability</h2>
                                    <p className="text-gray-400">Showing 15-min slots for <strong>{selectedType.duration} min</strong> session.</p>
                                </div>
                                <div className="flex items-center gap-3 bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/30">
                                    <div className="text-right">
                                        <p className="text-xs text-blue-400 font-semibold uppercase">Duration</p>
                                        <p className="text-sm font-bold text-white">{selectedType.duration} Mins</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                        <FaClock />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 space-y-2">
                                    <label className="block text-sm font-bold text-gray-300">Pick a Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="block w-full rounded-xl border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedTime(null);
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 px-1">Select a date to view available time slots.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Available Start Times</label>
                                    {selectedDate ? (
                                        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800">
                                            {loading ? (
                                                <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Checking availability...
                                                </div>
                                            ) : (
                                                <TimeSlotGrid
                                                    date={new Date(selectedDate)}
                                                    bookedSlots={bookedSlots}
                                                    selectedTime={selectedTime}
                                                    onSelectTime={setSelectedTime}
                                                    duration={selectedType.duration}
                                                    startTime={workHours.start}
                                                    endTime={workHours.end}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-800/30 rounded-xl border border-dashed border-gray-700 text-gray-500 text-sm">
                                            Please select a date first
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && selectedDoctor && selectedTime && selectedType && (
                        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white">Review & Confirm</h2>
                                <p className="text-gray-400">Please review your appointment details before confirming.</p>
                            </div>

                            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                                <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
                                    <h3 className="font-bold">Appointment Summary</h3>
                                    <span className="text-blue-200 text-sm">Pending Confirmation</span>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Doctor</p>
                                            <p className="font-bold text-lg text-white">{selectedDoctor.user.name}</p>
                                            <p className="text-sm text-blue-400">{selectedDoctor.specialty}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Type</p>
                                            <p className="font-bold text-lg text-white">{selectedType.name}</p>
                                            <p className="text-sm text-blue-400">{selectedType.duration} Mins</p>
                                        </div>
                                        <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Date</p>
                                                <p className="font-bold text-white">{format(new Date(selectedTime), "MMMM d, yyyy")}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Time</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-white">{format(new Date(selectedTime), "h:mm a")}</p>
                                                    <span className="text-gray-500">→</span>
                                                    <p className="text-gray-400 text-sm">{getEndTime() ? format(getEndTime()!, "h:mm a") : ""}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-6">
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Reason for Visit (Optional)</label>
                                        <textarea
                                            rows={3}
                                            className="block w-full rounded-xl border-gray-700 bg-gray-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                            placeholder="Briefly describe your symptoms or reason for visit..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-900/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium border border-red-900/50">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full md:w-auto px-12 py-4 rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : "Confirm Appointment"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-12 pt-8 border-t border-gray-800">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${step === 1
                                ? "invisible"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            ← Back
                        </button>

                        {step < 4 && (
                            <button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !selectedDoctor) ||
                                    (step === 2 && !selectedType) ||
                                    (step === 3 && !selectedTime)
                                }
                                className="px-8 py-3 rounded-full bg-white text-gray-900 text-sm font-bold hover:bg-gray-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                            >
                                Next Step →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

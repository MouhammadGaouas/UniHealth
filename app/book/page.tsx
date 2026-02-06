"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookingProgress from "@/components/booking/BookingProgress";
import DoctorSelection from "@/components/booking/DoctorSelection";
import AppointmentTypeSelection from "@/components/booking/AppointmentTypeSelection";
import TimeSelection from "@/components/booking/TimeSelection";
import BookingConfirmation from "@/components/booking/BookingConfirmation";

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

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-12 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Book an Appointment</h1>
                    <p className="text-gray-400">Simple, fast, and secure booking for your healthcare needs.</p>

                    {/* Progress Steps */}
                    <BookingProgress step={step} />

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
                        <DoctorSelection
                            doctors={doctors}
                            selectedDoctor={selectedDoctor}
                            onSelect={setSelectedDoctor}
                        />
                    )}

                    {/* Step 2: Select Appointment Type */}
                    {step === 2 && selectedDoctor && (
                        <AppointmentTypeSelection
                            selectedDoctor={selectedDoctor}
                            appointmentTypes={appointmentTypes}
                            selectedType={selectedType}
                            onSelect={setSelectedType}
                        />
                    )}

                    {/* Step 3: Select Time */}
                    {step === 3 && selectedDoctor && selectedType && (
                        <TimeSelection
                            appointmentType={selectedType}
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            loading={loading}
                            bookedSlots={bookedSlots}
                            selectedTime={selectedTime}
                            onTimeSelect={setSelectedTime}
                            workHours={workHours}
                        />
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && selectedDoctor && selectedTime && selectedType && (
                        <BookingConfirmation
                            selectedDoctor={selectedDoctor}
                            selectedType={selectedType}
                            selectedTime={selectedTime}
                            reason={reason}
                            onReasonChange={setReason}
                            loading={loading}
                            error={error}
                            onConfirm={handleSubmit}
                        />
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


import React from "react";
import { format } from "date-fns";

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

interface BookingConfirmationProps {
    selectedDoctor: Doctor;
    selectedType: AppointmentType;
    selectedTime: string;
    reason: string;
    onReasonChange: (reason: string) => void;
    loading: boolean;
    error: string;
    onConfirm: () => void;
}

export default function BookingConfirmation({
    selectedDoctor,
    selectedType,
    selectedTime,
    reason,
    onReasonChange,
    loading,
    error,
    onConfirm
}: BookingConfirmationProps) {
    // Helper to calculate end time for display
    const getEndTime = () => {
        if (!selectedTime || !selectedType) return null;
        const start = new Date(selectedTime);
        return new Date(start.getTime() + selectedType.duration * 60000);
    };

    return (
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
                            onChange={(e) => onReasonChange(e.target.value)}
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
                    onClick={onConfirm}
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
    );
}

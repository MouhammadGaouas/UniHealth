
import React from "react";
import { FaClock } from "react-icons/fa";
import TimeSlotGrid from "@/components/TimeSlotGrid";

interface AppointmentType {
    id: string;
    name: string;
    duration: number;
    price: number | null;
}

interface TimeSelectionProps {
    appointmentType: AppointmentType;
    selectedDate: string;
    onDateChange: (date: string) => void;
    loading: boolean;
    bookedSlots: { start: string; end: string }[];
    selectedTime: string | null;
    onTimeSelect: (time: string | null) => void;
    workHours: { start: string; end: string };
}

export default function TimeSelection({
    appointmentType,
    selectedDate,
    onDateChange,
    loading,
    bookedSlots,
    selectedTime,
    onTimeSelect,
    workHours
}: TimeSelectionProps) {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Select Availability</h2>
                    <p className="text-gray-400">Showing 15-min slots for <strong>{appointmentType.duration} min</strong> session.</p>
                </div>
                <div className="flex items-center gap-3 bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/30">
                    <div className="text-right">
                        <p className="text-xs text-blue-400 font-semibold uppercase">Duration</p>
                        <p className="text-sm font-bold text-white">{appointmentType.duration} Mins</p>
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
                            onDateChange(e.target.value);
                            onTimeSelect(null);
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
                                    onSelectTime={onTimeSelect}
                                    duration={appointmentType.duration}
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
    );
}

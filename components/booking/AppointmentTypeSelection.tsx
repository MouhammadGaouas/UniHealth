
import React from "react";
import { FaUserMd, FaStethoscope, FaClock } from "react-icons/fa";

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

interface AppointmentTypeSelectionProps {
    selectedDoctor: Doctor;
    appointmentTypes: AppointmentType[];
    selectedType: AppointmentType | null;
    onSelect: (type: AppointmentType) => void;
}

export default function AppointmentTypeSelection({
    selectedDoctor,
    appointmentTypes,
    selectedType,
    onSelect
}: AppointmentTypeSelectionProps) {
    return (
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
                        onClick={() => onSelect(type)}
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
    );
}

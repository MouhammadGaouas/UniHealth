
import React from "react";
import DoctorCard from "@/components/DoctorCard";

interface Doctor {
    id: string;
    specialty: string;
    bio: string | null;
    user: {
        name: string;
    };
}

interface DoctorSelectionProps {
    doctors: Doctor[];
    selectedDoctor: Doctor | null;
    onSelect: (doctor: Doctor) => void;
}

export default function DoctorSelection({ doctors, selectedDoctor, onSelect }: DoctorSelectionProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">Select a Specialist</h2>
            <p className="text-gray-400 -mt-4">Choose from our team of experienced professionals.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {doctors.map((doc) => (
                    <DoctorCard
                        key={doc.id}
                        doctor={doc}
                        isSelected={selectedDoctor?.id === doc.id}
                        onSelect={() => onSelect(doc)}
                    />
                ))}
            </div>
        </div>
    );
}

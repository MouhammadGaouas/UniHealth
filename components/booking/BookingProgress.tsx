
import React from "react";

interface BookingProgressProps {
    step: number;
}

export default function BookingProgress({ step }: BookingProgressProps) {
    return (
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
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
    id: string;
    user: {
        name: string;
    };
}

export default function BookingPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        const res = await fetch("/api/doctors");
        if (res.ok) {
            const data = await res.json();
            setDoctors(data.doctors);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/appointments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: selectedDoctor,
                    dateTime,
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
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-20">
            <div className="w-full max-w-lg space-y-8 rounded-xl bg-gray-900/50 p-8 border border-gray-800">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white text-center">
                        Book an Appointment
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Select Doctor</label>
                            <select
                                required
                                className="block w-full rounded-md border-0 bg-gray-800 py-2 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6 px-4"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                            >
                                <option value="">Choose a doctor...</option>
                                {doctors.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="block w-full rounded-md border-0 bg-gray-800 py-2 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6 px-4"
                                value={dateTime}
                                onChange={(e) => setDateTime(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Reason for Visit</label>
                            <textarea
                                required
                                rows={3}
                                className="block w-full rounded-md border-0 bg-gray-800 py-2 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6 px-4"
                                placeholder="Briefly describe your symptoms or reason..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
}

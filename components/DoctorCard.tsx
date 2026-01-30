// Removed unused Prisma import to avoid type errors

interface DoctorCardProps {
    doctor: {
        id: string;
        specialty: string;
        bio: string | null;
        user: {
            name: string | null; // Allow null to match API response/Prisma type
        };
    };
    isSelected: boolean;
    onSelect: () => void;
}

export default function DoctorCard({ doctor, isSelected, onSelect }: DoctorCardProps) {
    return (
        <div
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 group relative overflow-hidden ${isSelected
                ? "border-blue-500 bg-blue-900/20 ring-1 ring-blue-500"
                : "border-gray-800 bg-gray-900/50 hover:border-blue-500/50 hover:bg-gray-800"
                }`}
            onClick={onSelect}
        >
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {doctor.user.name?.[0] || "D"}
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg">{doctor.user.name || "Unknown Doctor"}</h3>
                    <p className="text-blue-400 text-sm">{doctor.specialty}</p>
                </div>
            </div>

            {doctor.bio && (
                <p className="text-gray-400 text-sm line-clamp-2">
                    {doctor.bio}
                </p>
            )}

            <div className="flex justify-end mt-auto">
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                >
                    {isSelected ? "Selected" : "Select Doctor"}
                </button>
            </div>
        </div>
    );
}

import { format } from 'date-fns';

interface TimeSlotGridProps {
    date: Date;
    bookedSlots: { start: string; end: string }[];
    selectedTime: string | null;
    onSelectTime: (time: string) => void;
    duration?: number;
    startTime?: string;
    endTime?: string;
}

export default function TimeSlotGrid({ date, bookedSlots, selectedTime, onSelectTime, duration = 30, startTime = "09:00", endTime = "17:00" }: TimeSlotGridProps) {
    // Parse startTime and endTime (format: "HH:MM")
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Generate 15-minute slots from startTime to endTime
    const slots = [];
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    for (let totalMinutes = startTotalMinutes; totalMinutes < endTotalMinutes; totalMinutes += 15) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0, 0);
        slots.push(slotDate);
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slots.map((slot) => {
                // Determine if this specific slot + duration overlaps with any booked interval
                const slotStart = slot.getTime();
                const slotEnd = slotStart + duration * 60000;

                const isDisabled = bookedSlots.some((booked: any) => {
                    const bookedStart = new Date(booked.start).getTime();
                    const bookedEnd = new Date(booked.end).getTime();
                    return (slotStart < bookedEnd && slotEnd > bookedStart);
                });

                const timeString = format(slot, 'HH:mm');
                const isoString = slot.toISOString();
                const selected = selectedTime === isoString;

                return (
                    <button
                        key={isoString}
                        disabled={isDisabled}
                        onClick={() => onSelectTime(isoString)}
                        className={`
              py-2 px-3 rounded-md text-xs font-bold transition-all
              ${isDisabled
                                ? "bg-red-900/10 text-red-500/50 cursor-not-allowed border border-transparent"
                                : selected
                                    ? "bg-blue-600 text-white border border-blue-500 shadow-md transform scale-105"
                                    : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white"
                            }
            `}
                    >
                        {timeString}
                    </button>
                );
            })}
        </div>
    );
}

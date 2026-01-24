import React from "react";
import { IconType } from "react-icons";

interface ServiceCardProps {
    title: string;
    description: string;
    icon: IconType;
    color: "blue" | "green" | "purple" | "red";
    className?: string;
}

export default function ServiceCard({
    title,
    description,
    icon: Icon,
    color,
    className = "",
}: ServiceCardProps) {
    const colorClasses = {
        blue: {
            border: "hover:border-blue-500",
            icon: "text-blue-500 group-hover:text-blue-400",
        },
        green: {
            border: "hover:border-green-500",
            icon: "text-green-500 group-hover:text-green-400",
        },
        purple: {
            border: "hover:border-purple-500",
            icon: "text-purple-500 group-hover:text-purple-400",
        },
        red: {
            border: "hover:border-red-500",
            icon: "text-red-500 group-hover:text-red-400",
        },
    };

    const selectedColor = colorClasses[color];

    return (
        <div
            className={`flex bg-gray-900/50 border border-gray-800 ${selectedColor.border} hover:scale-105 transition duration-300 rounded-xl p-8 text-white text-xl items-center text-center justify-center flex-col gap-4 group cursor-pointer ${className}`}
        >
            <Icon size={60} className={`${selectedColor.icon}`} />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-base text-gray-400">{description}</p>
        </div>
    );
}

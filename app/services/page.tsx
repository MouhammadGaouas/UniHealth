"use client";

import { FaUserMd, FaHeartbeat, FaBrain, FaPrescriptionBottleAlt, FaHandsHelping, FaLaptopMedical } from "react-icons/fa";

export default function ServicesPage() {
  const services = [
    {
      title: "Primary Care",
      description: "General medical services for everyday health needs.",
      details: "Our primary care physicians provide comprehensive medical care, including routine check-ups, illness treatment, and preventive care.",
      icon: <FaUserMd size={40} />,
      color: "bg-blue-500",
      textColor: "text-blue-400"
    },
    {
      title: "Mental Wellness",
      description: "Support for your mental and emotional well-being.",
      details: "Licensed counselors available for individual sessions, group therapy, and stress management workshops tailored for students.",
      icon: <FaBrain size={40} />,
      color: "bg-purple-500",
      textColor: "text-purple-400"
    },
    {
      title: "Urgent Care",
      description: "Immediate attention for non-life-threatening conditions.",
      details: "Walk-in services for minor injuries, infections, and sudden illnesses that require prompt attention.",
      icon: <FaHeartbeat size={40} />,
      color: "bg-red-500",
      textColor: "text-red-400"
    },
    {
      title: "Pharmacy Services",
      description: "Convenient access to medications and expert advice.",
      details: "On-campus pharmacy offering prescription filling, over-the-counter medications, and medication counseling.",
      icon: <FaPrescriptionBottleAlt size={40} />,
      color: "bg-green-500",
      textColor: "text-green-400"
    },
    {
      title: "Health Education",
      description: "Workshops and resources to promote healthy living.",
      details: "Educational programs on nutrition, sexual health, substance abuse prevention, and holistic wellness.",
      icon: <FaHandsHelping size={40} />,
      color: "bg-yellow-500",
      textColor: "text-yellow-400"
    },
    {
      title: "Telehealth",
      description: "Virtual appointments from the comfort of your room.",
      details: "Connect with healthcare providers via secure video calls for medical advice, follow-ups, and counseling.",
      icon: <FaLaptopMedical size={40} />,
      color: "bg-cyan-500",
      textColor: "text-cyan-400"
    }
  ];

  return (
    <main className="min-h-screen bg-[#020617] relative overflow-hidden font-sans pt-20">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Our <span className="text-gradient">Services</span>
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
          Comprehensive healthcare designed specifically for the university community.
          From physical check-ups to mental health support, we've got you covered.
        </p>
      </section>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="glass p-8 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all duration-300 group hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-2xl ${service.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`${service.textColor}`}>
                  {service.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
                {service.description}
              </p>
              <p className="text-gray-400 leading-relaxed">
                {service.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-blue-600/5"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-6">Need to see a doctor?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Scheduling an appointment is easy and can be done entirely online without any hassle.
          </p>
          <a href="/book">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
              Book an Appointment Now
            </button>
          </a>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { FaHandHoldingMedical, FaHeartbeat, FaFileMedical, FaAmbulance, FaArrowRight } from "react-icons/fa";
import ServiceCard from "../components/ServiceCard";

export default function Home() {
  const services = [
    {
      title: "Online Counseling",
      description: "Virtual mental health support available 24/7 from the comfort of your room.",
      icon: FaHandHoldingMedical,
      color: "blue" as const,
    },
    {
      title: "Wellness Workshops",
      description: "Join group sessions focused on stress management, yoga, and healthy living.",
      icon: FaHeartbeat,
      color: "green" as const,
    },
    {
      title: "Medical Records",
      description: "Securely access your health history, vaccination records, and prescriptions.",
      icon: FaFileMedical,
      color: "purple" as const,
      className: "",
    },
  ];

  return (
    <main className="min-h-screen bg-[#020617] font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Hero Section */}
      <div className="relative flex items-center w-full justify-center min-h-screen flex-col text-center gap-8 overflow-hidden pt-20">

        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDelay: "4s" }}></div>

        <div className="relative z-10 max-w-5xl px-4 animate-[fadeIn_1s_ease-out]">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium backdrop-blur-sm">
            🎉 New: 24/7 Telehealth Access Now Available
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 leading-tight mb-6">
            University Health Services <br />
            <span className="text-gradient">Your Wellbeing Matters</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Access mental health support, urgent care, and wellness resources directly from campus. Simple, confidential, and 100% free for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/book">
              <button className="group relative flex items-center gap-2 text-white text-lg font-semibold bg-blue-600 hover:bg-blue-500 transition-all px-8 py-3.5 rounded-full shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 active:scale-95">
                Book Appointment
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/about">
              <button className="text-gray-300 text-lg font-semibold border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-all px-8 py-3.5 rounded-full hover:border-gray-500">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We offer a wide range of medical and wellness services designed to help you thrive during your university journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                color={service.color}
                className={service.className}
              />
            ))}
            {/* Featured Urgent Care Card */}
            <div className="md:col-span-3 flex bg-gradient-to-r from-red-900/40 to-red-900/10 border border-red-900/30 hover:border-red-500/50 transition duration-300 rounded-2xl p-8 backdrop-blur-sm group cursor-pointer relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 text-red-500/10 rotate-12 transform scale-150">
                <FaAmbulance size={200} />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <FaAmbulance size={30} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Urgent Care Integration</h3>
                  <p className="text-gray-400">Immediate medical attention for non-life-threatening injuries and illnesses. Walk-ins welcome during operational hours.</p>
                </div>
                <Link href="/services">
                  <button className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to prioritize your health?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Join thousands of students who trust UniHealth for their physical and mental wellbeing.
          </p>
          <Link href="/auth/login">
            <button className="bg-white text-blue-900 hover:bg-gray-100 text-xl font-bold px-12 py-4 rounded-full shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300">
              Get Started Now
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}

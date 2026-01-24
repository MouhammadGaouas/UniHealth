"use client";

import { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log("Form submitted:", formData);
    alert("Thank you for reaching out! We will get back to you shortly.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#020617] relative overflow-hidden font-sans pt-20">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Get in <span className="text-gradient">Touch</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          We're here to help. Whether you have questions about our services, need technical support, or just want to give feedback, we'd love to hear from you.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>

            <div className="grid gap-6">
              <ContactCard
                icon={<FaPhoneAlt />}
                title="Phone"
                content="+1 (800) 123-4567"
                subContent="Mon-Fri from 8am to 5pm"
                color="text-blue-400"
                bgColor="bg-blue-500/10"
              />
              <ContactCard
                icon={<FaEnvelope />}
                title="Email"
                content="support@unihealth.edu"
                subContent="Online support 24/7"
                color="text-cyan-400"
                bgColor="bg-cyan-500/10"
              />
              <ContactCard
                icon={<FaMapMarkerAlt />}
                title="Office"
                content="University Health Center"
                subContent="Building B, Room 204"
                color="text-purple-400"
                bgColor="bg-purple-500/10"
              />
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 rounded-2xl overflow-hidden glass border border-gray-800 relative group cursor-pointer mt-8">
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center group-hover:bg-gray-900/40 transition-colors">
                <p className="text-gray-400 flex items-center gap-2">
                  <FaMapMarkerAlt /> View on Google Maps
                </p>
              </div>
              {/* Decorative map grid lines */}
              <div className="w-full h-full opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass rounded-2xl p-8 md:p-10 border border-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Send Message
                <FaPaperPlane className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function ContactCard({ icon, title, content, subContent, color, bgColor }: any) {
  return (
    <div className="glass p-6 rounded-xl border border-gray-800 flex items-start gap-4 hover:bg-gray-800/50 transition-colors">
      <div className={`w-12 h-12 rounded-lg ${bgColor} ${color} flex items-center justify-center text-xl shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-gray-300 font-medium">{content}</p>
        <p className="text-gray-500 text-sm mt-1">{subContent}</p>
      </div>
    </div>
  )
}

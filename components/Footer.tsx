import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-[#020617] border-t border-gray-800 text-gray-300 py-16 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="text-3xl font-bold text-gradient">
                                UniHealth
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                            Dedicated to providing accessible, confidential, and high-quality mental health and wellness resources for specialized university students.
                        </p>
                        <div className="flex space-x-4">
                            <SocialLink href="#" icon={<FaFacebook size={20} />} hoverColor="hover:text-blue-500" />
                            <SocialLink href="#" icon={<FaTwitter size={20} />} hoverColor="hover:text-blue-400" />
                            <SocialLink href="#" icon={<FaInstagram size={20} />} hoverColor="hover:text-pink-500" />
                            <SocialLink href="#" icon={<FaLinkedin size={20} />} hoverColor="hover:text-blue-600" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Quick Links
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/services" label="Services" />
                            <FooterLink href="/about" label="About Us" />
                            <FooterLink href="/contact" label="Contact" />
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Resources
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-cyan-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink href="#" label="Help Center" />
                            <FooterLink href="#" label="Privacy Policy" />
                            <FooterLink href="#" label="Terms of Service" />
                            <FooterLink href="#" label="Emergency Contacts" />
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Contact Us
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-purple-500 rounded-full"></span>
                        </h3>
                        <div className="space-y-4 text-sm text-gray-400">
                            <p>123 University Ave,<br />Campus Center, Building B</p>
                            <p>
                                <span className="block text-gray-500 text-xs uppercase tracking-wide">Emergency Line</span>
                                <a href="tel:+18001234567" className="text-white hover:text-blue-400 transition-colors font-medium text-base">1-800-123-4567</a>
                            </p>
                            <p>
                                <span className="block text-gray-500 text-xs uppercase tracking-wide">Email Support</span>
                                <a href="mailto:support@unihealth.edu" className="text-white hover:text-blue-400 transition-colors">support@unihealth.edu</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} UniHealth. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <FaHeart className="text-red-500 animate-pulse" /> for Students
                    </p>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, hoverColor }: { href: string; icon: React.ReactNode; hoverColor: string }) {
    return (
        <Link
            href={href}
            className={`w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 hover:border-gray-700 ${hoverColor}`}
        >
            {icon}
        </Link>
    );
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link href={href} className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-cyan-400 transition-colors"></span>
                {label}
            </Link>
        </li>
    );
}

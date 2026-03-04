"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBuilding,
  FaUsers,
  FaCalendarCheck,
  FaSearch,
  FaArrowLeft,
  FaEye,
  FaBan,
  FaCheck,
} from "react-icons/fa";

interface Organization {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  subscription: {
    planTier: string;
    status: string;
    maxDoctors: number;
    maxAppointmentsPerMonth: number;
  } | null;
  _count: {
    doctors: number;
    locations: number;
  };
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchOrganizations();
  }, [searchQuery, typeFilter]);

  const fetchOrganizations = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/admin/organizations?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Failed to fetch organizations", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = organizations.filter((org) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return org.name.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse text-gray-400">Loading Organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pt-28 pb-16 px-4 md:px-8 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin"
              className="w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"
            >
              <FaArrowLeft size={14} />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                <FaBuilding className="text-blue-400" size={32} />
                Organizations
              </h1>
              <p className="text-gray-400 mt-2">Manage all registered healthcare organizations</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by organization name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-xl border border-gray-700 bg-gray-900/50 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Types</option>
              <option value="HOSPITAL">Hospitals</option>
              <option value="CLINIC">Clinics</option>
              <option value="LABORATORY">Laboratories</option>
              <option value="PHARMACY">Pharmacies</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400">
              <FaBuilding size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Orgs</p>
              <p className="text-xl font-semibold text-white">{organizations.length}</p>
            </div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
              <FaUsers size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Doctors</p>
              <p className="text-xl font-semibold text-white">
                {organizations.reduce((sum, org) => sum + org._count.doctors, 0)}
              </p>
            </div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center text-yellow-400">
              <FaBuilding size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Locations</p>
              <p className="text-xl font-semibold text-white">
                {organizations.reduce((sum, org) => sum + org._count.locations, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="glass border border-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
            Registered Organizations
            <span className="text-gray-500 text-base font-normal ml-3">
              ({filtered.length} results)
            </span>
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                <FaBuilding size={32} />
              </div>
              <p className="text-lg mb-2">No organizations found.</p>
              <p className="text-sm text-gray-600">
                {searchQuery ? "Try adjusting your search or filter." : "Organizations will appear here once registered."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((org) => (
                <div
                  key={org.id}
                  className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 border border-blue-900/30">
                        <FaBuilding size={26} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{org.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-semibold border border-blue-500/20">
                            {org.type.replace("_", " ")}
                          </span>
                          <span>•</span>
                          <span>
                            {org.subscription?.planTier || "STARTER"} Plan
                          </span>
                          <span>•</span>
                          <span className="text-gray-500">
                            Registered {new Date(org.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaUsers size={10} /> {org._count.doctors} Doctors
                          </span>
                          <span className="flex items-center gap-1">
                            <FaBuilding size={10} /> {org._count.locations} Locations
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/admin/organizations/${org.id}`}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors flex items-center gap-1"
                      >
                        <FaEye size={10} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Activity, TrendingUp, Zap, Settings, BarChart2, Database, ArrowUpRight, Search, LayoutGrid } from "lucide-react";
import UserWrapper from "../Wrappers/UserWrapper";
import { useUserDeviceSolutions } from "../../hooks/useUserDeviceSolutions";
import { useParams, useNavigate } from "react-router-dom";
import { SolutionsSkeleton } from "../../components/DeviceLoader";

const getSolutionIcon = (solutionName: string) => {
  const name = solutionName.toLowerCase();
  if (name.includes('monitoring') || name.includes('analysis')) return Activity;
  if (name.includes('optimization') || name.includes('performance')) return TrendingUp;
  if (name.includes('alert') || name.includes('detection')) return Zap;
  if (name.includes('maintenance') || name.includes('service')) return Settings;
  return BarChart2;
};

export const SolutionsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { solutions = [], loading, error } = useUserDeviceSolutions(userId || "");
  const [searchTerm, setSearchTerm] = useState("");

  const totalMachines = solutions.reduce((sum, item) => sum + item.freq, 0);
  const totalSolutions = solutions.length;
  const avgPerSolution = totalSolutions > 0 ? Math.round(totalMachines / totalSolutions) : 0;

  const filteredSolutions = solutions.filter(({ solutionName, solutionType }) => {
    const name = solutionName || (solutionType ? atob(solutionType) : "");
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <UserWrapper>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">

          {/* Pro Header with Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Solutions
              </h1>
              <p className="text-[#86868B] dark:text-[#86868B] mt-2 font-medium">
                Manage your intelligent ecosystem
              </p>
            </div>

            <div className="relative group w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#0071E3] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-xl leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] sm:text-sm transition-all shadow-sm"
                placeholder="Filter solutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Bar (High Density) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2C2C2E] mb-10 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#2C2C2E]">
              <div className="p-6 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#232325] transition-colors">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <LayoutGrid className="w-6 h-6 text-[#0071E3]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Active Solutions</p>
                  <p className="text-2xl font-bold text-[#1D1D1F] dark:text-white mt-0.5">{totalSolutions}</p>
                </div>
              </div>

              <div className="p-6 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#232325] transition-colors">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Total Devices</p>
                  <p className="text-2xl font-bold text-[#1D1D1F] dark:text-white mt-0.5">{totalMachines}</p>
                </div>
              </div>

              <div className="p-6 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-[#232325] transition-colors">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Avg. Density</p>
                  <p className="text-2xl font-bold text-[#1D1D1F] dark:text-white mt-0.5">{avgPerSolution} <span className="text-sm font-normal text-gray-400">/ sol</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {searchTerm ? `Results for "${searchTerm}"` : 'Deployed Modules'}
              </h2>
              <span className="text-xs font-medium text-[#86868B] bg-gray-100 dark:bg-[#1C1C1E] px-2.5 py-1 rounded-md">
                {filteredSolutions.length} found
              </span>
            </div>

            {loading ? (
              <SolutionsSkeleton />
            ) : error ? (
              <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                <p className="text-red-700 dark:text-red-400 font-medium">Error loading solutions</p>
                <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
              </div>
            ) : filteredSolutions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map(({ solutionType, freq, solutionName }) => {
                  const displayName = solutionName || (solutionType ? atob(solutionType) : "Solution");
                  const Icon = getSolutionIcon(displayName);
                  const coverage = totalMachines > 0 ? Math.round((freq / totalMachines) * 100) : 0;

                  return (
                    <div
                      key={solutionType}
                      onClick={() => navigate(`/user/${userId}/solutions/${atob(solutionType)}`)}
                      className="group relative bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#2C2C2E] hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl group-hover:bg-[#0071E3] transition-colors duration-300">
                          <Icon className="w-6 h-6 text-[#1D1D1F] dark:text-white group-hover:text-white transition-colors" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowUpRight className="w-5 h-5 text-[#0071E3]" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-[#1D1D1F] dark:text-white mb-1 tracking-tight truncate">
                          {displayName}
                        </h3>
                        <p className="text-sm font-medium text-[#86868B] dark:text-[#98989D] mb-4">
                          {freq} Device{freq !== 1 ? 's' : ''} connected
                        </p>

                        {/* Pro Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
                            <span>Fleet Share</span>
                            <span>{coverage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1D1D1F] dark:bg-white rounded-full group-hover:bg-[#0071E3] transition-colors duration-300"
                              style={{ width: `${coverage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-dashed border-gray-200 dark:border-[#2C2C2E]">
                <div className="w-12 h-12 bg-gray-50 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">No solutions found</h3>
                <p className="text-xs text-[#86868B] mt-1">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserWrapper>
  );
};


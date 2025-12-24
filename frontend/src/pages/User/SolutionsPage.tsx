import { Activity, TrendingUp, Zap, Settings, BarChart2, ChevronRight, Database, ArrowUpRight } from "lucide-react";
import UserWrapper from "../Wrappers/UserWrapper";
import { useUserDeviceSolutions } from "../../hooks/useUserDeviceSolutions";
import { useParams, useNavigate } from "react-router-dom";
import SolutionTableSkeleton from "../../components/DeviceLoader";

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
  const totalMachines = solutions.reduce((sum, item) => sum + item.freq, 0);
  const totalSolutions = solutions.length;

  return (
    <UserWrapper>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
              Solutions
            </h1>
            <p className="text-lg text-[#86868B] dark:text-[#86868B]">
              Monitor and analyze machine data across your deployment.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Total Solutions', value: totalSolutions, icon: BarChart2, color: 'text-blue-500' },
              { label: 'Total Machines', value: totalMachines, icon: Database, color: 'text-purple-500' },
              { label: 'Avg per Solution', value: totalSolutions > 0 ? Math.round(totalMachines / totalSolutions) : 0, icon: TrendingUp, color: 'text-green-500' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-transparent dark:border-[#2C2C2E] hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#86868B] dark:text-[#98989D] mb-1">{stat.label}</p>
                    <p className="text-3xl font-semibold text-[#1D1D1F] dark:text-white tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Solutions Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Deployed Solutions</h2>
              <span className="px-3 py-1 bg-white dark:bg-[#1C1C1E] text-xs font-medium text-[#86868B] rounded-full shadow-sm">
                {totalSolutions} Active
              </span>
            </div>

            {loading && (
              <div className="p-6 bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-sm">
                <SolutionTableSkeleton />
              </div>
            )}

            {error && (
              <div className="p-6 bg-[#FEF2F2] dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl">
                <p className="text-red-700 dark:text-red-400 font-medium pb-1">Error loading solutions</p>
                <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
              </div>
            )}

            {!loading && !error && solutions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map(({ solutionType, freq, solutionName }) => {
                  const displayName = solutionName || (solutionType ? atob(solutionType) : "Solution");
                  const Icon = getSolutionIcon(displayName);
                  const coverage = totalMachines > 0 ? Math.round((freq / totalMachines) * 100) : 0;

                  return (
                    <div
                      key={solutionType}
                      className="group bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-transparent dark:border-[#2C2C2E] relative overflow-hidden"
                      onClick={() => navigate(`/user/${userId}/solutions/${atob(solutionType)}`)}
                    >
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpRight className="w-5 h-5 text-[#0071E3]" />
                      </div>

                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="w-12 h-12 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0071E3] transition-colors duration-300">
                            <Icon className="w-6 h-6 text-[#0071E3] group-hover:text-white transition-colors duration-300" />
                          </div>

                          <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-white mb-2 line-clamp-1" title={displayName}>
                            {displayName}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-[#86868B] dark:text-[#98989D] mb-6">
                            <span>{freq} Machine{freq !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{coverage}% Fleet</span>
                          </div>
                        </div>

                        {/* Coverage Indicator */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-[#86868B] dark:text-[#98989D]">Coverage</span>
                            <span className="text-[#1D1D1F] dark:text-white">{coverage}%</span>
                          </div>
                          <div className="w-full bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#0071E3] h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${coverage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !error && solutions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-sm dashed border-2 border-gray-100 dark:border-[#2C2C2E]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mb-4">
                  <BarChart2 className="w-8 h-8 text-[#0071E3]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-white mb-1">No solutions configured</h3>
                <p className="text-[#86868B] text-center max-w-sm">
                  Configure analysis solutions to monitor and analyze your machine performance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserWrapper>
  );
};


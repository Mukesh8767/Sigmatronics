import { Activity, TrendingUp, Zap, Settings, BarChart2, ChevronRight, Database } from "lucide-react";
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
      <div className="min-h-screen bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#16191f] mb-1">Solutions</h1>
            <p className="text-sm text-[#545b64]">
              Monitor and analyze machine data across all deployed solutions
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#545b64] font-medium mb-0.5">Total Solutions</p>
                  <p className="text-xl font-semibold text-[#16191f]">{totalSolutions}</p>
                </div>
                <div className="p-2 bg-[#f0f5ff] rounded">
                  <BarChart2 className="w-4 h-4 text-[#0073bb]" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#545b64] font-medium mb-0.5">Total Machines</p>
                  <p className="text-xl font-semibold text-[#16191f]">{totalMachines}</p>
                </div>
                <div className="p-2 bg-[#f0f5ff] rounded">
                  <Database className="w-4 h-4 text-[#0073bb]" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#545b64] font-medium mb-0.5">Avg per Solution</p>
                  <p className="text-xl font-semibold text-[#16191f]">
                    {totalSolutions > 0 ? Math.round(totalMachines / totalSolutions) : 0}
                  </p>
                </div>
                <div className="p-2 bg-[#f0f5ff] rounded">
                  <TrendingUp className="w-4 h-4 text-[#0073bb]" />
                </div>
              </div>
            </div>
          </div>

          {/* Solutions List */}
          <div className="bg-white border border-[#d1d5db] rounded">
            <div className="border-b border-[#d1d5db] px-4 py-3 bg-[#f9fafb]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#16191f]">Deployed Solutions</h2>
                  <p className="text-xs text-[#545b64] mt-0.5">
                    {totalSolutions} solution{totalSolutions !== 1 ? 's' : ''} • {totalMachines} machines
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="p-6">
                <SolutionTableSkeleton />
              </div>
            )}

            {error && (
              <div className="p-6">
                <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] rounded px-4 py-3 text-sm">
                  <p className="font-medium">Error loading solutions</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && solutions.length > 0 && (
              <div className="divide-y divide-[#e5e7eb]">
                {solutions.map(({ solutionType, freq, solutionName }, index) => {
                  const Icon = getSolutionIcon(solutionName);
                  const coverage = totalMachines > 0 ? Math.round((freq / totalMachines) * 100) : 0;

                  return (
                    <div
                      key={solutionType}
                      className="px-4 py-3 hover:bg-[#f9fafb] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/user/${userId}/solutions/${atob(solutionType)}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 bg-[#f0f5ff] rounded flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[#0073bb]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[#16191f] group-hover:text-[#0073bb] transition-colors truncate">
                              {solutionName}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-[#545b64]">{freq} machine{freq !== 1 ? 's' : ''}</span>
                              <span className="text-xs text-[#545b64]">•</span>
                              <span className="text-xs text-[#545b64]">{coverage}% of fleet</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-base font-semibold text-[#16191f]">{freq}</div>
                            <div className="text-[10px] text-[#545b64] uppercase tracking-wide">Machines</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#9ca3af] group-hover:text-[#0073bb] transition-colors" />
                        </div>
                      </div>

                      {/* Coverage Bar */}
                      <div className="mt-3 ml-11">
                        <div className="flex items-center justify-between text-[10px] text-[#545b64] mb-1">
                          <span>Deployment coverage</span>
                          <span className="font-medium">{coverage}%</span>
                        </div>
                        <div className="w-full bg-[#e5e7eb] rounded-full h-1">
                          <div
                            className="bg-[#0073bb] h-1 rounded-full transition-all"
                            style={{ width: `${coverage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !error && solutions.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-[#f0f5ff] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart2 className="w-6 h-6 text-[#0073bb]" />
                </div>
                <h3 className="text-sm font-semibold text-[#16191f] mb-1">No solutions configured</h3>
                <p className="text-xs text-[#545b64] max-w-sm mx-auto">
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

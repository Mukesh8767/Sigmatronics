import {
  BarChart2,
  ChevronRight,
  TrendingUp,
  Zap,
  Settings,
  Activity
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface SolutionTableProps {
  data: { solutionType: string; freq: number; solutionName: string }[];
}

const getSolutionIcon = (solutionName: string) => {
  const name = solutionName.toLowerCase();
  if (name.includes('monitoring') || name.includes('analysis')) return Activity;
  if (name.includes('optimization') || name.includes('performance')) return TrendingUp;
  if (name.includes('alert') || name.includes('detection')) return Zap;
  if (name.includes('maintenance') || name.includes('service')) return Settings;
  return BarChart2;
};

const getGradientClass = (index: number) => {
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-red-500 to-red-600',
  ];
  return gradients[index % gradients.length];
};

export const AnalysisSolutionTable = ({ data }: SolutionTableProps) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const totalMachines = data.reduce((sum, item) => sum + item.freq, 0);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-blue-600">
                <BarChart2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-black">Analysis Solutions</h2>
                <p className="text-xs text-gray-600">
                  {data.length} solution{data.length !== 1 ? 's' : ''} deployed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-black">{totalMachines}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Machines</p>
            </div>
          </div>
        </div>

        {/* Cards */}
        {data.length > 0 ? (
          <div className="p-4 grid gap-3">
            {data.map(({ solutionType, freq, solutionName }, index) => {
              const Icon = getSolutionIcon(solutionName);
              const gradient = getGradientClass(index);
              const coverage = totalMachines > 0 ? Math.round((freq / totalMachines) * 100) : 0;

              return (
                <div
                  key={solutionType}
                  className="group bg-white border border-gray-100 rounded-lg p-4 hover:shadow-sm hover:-translate-y-[1px] transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/user/${userId}/analytics/${atob(solutionType)}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-black group-hover:text-blue-600 transition-colors">
                          {solutionName}
                        </h3>
                        <p className="text-xs text-gray-500">{freq} machine{freq !== 1 && 's'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                          <span className="text-lg font-bold text-black">{freq}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">Machines</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Coverage Bar */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span>Deployment Coverage</span>
                      <span>{coverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`bg-gradient-to-r ${gradient} h-1.5 rounded-full transition-all`}
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={28} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">No Solutions Configured</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
              Set up analysis solutions to gain insights and monitor your machine performance.
            </p>
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
              Configure Solutions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

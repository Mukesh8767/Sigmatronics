import { BarChart2, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface SolutionTableProps {
  data: { solutionType: string; freq: number; solutionName: string }[];
}

const getBorderColorClass = (index: number) => {
  const borders = [
    'border-l-blue-500',
    'border-l-green-500',
    'border-l-purple-500',
    'border-l-pink-500',
    'border-l-orange-500',
    'border-l-teal-500',
    'border-l-red-500',
    'border-l-indigo-500',
  ];
  return borders[index % borders.length];
};

export const SolutionTable = ({ data }: SolutionTableProps) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const totalMachines = data.reduce((sum, item) => sum + item.freq, 0);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-md p-2">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Solution Deployment</h2>
              <p className="text-sm text-gray-500">{data.length} configured solution(s)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{totalMachines}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Machines</p>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="p-6 grid gap-4">
            {data.map(({ solutionType, freq, solutionName }, index) => {
              const borderColor = getBorderColorClass(index);
              const usagePercent = totalMachines > 0 ? Math.round((freq / totalMachines) * 100) : 0;

              return (
                <div
                  key={solutionType}
                  className={`relative bg-white border border-gray-100 ${borderColor} border-l-4 rounded-xl p-5 group hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => navigate(`/user/${userId}/machines/${atob(solutionType)}`)}
                >
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart2 size={48} />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {solutionName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{freq} machine{freq !== 1 && 's'} assigned</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {usagePercent}% of fleet
                      </span>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart2 size={32} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-3">No Solutions Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by configuring solutions to analyze your machine usage across the fleet.
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200">
              Configure Solutions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

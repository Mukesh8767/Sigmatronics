// components/SolutionTable.tsx
import { BarChart2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface SolutionTableProps {
  data: { solutionType: string; freq: number; solutionName: string }[];
}


export const AnalysisSolutionTable = ({ data }: SolutionTableProps) => {
     const navigate = useNavigate();
  const { userId } = useParams();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mx-4 sm:mx-0">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Solution Types ({data.length})
        </h2>
      </div>

      {data.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {data.map(({ solutionType, freq, solutionName }) => (
            <div
              key={solutionType}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/user/${userId}/analytics/${solutionType}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <BarChart2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      {solutionName} 
                    </h3>
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-800">
                  Machines Allotted: {freq}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">Nothing to display right now.</p>
        </div>
      )}
    </div>
  );
};

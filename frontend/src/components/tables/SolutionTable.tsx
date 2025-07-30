import { BarChart2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface SolutionTableProps {
  data: { solutionType: string; freq: number; solutionName: string }[];
}

export const SolutionTable = ({ data }: SolutionTableProps) => {
  const navigate = useNavigate();
  const { userId } = useParams();

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Solution</th>
                <th className="px-6 py-4 text-center">Machines Allotted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map(({ solutionType, freq, solutionName }) => (
                <tr
                  key={solutionType}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/user/${userId}/machines/${solutionType}`)}
                >

                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-gray-800 font-medium">{solutionName}</span>
                  </td>

                  <td className="px-6 py-4 text-center font-semibold text-gray-700">
                    {freq}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

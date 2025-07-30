import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import { ChevronLeft } from "lucide-react";
import SolutionCardSkeleton from "../../components/SolutionLoader";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { Button } from "../../components/button"; // adjust the import path as per your folder structure

export const AnalysisMachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const { devices, loading, error } = useDevicesBySolution(userId || "", solution || "");

  return (
    <UserWrapper>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="mb-4 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <h2 className="text-2xl font-semibold mb-6">Devices</h2>

        {loading && <SolutionCardSkeleton />}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && devices.length === 0 && (
          <p className="text-gray-500">No devices found.</p>
        )}

        {!loading && !error && devices.length > 0 && (
          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
              <thead className="bg-gray-50 font-medium text-gray-600">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Threshold</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Added On</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {devices.map((device, idx) => (
                  <tr key={device._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-semibold">{idx + 1}</td>
                    <td className="px-5 py-4">{device.loca}</td>
                    <td className="px-5 py-4">{device.capacity ?? "–"}</td>
                    <td className="px-5 py-4">
                      {device.threshold !== undefined ? `${device.threshold}%` : "–"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                          device.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatUpdatedAt(device.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        onClick={() => navigate(`${device.machineId}`)}
                        size="sm"
                        variant="primary"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UserWrapper>
  );
};

export default AnalysisMachineView;

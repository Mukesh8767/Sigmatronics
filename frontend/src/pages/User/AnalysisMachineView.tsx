import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import {
  MapPin,
  Gauge,
  Calendar,
  Eye,
  Check,
} from "lucide-react";
import SolutionCardSkeleton from "../../components/SolutionLoader";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { Button } from "../../components/button";
import { Back } from "../../components/BackButton";
import { encodeBase64 } from "../../../utils/base64";
import { transformMachineCode } from "../../components/machineCodeEncoder";

export const AnalysisMachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const { devices, loading, error } = useDevicesBySolution(userId || "", solution || "");

  const StatusBadge = ({ status }: { status: string }) => {
    const active = status === "active";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
          active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            active ? "bg-green-600" : "bg-red-600"
          }`}
        />
        {status}
      </span>
    );
  };

  const TableView = () => (
    <div className="border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide font-medium">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />Device ID
              </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Location
              </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" /> Status
              </div>
            </th>
            <th className="px-4 py-2 text-left">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Created
              </div>
            </th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {devices.map((device, i) => (
            <tr key={device._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 font-semibold text-blue-600">{i + 1}</td>
              <td className="px-4 py-2 font-mono">
                {transformMachineCode(device.machineId)}
              </td>
              <td className="px-4 py-2 font-medium">{device.loca || "Unknown"}</td>
              <td className="px-4 py-2">
                <StatusBadge status={device.status || "unknown"} />
              </td>
              <td className="px-4 py-2 text-gray-500">
                {device.createdAt ? formatUpdatedAt(device.createdAt) : "—"}
              </td>
              <td className="px-4 py-2">
                <Button
                  onClick={() => navigate(`${encodeBase64(device.machineId)}`)}
                  variant="secondary"
                  className="text-blue-600 hover:text-blue-800 gap-1 flex items-center"
                >
                  <Eye className="w-4 h-4" /> View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const DeviceCard = ({
    device,
    index,
  }: {
    device: any;
    index: number;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 text-blue-600 text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {device.loca || "Unknown"}
            </h3>
            <StatusBadge status={device.status || "unknown"} />
          </div>
        </div>
        <Button
          onClick={() => navigate(`${encodeBase64(device.machineId)}`)}
          size="sm"
          variant="outline"
          className="text-blue-600 px-2 py-1 flex items-center gap-1"
        >
          <Eye className="w-4 h-4" /> View
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 text-xs text-gray-700">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />{" "}
          {device.createdAt ? formatUpdatedAt(device.createdAt) : "—"}
        </div>
      </div>
    </div>
  );

  return (
    <UserWrapper>
      <div className="max-w-7xl mx-auto p-4 space-y-5">
        <div>
          <Back />
          <h1 className="text-xl font-bold text-gray-900">Device Management</h1>
          <p className="text-sm text-gray-500">
            Devices associated with this solution
          </p>
        </div>

        {loading && <SolutionCardSkeleton />}

        {error && (
          <div className="bg-red-50 border-red-200 border rounded-md p-4 text-red-700 text-sm">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="bg-gray-50 border-gray-200 border rounded-md p-6 text-center text-sm text-gray-600">
            <Gauge className="w-6 h-6 mx- mb-2 text-gray-400" />
            <p className="font-semibold text-gray-900 mb-1">
              No Devices Available
            </p>
            <p>No devices linked with this solution yet.</p>
          </div>
        )}

        {!loading && !error && devices.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-800">
              Devices ({devices.length})
            </h2>
            <div className="hidden lg:block">
              <TableView />
            </div>
            <div className="lg:hidden space-y-3">
              {devices.map((device, i) => (
                <DeviceCard key={device._id} device={device} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </UserWrapper>
  );
};

export default AnalysisMachineView;

import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import { LocationEdit, MapPin, Power, Server } from "lucide-react";
import { Back } from "../../components/BackButton";

export const MachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const { devices, loading, error } = useDevicesBySolution(userId || "", solution || "");

  return (
    <UserWrapper>
      <div className="p-6">
        <Back/>
        

        <h2 className="text-2xl font-semibold mb-4">Devices</h2>

        {loading && <p className="text-gray-500">Loading devices...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && devices.length === 0 && (
          <p className="text-gray-500">No devices found.</p>
        )}

        {!loading && !error && devices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 " >
            {devices.map((device) => (
              <div
                key={device._id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition relative cursor-pointer"
                onClick={()=>{
                    navigate(`${device.machineId}`)
                }}
              >
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black p-1"
                  onClick={() => console.log(`Edit device ${device._id}`)}
                >
                  <LocationEdit className="w-4 h-4 cursor-pointer" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Server className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {device.machineId}
                  </h3>
                </div>

                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location: {device.loca}
                </p>
                <p className="text-sqm text-gray-500 capitalize flex items-center gap-1">
                  <Power className="w-3 h-3" />
                  Status: {device.status}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Added on {new Date(device.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserWrapper>
  );
};

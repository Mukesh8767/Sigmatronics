import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import { ChevronLeft, Server } from "lucide-react";
import SolutionCardSkeleton from "../../components/SolutionLoader";

export const AnalysisMachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const { devices, loading, error } = useDevicesBySolution(userId || "", solution || "");

  return (
    <UserWrapper>
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-700 hover:text-black hover:underline mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>


        <h2 className="text-2xl font-semibold mb-4">Devices for {solution}</h2>

        {loading && <SolutionCardSkeleton/>}
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
                onClick={() => {
                  navigate(`${device.machineId}`)
                }}
              >

                <div
                  className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${device.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  <span className="relative flex h-2 w-2">
                    {device.status === "active" ? (
                      <>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    )}
                  </span>
                  {device.status === "active" ? "Online" : "Offline"}
                </div>




                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Server className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {device.loca}
                  </h3>
                </div>



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

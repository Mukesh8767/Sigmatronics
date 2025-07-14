import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import { Power, Server, LocationEdit } from "lucide-react";
import { useUpdateLocation } from "../../hooks/useUpdateLocation";
import { useUpdateThreshold } from "../../hooks/useUpdateThreshold";
import { useUpdateCapacity } from "../../hooks/useUpdateCapacity";
import { Back } from "../../components/BackButton";
import SolutionCardSkeleton from "../../components/SolutionLoader";

export const MachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const { devices = [], loading, error } = useDevicesBySolution(userId || "", solution || "", refreshKey);

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [thresholds, setThresholds] = useState<{ [key: string]: number }>({});
  const [capacities, setCapacities] = useState<{ [key: string]: number }>({});
  const [showThresholdInput, setShowThresholdInput] = useState<{ [key: string]: boolean }>({});
  const [showCapacityInput, setShowCapacityInput] = useState<{ [key: string]: boolean }>({});
  const [lastUpdatedThresholdId, setLastUpdatedThresholdId] = useState<string | null>(null);
  const [lastUpdatedCapacityId, setLastUpdatedCapacityId] = useState<string | null>(null);

  const { updateLocation } = useUpdateLocation();
  const {
    updateThreshold,
    thresholdloading,
    thresholderror,
    success: thresholdSuccess,
  } = useUpdateThreshold();
  const {
    updateCapacity,
    capacityLoading,
    capacityError,
    capacitySuccess,
  } = useUpdateCapacity();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLastUpdatedThresholdId(null);
      setLastUpdatedCapacityId(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [lastUpdatedThresholdId, lastUpdatedCapacityId]);

  const encryptId = (id: string): string => {
    return btoa(id); // Base64 encode
  };

  const handleDeviceClick = (e: React.MouseEvent, deviceMachineId: string) => {
    if (e.target instanceof HTMLElement) {
      const isInteractiveElement = e.target.closest("button, input, form");
      if (!isInteractiveElement) {
        const id = encryptId(deviceMachineId);
        navigate(`${id}`);
      }
    }
  };

  return (
    <UserWrapper>
      <div className="p-6">
        <Back />
    
        <h2 className="text-2xl font-semibold mb-4">Devices</h2>

        {loading && <SolutionCardSkeleton/>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && devices.length === 0 && (
          <p className="text-gray-500">No devices found.</p>
        )}

        {!loading && !error && devices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div
                key={device._id}
                className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md bg-white relative cursor-pointer"
                onClick={(e) => handleDeviceClick(e, device.machineId)}
              >
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDeviceId(device._id);
                    setNewLocation(device.loca || "");
                  }}
                >
                  <LocationEdit className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Server className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{device.loca}</h3>
                </div>

                <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                  <Power className="w-3 h-3" />
                  Status: {device.status}
                </p>

                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>Capacity: {device.capacity ?? "N/A"}</p>
                  <p>
                    Threshold:{" "}
                    {device.threshold !== undefined && device.threshold !== null
                      ? `${device.threshold}%`
                      : "N/A"}
                  </p>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Added on {new Date(device.createdAt).toLocaleDateString()}
                </p>

                {editingDeviceId === device._id && (
                  <form
                    className="mt-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await updateLocation(device.machineId, newLocation);
                        alert("Location updated!");
                        setEditingDeviceId(null);
                        setRefreshKey((prev) => prev + 1);
                      } catch {
                        alert("Failed to update location.");
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3"
                      placeholder="Enter new location"
                      required
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Save Location
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDeviceId(null);
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Threshold Section */}
                <div className="mt-4">
                  {!showThresholdInput[device._id] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowThresholdInput((prev) => ({ ...prev, [device._id]: true }));
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Edit Threshold
                    </button>
                  ) : (
                    <>
                      <input
                        type="number"
                        value={thresholds[device._id] || ""}
                        onChange={(e) =>
                          setThresholds((prev) => ({
                            ...prev,
                            [device._id]: Number(e.target.value),
                          }))
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 mt-2"
                        placeholder="Enter threshold"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const val = thresholds[device._id];
                            if (val === undefined || val < 0) {
                              alert("Please enter a valid threshold.");
                              return;
                            }
                            await updateThreshold(device.machineId, val);
                            setLastUpdatedThresholdId(device._id);
                            setRefreshKey((prev) => prev + 1);
                            setShowThresholdInput((prev) => ({ ...prev, [device._id]: false }));
                          }}
                          disabled={thresholdloading}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          {thresholdloading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowThresholdInput((prev) => ({ ...prev, [device._id]: false }));
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                      {thresholderror && lastUpdatedThresholdId === device._id && (
                        <p className="text-red-500 text-sm mt-2">{thresholderror}</p>
                      )}
                      {thresholdSuccess && lastUpdatedThresholdId === device._id && (
                        <p className="text-green-600 text-sm mt-2">
                          Threshold updated successfully!
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Capacity Section */}
                <div className="mt-4">
                  {!showCapacityInput[device._id] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCapacityInput((prev) => ({ ...prev, [device._id]: true }));
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Edit Capacity
                    </button>
                  ) : (
                    <>
                      <input
                        type="number"
                        value={capacities[device._id] || ""}
                        onChange={(e) =>
                          setCapacities((prev) => ({
                            ...prev,
                            [device._id]: Number(e.target.value),
                          }))
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 mt-2"
                        placeholder="Enter capacity"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const val = capacities[device._id];
                            if (val === undefined || val <= 0) {
                              alert("Please enter a valid capacity.");
                              return;
                            }
                            await updateCapacity(device.machineId, val);
                            setLastUpdatedCapacityId(device._id);
                            setRefreshKey((prev) => prev + 1);
                            setShowCapacityInput((prev) => ({ ...prev, [device._id]: false }));
                          }}
                          disabled={capacityLoading}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          {capacityLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCapacityInput((prev) => ({ ...prev, [device._id]: false }));
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                      {capacityError && lastUpdatedCapacityId === device._id && (
                        <p className="text-red-500 text-sm mt-2">{capacityError}</p>
                      )}
                      {capacitySuccess && lastUpdatedCapacityId === device._id && (
                        <p className="text-green-600 text-sm mt-2">
                          Capacity updated successfully!
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserWrapper>
  );
};

export default MachineView;

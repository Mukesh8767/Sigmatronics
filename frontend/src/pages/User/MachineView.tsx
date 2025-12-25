import {
  Bell, BellOff, MapPin, PencilLine, Save, Settings,
  TrendingDown, TrendingUp, X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import { useUpdateLocation } from "../../hooks/useUpdateLocation";
import { Back } from "../../components/BackButton";
import SolutionCardSkeleton from "../../components/SolutionLoader";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { Button } from "../../components/button";
import axiosInstance from "../../../utils/axiosInstance";
import { transformMachineCode } from "../../components/machineCodeEncoder";

export const MachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editDevice, setEditDevice] = useState<any>(null);
  const [formData, setFormData] = useState<{ location?: string }>({});
  const [parameterEdits, setParameterEdits] = useState<Record<string, any>>({});

  const { devices = [], loading, error } = useDevicesBySolution(userId || "", solution || "", refreshKey);
  const { updateLocation } = useUpdateLocation();

  useEffect(() => {
    if (editDevice) {
      setFormData({ location: editDevice.loca || "" });
      const initialEdits: Record<string, any> = {};
      editDevice.parameters.forEach((p: any) => {
        initialEdits[p.key] = {
          min: p.threshold?.min ?? "",
          max: p.threshold?.max ?? "",
          alert: p.alert ?? false,
        };
      });
      setParameterEdits(initialEdits);
    }
  }, [editDevice]);

  const handleSave = async () => {
    if (!editDevice) return;

    const updatedParameters = editDevice.parameters.map((param: any) => {
      const edits = parameterEdits[param.key] || {};
      return {
        ...param,
        threshold: {
          min: Number(edits.min),
          max: Number(edits.max),
        },
        alert: edits.alert,
      };
    });

    try {
      if (formData.location && formData.location !== editDevice.loca) {
        await updateLocation(editDevice.machineId, formData.location);
      }

      await axiosInstance.put(`/api/device/updateParameters/${editDevice.machineId}`, {
        parameters: updatedParameters,
      });

      setEditDevice(null);
      setParameterEdits({});
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      alert("Update failed");
    }
  };

  const allParameterLabels = Array.from(
    new Set(
      devices.flatMap((device) => device.parameters?.map((param) => param.label) || [])
    )
  );

  return (
    <UserWrapper>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Back />
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Devices</h2>

        {loading && <SolutionCardSkeleton />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && devices.length === 0 && <p className="text-gray-500">No devices found.</p>}

        {!loading && devices.length > 0 && (
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-[1000px] w-full text-sm text-left text-gray-800">
              <thead className="bg-gray-100 font-medium text-gray-600 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Device ID</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Coordinates</th>
                  {allParameterLabels.map((label) => (
                    <th key={label} className="px-4 py-3">{label}</th>
                  ))}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added On</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {devices.map((d, idx) => (
                  <tr
                    key={d._id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(btoa(d.machineId))}
                  >
                    <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                    <td className="px-4 py-3">{transformMachineCode(d.machineId)}</td>
                    <td className="px-4 py-3">{d.loca || "–"}</td>
                    <td className="px-4 py-3">
                      {d.latitude !== undefined && d.longitude !== undefined
                        ? `${d.latitude}, ${d.longitude}`
                        : "–"}
                    </td>
                    {allParameterLabels.map((label) => {
                      const param = d.parameters?.find((p) => p.label === label);
                      return (
                        <td key={label} className="px-4 py-3">
                          {param ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-900">
                                {param.reading ?? "–"}
                              </span>
                              {param.unit && (
                                <span className="text-xs text-gray-500 font-medium">
                                  {param.unit}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${d.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatUpdatedAt(d.createdAt)}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button onClick={() => setEditDevice(d)} size="sm" variant="outline">
                        <PencilLine size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm text-black">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden border border-gray-300">

            <div className="bg-gradient-to-r from-black to-slate-700 text-white p-5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/30 rounded-lg">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Edit Parameters</h3>
                    <p className="text-gray-100 text-sm">{transformMachineCode(editDevice.machineId)}</p>
                  </div>
                </div>
                <button onClick={() => setEditDevice(null)} className="p-2 hover:bg-white/20 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] bg-white">
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <MapPin size={16} className="text-blue-800" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none"
                  placeholder="Enter device location"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-700" />
                  Parameter Ranges
                </h4>

                {editDevice.parameters.map((param: any) => (
                  <div key={param.key} className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-800 text-sm">{param.label || param.key}</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                          <TrendingDown size={12} className="text-red-600" />
                          Minimum
                        </label>
                        <input
                          type="number"
                          placeholder="Min value"
                          value={parameterEdits[param.key]?.min ?? ""}
                          onChange={(e) =>
                            setParameterEdits({
                              ...parameterEdits,
                              [param.key]: {
                                ...parameterEdits[param.key],
                                min: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                          <TrendingUp size={12} className="text-green-600" />
                          Maximum
                        </label>
                        <input
                          type="number"
                          placeholder="Max value"
                          value={parameterEdits[param.key]?.max ?? ""}
                          onChange={(e) =>
                            setParameterEdits({
                              ...parameterEdits,
                              [param.key]: {
                                ...parameterEdits[param.key],
                                max: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Alert</label>
                        <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={parameterEdits[param.key]?.alert ?? false}
                            onChange={(e) =>
                              setParameterEdits({
                                ...parameterEdits,
                                [param.key]: {
                                  ...parameterEdits[param.key],
                                  alert: e.target.checked,
                                },
                              })
                            }
                            className="sr-only"
                          />
                          {parameterEdits[param.key]?.alert ? (
                            <Bell size={16} className="text-amber-500" />
                          ) : (
                            <BellOff size={16} className="text-gray-400" />
                          )}
                          <span className="text-sm">
                            {parameterEdits[param.key]?.alert ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 border-t border-gray-300 p-4 flex justify-end gap-3">
              <button
                onClick={() => setEditDevice(null)}
                className="flex items-center gap-2 px-5 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 text-black bg-blue-100 hover:bg-blue-200 rounded-lg"
                variant="outline"
              >
                <Save size={16} />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </UserWrapper>
  );
};

export default MachineView;

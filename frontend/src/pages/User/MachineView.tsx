import { PencilLine, Save, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import { useUpdateLocation } from "../../hooks/useUpdateLocation";
import { useUpdateThreshold } from "../../hooks/useUpdateThreshold";
import { useUpdateCapacity } from "../../hooks/useUpdateCapacity";
import { Back } from "../../components/BackButton";
import SolutionCardSkeleton from "../../components/SolutionLoader";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { Button } from "../../components/button"; // Adjust path if needed

export const MachineView = () => {
  const { userId, solution } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ location?: string; capacity?: number; threshold?: number }>({});

  const { devices = [], loading, error } = useDevicesBySolution(userId || "", solution || "", refreshKey);
  const { updateLocation } = useUpdateLocation();
  const { updateThreshold } = useUpdateThreshold();
  const { updateCapacity } = useUpdateCapacity();

  useEffect(() => {
    if (editId) {
      const device = devices.find((d) => d._id === editId);
      setFormData({
        location: device?.loca || "",
        capacity: device?.capacity,
        threshold: device?.threshold,
      });
    }
  }, [editId]);

  const handleSave = async (d: typeof devices[number]) => {
    try {
      if (formData.location && formData.location !== d.loca) await updateLocation(d.machineId, formData.location);
      if (formData.threshold !== undefined && formData.threshold !== d.threshold)
        await updateThreshold(d.machineId, formData.threshold);
      if (formData.capacity !== undefined && formData.capacity !== d.capacity)
        await updateCapacity(d.machineId, formData.capacity);

      setEditId(null);
      setRefreshKey((prev) => prev + 1);
    } catch {
      alert("Update failed");
    }
  };

  const encryptId = (id: string) => btoa(id);

  return (
    <UserWrapper>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Back />
        <h2 className="text-2xl font-semibold mb-6 text-black">Devices</h2>

        {loading && <SolutionCardSkeleton />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && devices.length === 0 && <p className="text-gray-500">No devices found.</p>}

        {!loading && devices.length > 0 && (
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-[800px] w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 font-medium text-gray-600 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Machine ID</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Threshold</th>
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
                    onClick={() => navigate(encryptId(d.machineId))}
                  >
                    <td className="px-4 py-3 font-semibold">{idx + 1}</td>

                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {editId === d._id ? (
                        <input
                          type="text"
                          value={formData.location}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring focus:outline-none"
                        />
                      ) : (
                        d.loca
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {editId === d._id ? (
                        <input
                          type="number"
                          value={formData.capacity ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring focus:outline-none"
                        />
                      ) : (
                        d.capacity ?? "–"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {editId === d._id ? (
                        <input
                          type="number"
                          value={formData.threshold ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring focus:outline-none"
                        />
                      ) : d.threshold !== undefined ? (
                        `${d.threshold}%`
                      ) : (
                        "–"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                          d.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500">{formatUpdatedAt(d.createdAt)}</td>

                    <td className="px-4 py-3 text-center">
                      {editId === d._id ? (
                        <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button onClick={() => handleSave(d)} size="sm" variant="primary">
                            <Save size={16} />
                          </Button>
                          <Button onClick={() => setEditId(null)} size="sm" variant="secondary">
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button onClick={() => setEditId(d._id)} size="sm" variant="outline">
                            <PencilLine size={16} />
                          </Button>
                        </div>
                      )}
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

export default MachineView;

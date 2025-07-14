import { Cpu, Calendar, MapPin, Fingerprint, Trash2 } from "lucide-react";
import { Button } from "../button";
import axiosInstance from "../../../utils/axiosInstance";
import { useState } from "react";

interface MachineEntry {
  _id: string;
  machineId: string;
  assignedTo: { name: string; email: string };
  loca?: string;
  createdAt: string;
  machineIds?: string[];
}

interface MachineAssignmentTableProps {
  data: MachineEntry[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}


const MachineAssignmentTable = ({
  data,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onRefresh,
}: MachineAssignmentTableProps) => {
  const [deletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
      await axiosInstance.delete(`/api/device/delete-device/${id}`);
      onRefresh(); 

  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading data...</p>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="p-12 text-center">
          <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-500">Try selecting another solution type</p>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Device Assignments ({data.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {data.map((entry) => (
              <div
                key={entry._id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <Cpu className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1">
                        <Fingerprint className="w-4 h-4 mt-0.5" /> <span>{entry.machineId}</span>
                      </div>
                      Assigned To: {entry.assignedTo?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Email: {entry.assignedTo?.email}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Assigned on:{" "}
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-start gap-1">
                      <Cpu className="w-4 h-4 mt-0.5" />
                      <span>Devices Assigned: 1</span>
                    </p>
                    {entry.loca && (
                      <p className="text-sm text-gray-500 mt-1 flex items-start gap-1">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>Location: {entry.loca}</span>
                      </p>
                    )}
                  </div>
                </div>
                <Trash2
                  className={`cursor-pointer transition-colors ${
                    deletingId === entry._id ? "text-red-300" : "hover:text-red-600"
                  }`}
                  onClick={() => handleDelete(entry._id)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MachineAssignmentTable;

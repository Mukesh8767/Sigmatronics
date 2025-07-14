import React from 'react';
import { X, Wifi, WifiOff } from 'lucide-react';
import { useFetchDevice } from '../hooks/useFetchdevice';

interface PopupProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

const UserDevicePopup: React.FC<PopupProps> = ({ isOpen, userId, onClose }) => {
  const { devices, stats, loading, error } = useFetchDevice(userId);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white/5 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">User Devices</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading devices...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-gray-500 text-sm">Online</p>
                <p className="text-lg font-semibold text-green-700">{stats.online}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-gray-500 text-sm">Offline</p>
                <p className="text-lg font-semibold text-red-700">{stats.offline}</p>
              </div>
            </div>

            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device._id}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{device.machineId}</h3>
                      <p className="text-sm text-gray-600">
                        {device.solutionType} | {device.loca}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last updated: {new Date(device.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      {device.status === 'active' ? (
                        <Wifi className="text-green-600" />
                      ) : (
                        <WifiOff className="text-red-600" />
                      )}
                    </div>
                  </div>

                  {device.capacity && (
                    <p className="text-sm text-gray-500 mt-2">
                      Capacity: {device.capacity} L
                    </p>
                  )}
                  {device.threshold && (
                    <p className="text-sm text-gray-500">
                      Threshold: {device.threshold} L
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDevicePopup;

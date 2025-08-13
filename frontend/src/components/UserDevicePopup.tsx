import React, { useState } from 'react';
import { X, Wifi, WifiOff, Monitor, MapPin, Gauge, Calendar, Activity, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useFetchDevice } from '../hooks/useFetchdevice';
import { transformMachineCode } from './machineCodeEncoder';
import { MachineAnalyticsComponent } from './MachineReadingComponent';

interface PopupProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

const UserDevicePopup: React.FC<PopupProps> = ({ isOpen, userId, onClose }) => {
  const { devices, stats, loading, error } = useFetchDevice(userId);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const handleViewData = (deviceId: string, machineId: string) => {
    setSelectedDevice(machineId);
  };

  const handleBackToList = () => {
    setSelectedDevice(null);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedDevices = () => {
    if (!sortField) return devices;
    
    return [...devices].sort((a, b) => {
      let aValue = a[sortField as keyof typeof a];
      let bValue = b[sortField as keyof typeof b];

      // Provide default values if undefined
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (sortField === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-slate-900 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-black via-slate-900 to-slate-800 px-8 py-6 flex justify-between items-center border-b border-slate-600">
          <div className="flex items-center space-x-4">
            {selectedDevice && (
              <button
                onClick={handleBackToList}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-all duration-200 mr-2"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="bg-white/10 rounded-lg p-2">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {selectedDevice ? `Analytics - ${transformMachineCode(selectedDevice)}` : 'Device Management Dashboard'}
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                {selectedDevice ? 'Detailed device analytics and monitoring' : 'Real-time monitoring and device overview'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedDevice ? (
            <MachineAnalyticsComponent deviceName={selectedDevice} />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-600"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-b-4 border-slate-300"></div>
              </div>
              <p className="text-slate-600 text-lg font-medium">Loading device data...</p>
            </div>
          ) : error ? (
            <div className="m-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-full p-2">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold">Error Loading Devices</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {/* Enhanced Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Devices</p>
                      <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
                      <p className="text-xs text-slate-400 mt-1">Active monitoring</p>
                    </div>
                    <div className="bg-slate-100 rounded-xl p-3">
                      <Monitor className="w-7 h-7 text-slate-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">Online</p>
                      <p className="text-3xl font-bold text-green-700 mt-2">{stats.online}</p>
                      <p className="text-xs text-green-500 mt-1">Connected devices</p>
                    </div>
                    <div className="bg-green-100 rounded-xl p-3">
                      <Wifi className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-semibold uppercase tracking-wider">Offline</p>
                      <p className="text-3xl font-bold text-red-700 mt-2">{stats.offline}</p>
                      <p className="text-xs text-red-500 mt-1">Disconnected devices</p>
                    </div>
                    <div className="bg-red-100 rounded-xl p-3">
                      <WifiOff className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Data Table */}
              {devices.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-slate-800">Device Inventory</h3>
                    <p className="text-sm text-slate-600 mt-1">Comprehensive overview of all registered devices</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                            <SortButton field="status">Status</SortButton>
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                            <SortButton field="machineId">Device ID</SortButton>
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                            <SortButton field="solutionType">Solution Type</SortButton>
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                            <SortButton field="loca">Location</SortButton>
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                            <SortButton field="updatedAt">Last Updated</SortButton>
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getSortedDevices().map((device, index) => (
                          <tr key={device._id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded-full ${
                                  device.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                  {device.status === 'active' ? (
                                    <Wifi className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <WifiOff className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  device.status === 'active' 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                  {device.status === 'active' ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded border">
                                {transformMachineCode(device.machineId)}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Monitor className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-800">{device.solutionType}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-700">{device.loca}</span>
                              </div>
                            </td>
                            
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(device.updatedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                {new Date(device.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleViewData(device._id, device.machineId)}
                                className="inline-flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md"
                              >
                                <Activity className="w-4 h-4" />
                                <span>View Analytics</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Devices Found</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    This user doesn't have any registered devices yet. Devices will appear here once they are added to the system.
                  </p>
                </div>
              )}
            </div>
                    )}
        </div>
      </div>
    </div>
  );
};

export default UserDevicePopup;
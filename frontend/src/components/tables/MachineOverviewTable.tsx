import React from 'react';
import { transformMachineCode } from '../machineCodeEncoder';

type Device = {
  _id: string;
  loca: string;
  machineId: string;
  solutionType: string;
  status: string;
  capacity?: number;
  updatedAt: string;
};

type MachineOverviewProps = {
  devices: Device[];
};

export const formatUpdatedAt = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MachineOverview: React.FC<MachineOverviewProps> = ({ devices }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 my-4  ">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Machine Overview</h2>
      <p className="text-sm text-gray-500 mb-6">Access a modern overview of all deployed machines.</p>

      <div className="overflow-x-auto h-100 overflow-y-scroll">
        <table className="min-w-full text-sm ">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">MachineId</th>
              <th className="px-4 py-3 font-medium">location</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Last Updated</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr
                key={device._id}
                className="hover:bg-gray-50 transition-colors border-b border-gray-100 "
              >
                <td className="px-4 py-4 text-gray-800 font-medium">{index + 1}</td>
                <td className="px-4 py-2 text-gray-600">
            {transformMachineCode(device.machineId)}
                  </td>

                <td className="px-4 py-4 text-gray-600">{device.loca}</td>
                <td className="px-4 py-4">
                  {device.capacity !== undefined ? (
                    <span className="text-gray-700">{device.capacity}</span>
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-500">{formatUpdatedAt(device.updatedAt)}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      device.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        device.status === 'active'
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-red-500'
                      }`}
                    />
                    {device.status === 'active' ? 'Online' : 'Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MachineOverview;

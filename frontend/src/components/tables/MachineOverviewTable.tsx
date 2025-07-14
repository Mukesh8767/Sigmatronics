import React from 'react';

type Device = {
    _id: string;
    loca: string;
    capacity?: number | string;
    status: string;
    updatedAt: string;
};

type MachineOverviewProps = {
    devices: Device[];
    loading: boolean;
    error?: string;
};

export const formatUpdatedAt = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};
const MachineOverview: React.FC<MachineOverviewProps> = ({ devices }) => {

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-4 sm:p-8 my-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Machine Overview</h2>
            <div className="block mt-4">
                <div className="text-xs text-gray-500 mb-4 flex items-start">
                    Access a quick overview of the machine here.
                </div>

                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                    {devices.map((device, index) => (
                        <div key={`mobile-${device._id}`} className="bg-gray-50 p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-sm">#{index + 1} {device.loca}</div>
                                    {device.capacity && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            Capacity: {device.capacity}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Last updated: {formatUpdatedAt(device.updatedAt)}
                                    </div>

                                </div>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${device.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${device.status === 'active'
                                                ? 'bg-green-500 animate-ping'
                                                : 'bg-red-500'
                                            }`}
                                    />
                                    {device.status === 'active' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MachineOverview;

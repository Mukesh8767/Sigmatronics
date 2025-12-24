import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import {
    Gauge,
    ArrowLeft,
    MapPin,
    ChevronRight,
    Edit2,
    X,
    Save,
    Loader2,
    Search,
    Clock,
    Activity,
    Bell,
    BellOff,
    AlertTriangle
} from "lucide-react";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { encodeBase64 } from "../../../utils/base64";
import { transformMachineCode } from "../../components/machineCodeEncoder";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

// Modal Component
const DeviceEditModal = ({ device, onClose, onSuccess }: { device: any, onClose: () => void, onSuccess: () => void }) => {
    // Initialize parameters state using data from device
    // Structure: param.threshold.min, param.threshold.max
    const [parameters, setParameters] = useState<any[]>(
        device.parameters?.map((p: any) => ({
            ...p,
            threshold: {
                min: p.threshold?.min ?? '',
                max: p.threshold?.max ?? ''
            },
            alert: p.alert ?? false
        })) || []
    );
    const [saving, setSaving] = useState(false);

    const handleParamChange = (index: number, field: string, value: any) => {
        const newParams = [...parameters];
        newParams[index] = { ...newParams[index], [field]: value };
        setParameters(newParams);
    };

    const handleThresholdChange = (index: number, subField: 'min' | 'max', value: string) => {
        const newParams = [...parameters];
        if (!newParams[index].threshold) {
            newParams[index].threshold = {};
        }
        newParams[index].threshold[subField] = value;
        setParameters(newParams);
    };

    const handleSave = async () => {
        // Validation: If Alert is ON, Min and Max are required in threshold
        const invalidParam = parameters.find(p => p.alert && (
            p.threshold?.min === '' ||
            p.threshold?.max === '' ||
            p.threshold?.min === null ||
            p.threshold?.max === null
        ));

        if (invalidParam) {
            toast.error(`Thresholds (Min/Max) are required for ${invalidParam.label || invalidParam.key} when Alerts are enabled.`);
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.put(`/api/device/update/${device.machineId}`, {
                parameters: parameters
            });
            toast.success("Device configuration updated");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-[#2C2C2E] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2C2C2E] flex justify-between items-center bg-[#F5F5F7] dark:bg-[#232325]">
                    <div>
                        <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white">Configure Thresholds</h3>
                        <p className="text-sm text-[#86868B] flex items-center gap-1 mt-1">
                            <Activity size={14} /> {transformMachineCode(device.machineId)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-[#86868B]">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 bg-white dark:bg-[#1C1C1E]">
                    {parameters.length > 0 ? (
                        parameters.map((param, idx) => (
                            <div key={idx} className={`rounded-2xl border transition-all duration-300 ${param.alert ? 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-[#2C2C2E] bg-[#F5F5F7]/30 dark:bg-[#2C2C2E]/30'}`}>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-[#1D1D1F] dark:text-white capitalize text-base flex items-center gap-2">
                                                {param.label || param.key}
                                                {param.alert && <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-mono text-[#86868B] bg-gray-200 dark:bg-[#3A3A3C] px-2 py-0.5 rounded-md">
                                                    Current: {param.reading ?? '--'} {param.unit}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Alert Toggle */}
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-semibold uppercase tracking-wider ${param.alert ? 'text-blue-600 dark:text-blue-400' : 'text-[#86868B]'}`}>
                                                {param.alert ? 'Alerts On' : 'Alerts Off'}
                                            </span>
                                            <button
                                                onClick={() => handleParamChange(idx, 'alert', !param.alert)}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${param.alert ? 'bg-blue-600' : 'bg-gray-300 dark:bg-[#3A3A3C]'}`}
                                            >
                                                <span className={`${param.alert ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className={`grid grid-cols-2 gap-5 transition-all duration-300 ${param.alert ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}`}>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Min Threshold</label>
                                                {param.alert && !param.threshold?.min && <span className="text-[10px] text-red-500 font-semibold">*Required</span>}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={param.threshold?.min ?? ''}
                                                    onChange={(e) => handleThresholdChange(idx, 'min', e.target.value)}
                                                    placeholder={param.alert ? "Required" : "Optional"}
                                                    className={`w-full bg-white dark:bg-[#1C1C1E] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] dark:text-white transition-all font-mono
                                                      ${param.alert && !param.threshold?.min ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 dark:border-[#3A3A3C]'}
                                                    `}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Max Threshold</label>
                                                {param.alert && !param.threshold?.max && <span className="text-[10px] text-red-500 font-semibold">*Required</span>}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={param.threshold?.max ?? ''}
                                                    onChange={(e) => handleThresholdChange(idx, 'max', e.target.value)}
                                                    placeholder={param.alert ? "Required" : "Optional"}
                                                    className={`w-full bg-white dark:bg-[#1C1C1E] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] dark:text-white transition-all font-mono
                                                        ${param.alert && !param.threshold?.max ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 dark:border-[#3A3A3C]'}
                                                    `}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {param.alert && (
                                        <div className="mt-3 flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                            <AlertTriangle size={14} className="mt-0.5" />
                                            <p>Alert will trigger if reading goes below <strong>{param.threshold?.min || '?'}</strong> or above <strong>{param.threshold?.max || '?'}</strong>.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-[#86868B]">
                            <Search size={40} strokeWidth={1} className="mb-4 opacity-50" />
                            <p className="font-medium">No configurable parameters available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-gray-100 dark:border-[#2C2C2E] bg-[#F5F5F7] dark:bg-[#232325] flex justify-between items-center">
                    <div className="text-xs text-[#86868B]">
                        * Changes apply immediately after saving
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MachinesListPage = () => {
    const { userId, solution } = useParams();
    const navigate = useNavigate();
    const { devices, loading, error, refetch } = useDevicesBySolution(userId || "", solution || "");
    const [editingDevice, setEditingDevice] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const activeMachines = devices.filter(d => d.status === "active").length;
    const inactiveMachines = devices.filter(d => d.status !== "active").length;

    const filteredDevices = devices.filter(d =>
        transformMachineCode(d.machineId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.loca && d.loca.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const StatusBadge = ({ status }: { status: string }) => {
        const active = status === "active";
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${active
                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-900/30"
                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-900/30"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`} />
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
            </span>
        );
    };

    return (
        <UserWrapper>
            <div className="min-h-screen bg-[#F5F5F7] dark:bg-black font-sans transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col gap-6 mb-8">
                        <button onClick={() => navigate(`/user/${userId}/solutions`)} className="flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:opacity-70 transition-opacity w-fit">
                            <ArrowLeft className="w-4 h-4" /> Back to solutions
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">Devices</h1>
                                <p className="text-[#86868B] dark:text-[#98989D] font-medium mt-1">Monitoring systems</p>
                            </div>

                            {!loading && devices.length > 0 && (
                                <div className="flex gap-3">
                                    <div className="px-4 py-2 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider">Active</p>
                                            <p className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-none">{activeMachines}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider">Inactive</p>
                                            <p className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-none">{inactiveMachines}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-xl leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] sm:text-sm transition-all shadow-sm"
                            placeholder="Search devices by ID or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Table View */}
                    {loading ? (
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-[#2C2C2E] overflow-hidden">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 border-b border-gray-100 dark:border-[#2C2C2E] bg-gray-50/50 dark:bg-[#1C1C1E] animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    ) : filteredDevices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E]">
                            <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mb-4">
                                <Gauge className="w-8 h-8 text-[#86868B]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">No devices found</h3>
                            <p className="text-[#86868B] dark:text-[#98989D]">Try adjusting your search terms</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2C2C2E]">
                                    <thead className="bg-gray-50 dark:bg-[#232325]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-wider">Device ID</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-wider">Current Readings</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-wider">Location</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-wider">Last Activity</th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#86868B] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-[#2C2C2E] bg-white dark:bg-[#1C1C1E]">
                                        {filteredDevices.map((device) => (
                                            <tr
                                                key={device._id}
                                                onClick={() => navigate(`/user/${userId}/solutions/${solution}/${encodeBase64(device.machineId)}`)}
                                                className="hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-[#0071E3]">
                                                            <Activity size={20} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-[#1D1D1F] dark:text-white">{transformMachineCode(device.machineId)}</div>
                                                            <div className="text-xs text-[#86868B]">{device.machineId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={device.status || "unknown"} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2 max-w-md">
                                                        {device.parameters && device.parameters.length > 0 ? (
                                                            device.parameters.slice(0, 3).map((param: any, idx: number) => (
                                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#3A3A3C]">
                                                                    <span className="opacity-70 mr-1">{param.label || param.key}:</span>
                                                                    <span className="font-mono">{param.reading ?? '--'} {param.unit}</span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No readings</span>
                                                        )}
                                                        {device.parameters && device.parameters.length > 3 && (
                                                            <span className="text-xs text-gray-400 self-center">+{device.parameters.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-[#1D1D1F] dark:text-[#E5E5EA]">
                                                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-[#86868B]" />
                                                        {device.loca || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-[#86868B]">
                                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                        {device.createdAt ? formatUpdatedAt(device.createdAt) : "Never"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-3 opacity-100">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingDevice(device);
                                                            }}
                                                            className="p-2 text-[#86868B] hover:text-[#0071E3] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                            title="Edit Configurations"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            className="p-2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-lg transition-all"
                                                            title="View Details"
                                                        >
                                                            <ChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {editingDevice && (
                    <DeviceEditModal
                        device={editingDevice}
                        onClose={() => setEditingDevice(null)}
                        onSuccess={() => {
                            setEditingDevice(null);
                            if (refetch) refetch();
                            window.location.reload();
                        }}
                    />
                )}
            </div>
        </UserWrapper>
    );
};

export default MachinesListPage;

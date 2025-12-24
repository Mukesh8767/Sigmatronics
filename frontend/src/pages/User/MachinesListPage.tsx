import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import {
    Gauge,
    ArrowLeft,
    MapPin,
    ChevronRight,
} from "lucide-react";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { encodeBase64 } from "../../../utils/base64";
import { transformMachineCode } from "../../components/machineCodeEncoder";

export const MachinesListPage = () => {
    const { userId, solution } = useParams();
    const navigate = useNavigate();
    const { devices, loading, error } = useDevicesBySolution(userId || "", solution || "");

    const activeMachines = devices.filter(d => d.status === "active").length;
    const inactiveMachines = devices.filter(d => d.status !== "active").length;

    const StatusBadge = ({ status }: { status: string }) => {
        const active = status === "active";
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors ${active
                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`} />
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
            </span>
        );
    };

    return (
        <UserWrapper>
            <div className="min-h-screen bg-[#F5F5F7] dark:bg-black font-sans transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-6 mb-8">
                        <button
                            onClick={() => navigate(`/user/${userId}/solutions`)}
                            className="flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:opacity-70 transition-opacity w-fit"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to solutions
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                                    Devices
                                </h1>
                                <p className="text-[#86868B] dark:text-[#98989D] font-medium mt-1">
                                    Monitoring {solution} systems
                                </p>
                            </div>

                            {/* Summary Stats */}
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

                    {/* Content */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-48 bg-gray-200 dark:bg-[#1C1C1E] rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E]">
                            <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mb-4">
                                <Gauge className="w-8 h-8 text-[#86868B]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">No devices found</h3>
                            <p className="text-[#86868B] dark:text-[#98989D]">This solution doesn't have any devices yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {devices.map((device) => (
                                <div
                                    key={device._id}
                                    onClick={() => navigate(`/user/${userId}/solutions/${solution}/${encodeBase64(device.machineId)}`)}
                                    className="group bg-white dark:bg-[#1C1C1E] rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E] p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3] transition-colors">
                                                {transformMachineCode(device.machineId)}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs font-medium text-[#86868B] dark:text-[#98989D]">
                                                {device.loca ? (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {device.loca}
                                                    </span>
                                                ) : (
                                                    <span className="italic">No location</span>
                                                )}
                                                <span>•</span>
                                                <span>{device.createdAt ? formatUpdatedAt(device.createdAt) : "No date"}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={device.status || "unknown"} />
                                    </div>

                                    {/* Parameters Grid */}
                                    {device.parameters && device.parameters.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl">
                                            {device.parameters.slice(0, 4).map((param: any, idx: number) => (
                                                <div key={idx} className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-[#86868B] dark:text-[#98989D] uppercase tracking-wide truncate">
                                                        {param.label || param.key}
                                                    </span>
                                                    <span className="text-sm font-bold text-[#1D1D1F] dark:text-white font-mono truncate">
                                                        {param.reading !== undefined && param.reading !== null
                                                            ? `${param.reading} ${param.unit || ''}`
                                                            : "--"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mb-5 p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl flex items-center justify-center text-xs text-[#86868B]">
                                            No Live Readings
                                        </div>
                                    )}

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E] mt-auto">
                                        <span className="text-xs font-medium text-[#86868B]">Device Details</span>
                                        <div className="flex items-center gap-1 text-sm font-semibold text-[#0071E3] group-hover:translate-x-1 transition-transform">
                                            View <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </UserWrapper>
    );
};

export default MachinesListPage;

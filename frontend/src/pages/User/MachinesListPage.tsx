import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import { useDevicesBySolution } from "../../hooks/useUserDeviceSolutions";
import {
    Gauge,
    Calendar,
    Eye,
    ArrowLeft,
    Activity,
    Database,
    TrendingUp,
} from "lucide-react";
import SolutionCardSkeleton from "../../components/SolutionLoader";
import { formatUpdatedAt } from "../../components/tables/MachineOverviewTable";
import { Button } from "../../components/button";
import { encodeBase64 } from "../../../utils/base64";
import { transformMachineCode } from "../../components/machineCodeEncoder";

export const MachinesListPage = () => {
    const { userId, solution } = useParams();
    const navigate = useNavigate();
    const { devices, loading, error } = useDevicesBySolution(userId || "", solution || "");

    const StatusBadge = ({ status }: { status: string }) => {
        const active = status === "active";
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${active
                    ? "bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]"
                    : "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]"
                    }`}
            >
                <span
                    className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#10b981]" : "bg-[#ef4444]"
                        }`}
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const activeMachines = devices.filter(d => d.status === "active").length;
    const inactiveMachines = devices.filter(d => d.status !== "active").length;

    return (
        <UserWrapper>
            <div className="min-h-screen bg-[#f9fafb]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(`/user/${userId}/solutions`)}
                            className="flex items-center gap-1.5 text-sm text-[#0073bb] hover:text-[#005a8c] mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to solutions
                        </button>

                        <div className="bg-white border border-[#d1d5db] rounded px-4 py-3 mb-4">
                            <h1 className="text-2xl font-semibold text-[#16191f] mb-0.5">Machines</h1>
                            <p className="text-sm text-[#545b64]">
                                Devices associated with this solution
                            </p>
                        </div>

                        {/* Stats Cards */}
                        {!loading && devices.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-[#545b64] font-medium mb-0.5">Total Machines</p>
                                            <p className="text-xl font-semibold text-[#16191f]">{devices.length}</p>
                                        </div>
                                        <div className="p-2 bg-[#f0f5ff] rounded">
                                            <Database className="w-4 h-4 text-[#0073bb]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-[#545b64] font-medium mb-0.5">Active</p>
                                            <p className="text-xl font-semibold text-[#10b981]">{activeMachines}</p>
                                        </div>
                                        <div className="p-2 bg-[#d1fae5] rounded">
                                            <Activity className="w-4 h-4 text-[#10b981]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-[#545b64] font-medium mb-0.5">Inactive</p>
                                            <p className="text-xl font-semibold text-[#ef4444]">{inactiveMachines}</p>
                                        </div>
                                        <div className="p-2 bg-[#fee2e2] rounded">
                                            <TrendingUp className="w-4 h-4 text-[#ef4444]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="bg-white border border-[#d1d5db] rounded p-6">
                            <SolutionCardSkeleton />
                        </div>
                    )}

                    {error && (
                        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] rounded px-4 py-3 text-sm">
                            <p className="font-medium">Error loading devices</p>
                            <p className="text-xs mt-1">{error}</p>
                        </div>
                    )}

                    {!loading && !error && devices.length === 0 && (
                        <div className="bg-white border border-[#d1d5db] rounded p-12 text-center">
                            <div className="w-12 h-12 bg-[#f0f5ff] rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Gauge className="w-6 h-6 text-[#0073bb]" />
                            </div>
                            <p className="text-sm font-semibold text-[#16191f] mb-1">No devices available</p>
                            <p className="text-xs text-[#545b64]">No devices linked with this solution yet.</p>
                        </div>
                    )}

                    {!loading && !error && devices.length > 0 && (
                        <div className="bg-white border border-[#d1d5db] rounded">
                            <div className="border-b border-[#d1d5db] px-4 py-2.5 bg-[#f9fafb]">
                                <h2 className="text-sm font-semibold text-[#16191f]">
                                    Devices ({devices.length})
                                </h2>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#f9fafb] border-b border-[#d1d5db]">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide">#</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide">Machine ID</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide">Location</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide">Status</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide">Created</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb]">
                                        {devices.map((device, i) => (
                                            <tr
                                                key={device._id}
                                                className="hover:bg-[#f9fafb] transition-colors cursor-pointer"
                                                onClick={() => navigate(`/user/${userId}/solutions/${solution}/${encodeBase64(device.machineId)}`)}
                                            >
                                                <td className="px-4 py-3 font-semibold text-[#0073bb]">{i + 1}</td>
                                                <td className="px-4 py-3 font-mono text-sm text-[#16191f]">
                                                    {transformMachineCode(device.machineId)}
                                                </td>
                                                <td className="px-4 py-3 text-[#545b64]">{device.loca || "Unknown"}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={device.status || "unknown"} />
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#545b64]">
                                                    {device.createdAt ? formatUpdatedAt(device.createdAt) : "—"}
                                                </td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        onClick={() => navigate(`/user/${userId}/solutions/${solution}/${encodeBase64(device.machineId)}`)}
                                                        variant="secondary"
                                                        className="text-xs text-[#0073bb] hover:text-[#005a8c] hover:bg-[#f0f5ff] gap-1.5 flex items-center px-2 py-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden divide-y divide-[#e5e7eb]">
                                {devices.map((device, i) => (
                                    <div
                                        key={device._id}
                                        className="px-4 py-3 hover:bg-[#f9fafb] transition-colors cursor-pointer"
                                        onClick={() => navigate(`/user/${userId}/solutions/${solution}/${encodeBase64(device.machineId)}`)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 bg-[#f0f5ff] text-[#0073bb] text-xs flex items-center justify-center rounded font-semibold">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-[#16191f]">
                                                        {device.loca || "Unknown Location"}
                                                    </h3>
                                                    <p className="text-xs text-[#545b64] font-mono mt-0.5">
                                                        {transformMachineCode(device.machineId)}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={device.status || "unknown"} />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#545b64] ml-8.5">
                                            <Calendar className="w-3 h-3" />
                                            <span>{device.createdAt ? formatUpdatedAt(device.createdAt) : "—"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </UserWrapper>
    );
};

export default MachinesListPage;

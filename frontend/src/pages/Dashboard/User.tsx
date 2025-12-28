import React, { useMemo, useState } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Zap,
  Clock,
  Bell,
  X,
  ChevronRight,
  Monitor,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useFetchDevice } from "../../hooks/useFetchdevice";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useFetchLiveAlerts } from "../../hooks/useFetchLiveAlerts";
import { transformMachineCode } from "../../components/machineCodeEncoder";
import UserWrapper from "../Wrappers/UserWrapper";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

// --- Types ---
interface Alert {
  createdAt: string;
  message: string;
}

interface Device {
  _id: string;
  machineId: string;
  status: string;
  loca?: string;
  updatedAt?: string;
}

interface AnomalyStats {
  today: number;
  thisWeek: number;
}

type ModalType = "total" | "online" | "offline" | "alerts" | null;

// --- Hooks ---
const useAnomalyStats = (alerts: Alert[]): AnomalyStats => {
  const currentDate = new Date();

  return useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const todayStr = currentDate.toDateString();

    let todayCount = 0;
    let weekCount = 0;

    alerts.forEach((alert) => {
      const alertDate = new Date(alert.createdAt);
      if (alertDate.toDateString() === todayStr) {
        todayCount++;
      }
      if (alertDate >= startOfWeek && alertDate <= currentDate) {
        weekCount++;
      }
    });

    return { today: todayCount, thisWeek: weekCount };
  }, [alerts, currentDate]);
};

// --- Components ---

const StatCard = ({
  title,
  value,
  icon,
  trend,
  colorClass,
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  colorClass: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="group relative bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#2C2C2E] hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-left w-full overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-24 opacity-[0.03] rounded-full -mr-10 -mt-10 ${colorClass.replace('text-', 'bg-')}`} />

    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${colorClass.includes('blue') ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0071E3]' :
        colorClass.includes('green') ? 'bg-green-50 dark:bg-green-900/20 text-[#34C759]' :
          colorClass.includes('red') ? 'bg-red-50 dark:bg-red-900/20 text-[#FF3B30]' :
            'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
        {icon}
      </div>
      {trend && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300">
          {trend}
        </span>
      )}
    </div>

    <div className="relative z-10">
      <h3 className="text-sm font-medium text-[#86868B] dark:text-[#98989D] mb-1 group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-colors">{title}</h3>
      <p className="text-4xl font-bold text-[#1D1D1F] dark:text-white tracking-tight">{value}</p>
    </div>

    <div className="absolute bottom-4 right-4 text-[#86868B] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
      <ChevronRight size={20} />
    </div>
  </button>
);

const DataModal = ({
  type,
  onClose,
  data,
}: {
  type: ModalType;
  onClose: () => void;
  data: any[];
}) => {
  if (!type) return null;

  const getTitle = () => {
    switch (type) {
      case "total": return "All Machines";
      case "online": return "Active Machines";
      case "offline": return "Offline Machines";
      case "alerts": return "Today's Alerts";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-[#2C2C2E]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2C2C2E] flex items-center justify-between bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#86868B]">No items found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {type === "alerts" ? (
                // Alerts List
                data.map((alert, i) => (
                  <div key={i} className="p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors flex gap-4 items-start mx-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl mt-0.5">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">{alert.message}</p>
                      <p className="text-xs text-[#86868B] mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // Machines List
                data.map((device, i) => (
                  <div key={i} className="group p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors flex items-center justify-between mx-2 border-b last:border-0 border-gray-50 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${device.status === 'active'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {device.status === 'active' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3] transition-colors">
                          {transformMachineCode(device.machineId)}
                        </p>
                        <p className="text-xs text-[#86868B] flex items-center gap-1">
                          {device.loca || "Unknown Location"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${device.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                        {device.status === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export function UserDashboard() {
  const { userId } = useParams();

  const { user } = useUserProfile(userId!);
  const { devices } = useFetchDevice(userId!);
  const alerts = useFetchLiveAlerts();

  const { today } = useAnomalyStats(alerts.alerts);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Derived Data
  const total = devices.length;
  const onlineMachines = devices.filter((d: Device) => d.status === "active");
  const offlineMachines = devices.filter((d: Device) => d.status !== "active");
  const onlineCount = onlineMachines.length;
  const offlineCount = offlineMachines.length;
  const uptime = total > 0 ? Math.round((onlineCount / total) * 100) : 0;

  // Filter today's alerts for modal
  const todaysAlerts = useMemo(() => {
    const todayStr = new Date().toDateString();
    return alerts.alerts.filter(a => new Date(a.createdAt).toDateString() === todayStr);
  }, [alerts.alerts]);



  const statusBreakdown = useMemo(() => [
    { name: "Online", value: onlineCount, color: "#34C759" },
    { name: "Offline", value: offlineCount, color: "#E5E5EA" },
  ], [onlineCount, offlineCount]);

  // Distribution Data
  const distributionData = useMemo(() => {
    const groups: { [key: string]: number } = {};
    devices.forEach(d => {
      const prefix = d.machineId ? transformMachineCode(d.machineId).substring(0, 4).toUpperCase() : "UNK";
      groups[prefix] = (groups[prefix] || 0) + 1;
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [devices]);

  const getModalData = () => {
    switch (activeModal) {
      case "total": return devices;
      case "online": return onlineMachines;
      case "offline": return offlineMachines;
      case "alerts": return todaysAlerts;
      default: return [];
    }
  };

  return (
    <UserWrapper>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 font-sans pb-12">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#F5F5F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-[#1C1C1E]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#86868B] dark:text-[#98989D]">Welcome back</p>
              <h1 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.name || "User"}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] rounded-full shadow-sm border border-gray-100 dark:border-[#2C2C2E]">
                <div className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse"></div>
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">System Operational</span>
              </div>
              <button
                onClick={() => setActiveModal("alerts")}
                className="relative p-2.5 bg-white dark:bg-[#1C1C1E] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] rounded-full shadow-sm border border-gray-100 dark:border-[#2C2C2E] transition-all"
              >
                <Bell size={20} className="text-[#1D1D1F] dark:text-[#F5F5F7]" />
                {today > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-black rounded-full" />}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* Stat Cards - Clickable */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Total Machines"
              value={total}
              icon={<Monitor size={24} />}
              colorClass="text-blue-500"
              onClick={() => setActiveModal("total")}
            />
            <StatCard
              title="Online Now"
              value={onlineCount}
              icon={<Wifi size={24} />}
              colorClass="text-green-500"
              trend={`${uptime}% Uptime`}
              onClick={() => setActiveModal("online")}
            />
            <StatCard
              title="Offline"
              value={offlineCount}
              icon={<WifiOff size={24} />}
              colorClass="text-[#86868B]"
              onClick={() => setActiveModal("offline")}
            />
            <StatCard
              title="Today's Alerts"
              value={today}
              icon={<AlertTriangle size={24} />}
              colorClass="text-red-500"
              trend={today > 0 ? "Requires Attention" : "All Clear"}
              onClick={() => setActiveModal("alerts")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Machine List Preview & Distro Chart */}
            <div className="lg:col-span-2 space-y-8">
              {/* Fleet Snapshot */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-[#2C2C2E]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-white">Fleet Snapshot</h2>
                    <p className="text-sm text-[#86868B]">Real-time device status</p>
                  </div>
                  <button className="text-sm font-semibold text-[#0071E3] hover:underline" onClick={() => setActiveModal('total')}>
                    View Full List
                  </button>
                </div>

                <div className="space-y-3">
                  {devices.slice(0, 5).map((device, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E]/50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${device.status === 'active' ? 'bg-white dark:bg-[#1C1C1E] text-green-500 shadow-sm' : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-400'}`}>
                          <Cpu size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1D1D1F] dark:text-white">{transformMachineCode(device.machineId)}</p>
                          <p className="text-xs text-[#86868B]">{device.loca || "Remote Station"}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${device.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                        {device.status === 'active' ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  ))}
                  {devices.length === 0 && (
                    <div className="text-center py-8 text-[#86868B]">No devices connected</div>
                  )}
                </div>
              </div>

              {/* Machine Distribution Chart */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-[#2C2C2E] [--bar-color:#86868B] dark:[--bar-color:#FFFFFF]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-white">Machine Distribution</h2>
                  <p className="text-sm text-[#86868B]">Deployments by Model / Series</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#86868B", fontSize: 12 }}
                        dy={10}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32} fill="var(--bar-color)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              {/* Device Status (Pie Chart) */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-[#2C2C2E]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-white">Device Status</h2>
                  <p className="text-sm text-[#86868B]">Online vs Offline Ratio</p>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Action / Alerts Preview */}
              <div className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] rounded-[32px] p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setActiveModal('alerts')}>
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <Zap className="text-yellow-400" fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Live Monitoring</h3>
                  <p className="text-gray-400 mb-6 text-sm">
                    {today === 0
                      ? "All systems normal. No active alerts today."
                      : `${today} Alerts detected today. Click to review.`}
                  </p>
                  <button className="flex items-center gap-2 text-sm font-semibold hover:text-gray-200 transition-colors">
                    View Activity Log <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal */}
        {activeModal && (
          <DataModal
            type={activeModal}
            data={getModalData()}
            onClose={() => setActiveModal(null)}
          />
        )}
      </div>
    </UserWrapper>
  );
}

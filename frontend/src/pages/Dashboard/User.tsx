import React, { useMemo } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Activity,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Bell,
  Gauge,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchDevice } from "../../hooks/useFetchdevice";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useFetchLiveAlerts } from "../../hooks/useFetchLiveAlerts";
import MachineOverview, {
  formatUpdatedAt,
} from "../../components/tables/MachineOverviewTable";
import UserWrapper from "../Wrappers/UserWrapper";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { format } from "date-fns";

interface Alert {
  createdAt: string;
  message: string;
}

interface Device {
  status: string;
}

interface AnomalyStats {
  today: number;
  thisWeek: number;
}

/**
 * Hook to calculate today's and this week's anomaly counts
 */
const useAnomalyStats = (alerts: Alert[]): AnomalyStats => {
  const currentDate = new Date();

  return useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday start
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

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600">
        {icon}
      </div>
      {trend && (
        <span
          className={`text-sm font-medium flex items-center px-2 py-1 rounded-full ${trendUp
            ? "text-green-700 bg-green-50"
            : "text-red-700 bg-red-50"
            }`}
        >
          <TrendingUp
            size={12}
            className={`mr-1 ${!trendUp && "rotate-180"}`}
          />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-black">{value}</p>
  </div>
);

export function UserDashboard() {
  const { userId } = useParams();
  const { user } = useUserProfile(userId!);
  const { devices } = useFetchDevice(userId!);
  const alerts = useFetchLiveAlerts();

  const { today } = useAnomalyStats(alerts.alerts);
  const navigate = useNavigate();

  const total = devices.length;
  const online = devices.filter((d: Device) => d.status === "active").length;
  const offline = total - online;
  const uptime = total > 0 ? Math.round((online / total) * 100) : 0;

  const alertCount = today;
  const alertHistory = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - idx));
      const dayKey = day.toDateString();
      const count = alerts.alerts.filter((a) => new Date(a.createdAt).toDateString() === dayKey).length;
      return {
        day: format(day, "EEE"),
        alerts: count,
        uptime,
      };
    });
  }, [alerts.alerts, uptime]);

  const statusBreakdown = useMemo(
    () => [
      { name: "Online", value: online },
      { name: "Offline", value: offline },
      { name: "Alerts today", value: alertCount },
    ],
    [online, offline, alertCount]
  );

  return (
    <UserWrapper>
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="text-gray-900">
              <p className="text-gray-600">Welcome back, {user?.name || "User"}</p>
              <h1 className="text-2xl font-semibold">Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm flex items-center gap-2">
                <Gauge size={16} className="text-blue-600" />
                <span>{uptime}% uptime</span>
              </div>
              <button
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                onClick={() => navigate(`/user/${userId}/anamoly`)}
              >
                <Bell size={20} />
                {alertCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {alertCount}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Machines" value={total} icon={<Cpu size={24} />} />
            <StatCard
              title="Online Now"
              value={online}
              icon={<Wifi size={24} />}
              trend={`${uptime}%`}
              trendUp={true}
            />
            <StatCard title="Offline" value={offline} icon={<WifiOff size={24} />} />
            <StatCard title="Today's Alerts" value={today} icon={<AlertTriangle size={24} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600">
                        <Cpu size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-black">
                          Fleet snapshot
                        </h2>
                        <p className="text-sm text-gray-600">
                          {online} of {total} devices online
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6">
                  <MachineOverview devices={devices} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-black">Health at a glance</h2>
                      <p className="text-sm text-gray-600">Uptime & alerts trend</p>
                    </div>
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={alertHistory}>
                      <defs>
                        <linearGradient id="uptime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Area type="monotone" dataKey="uptime" stroke="#2563eb" fillOpacity={1} fill="url(#uptime)" name="Uptime %" />
                      <Area type="monotone" dataKey="alerts" stroke="#f59e0b" fill="#fef3c7" name="Alerts" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl text-red-600">
                        <Zap size={20} />
                      </div>
                      <h2 className="text-lg font-semibold text-black">
                        Live Alerts
                      </h2>
                    </div>
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => navigate(`/user/${userId}/anamoly`)}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6 h-147">
                  {alerts.alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield
                        size={32}
                        className="mx-auto mb-3 text-green-500"
                      />
                      <p className="text-gray-600">
                        No active alerts. All systems are normal.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-135 overflow-y-auto pr-2">
                      {alerts.alerts.map((alert, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-red-50 border border-red-100"
                        >
                          <div className="flex items-start space-x-3">
                            <AlertTriangle
                              size={16}
                              className="text-red-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-black">
                                {alert.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                {formatUpdatedAt(alert.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-emerald-600">
                        <Wifi size={20} />
                      </div>
                      <h2 className="text-lg font-semibold text-black">
                        Status mix
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="p-6 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserWrapper>
  );
}

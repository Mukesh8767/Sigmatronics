import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Activity,
  BarChart3,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchDevice } from '../../hooks/useFetchdevice';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';
import MachineOverview, { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import UserWrapper from '../Wrappers/UserWrapper';

const useAnomalyStats = () => ({ today: 2, thisWeek: 6 });

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
};

const StatCard = ({ title, value, icon, trend }: StatCardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="text-gray-700">{icon}</div>
      {trend && (
        <span className="text-xs text-green-500 font-medium flex items-center">
          <TrendingUp size={12} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
  </div>
);

type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

const ActionCard = ({ title, description, icon, onClick }: ActionCardProps) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="text-gray-700">{icon}</div>
      <ChevronRight className="text-gray-400 w-4 h-4" />
    </div>
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

export const UserDashboard = () => {
  const { userId } = useParams();
  //@ts-ignore
  const { user } = useUserProfile(userId!);
  const { devices } = useFetchDevice(userId!);
  const alerts = useFetchLiveAlerts();
  const { today, thisWeek } = useAnomalyStats();
  const navigate = useNavigate();

  const total = devices.length;
  const online = devices.filter((d) => d.status === 'active').length;
  const offline = total - online;
  const uptime = total > 0 ? Math.round((online / total) * 100) : 0;

  return (
    <UserWrapper>
      <div className="bg-white min-h-screen px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Top Greeting */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back 👋</h1>
            <p className="text-sm text-gray-500">Hi {user?.name || 'User'}, your monitoring dashboard is ready.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="Total Machines" value={total} icon={<Cpu size={20} />}  />
            <StatCard title="Online" value={online} icon={<Wifi size={20} />} trend={`${uptime}%`} />
            <StatCard title="Offline" value={offline} icon={<WifiOff size={20} />} trend={undefined} />
            <StatCard title="Today's Alerts" value={today} icon={<AlertTriangle size={20}  />} trend={undefined} />
            <StatCard title="Weekly Anomalies" value={thisWeek} icon={<Activity size={20} />} trend={undefined} />
          </div>

          {/* Mid Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="Machine Fleet"
              description="Monitor, control, and analyze devices"
              icon={<Cpu size={20} />}
              onClick={() => navigate('machines')}
            />
            <ActionCard
              title="Anomaly Intelligence"
              description="AI-powered detection and alerts"
              icon={<Shield size={20} />}
              onClick={() => navigate(`/user/${userId}/anamoly`)}
            />
            <ActionCard
              title="Advanced Analytics"
              description="Insights on fuel, usage & performance"
              icon={<BarChart3 size={20} />}
              onClick={() => navigate(`/user/${userId}/analytics`)}
            />
          </div>

          {/* Bottom Panel: Alerts + Table */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

            {/* Live Alerts */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-md">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800" >Live Alerts</h2>
                </div>
                <button className="text-sm text-blue-600 hover:underline flex items-center" onClick={() => navigate(`/user/${userId}/anamoly`)}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {alerts.alerts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <Shield size={24} className="mx-auto mb-2 text-emerald-500" />
                  <p>No active alerts. All systems are normal.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {alerts.alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 items-start"
                    >
                      <div className="text-red-500">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{alert.message}</p>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {formatUpdatedAt(alert.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fleet Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <Cpu size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Fleet Overview</h2>
              </div>
              <MachineOverview
                devices={devices}
              />
            </div>
          </div>
        </div>
      </div>
    </UserWrapper>
  );
};

export default UserDashboard;

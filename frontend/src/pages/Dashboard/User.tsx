import {
  AlertTriangle,
  Cpu,
  Activity,
  BarChart3,
  Wifi,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchDevice } from '../../hooks/useFetchdevice';
import UserWrapper from '../Wrappers/UserWrapper';
import { useUserProfile } from '../../hooks/useUserProfile';
import StatCard from '../../components/cards.tsx/statCard';
import QuickCard from '../../components/cards.tsx/QuickCard';
import MachineOverview, { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';

const useAnomalyStats = () => ({ today: 0, thisWeek: 0 });

export const UserDashboard = () => {
  const { userId } = useParams();
  //@ts-ignore
  const { user, loading: profileLoading, error: profileError } = useUserProfile(userId!);
  const { devices, loading } = useFetchDevice(userId!); // ✅ pass userId
  const total = devices.length;
  const online = devices.filter((device) => device.status === 'active').length;
  const offline = devices.filter((device) => device.status !== 'active').length;

  const { today, thisWeek } = useAnomalyStats();
  const alerts = useFetchLiveAlerts();
  const navigate = useNavigate();
  return (
    <UserWrapper>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                {user?.name || 'User'}
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              Here's a quick overview of your system
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Machines" value={total} icon={<Cpu size={28} />} />
            <StatCard title="Machines Online" value={online} icon={<Wifi size={28} />} />
            <StatCard title="Machines Offline" value={offline} icon={<WifiOff size={28} />} />
            <StatCard title="Anomalies Today" value={today} icon={<AlertTriangle size={28} />} />
            <StatCard title="Anomalies This Week" value={thisWeek} icon={<Activity size={28} />} />
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <QuickCard
              title="View All Machines"
              description="Monitor and control your machines"
              icon={<Cpu size={24} />}
              onClick={() => navigate('machines')}
            />
            <QuickCard
              title="View All Anomalies"
              description="Track detected issues"
              icon={<AlertTriangle size={24} />}
              onClick={() => navigate('/user/anomalies')}
            />
            <QuickCard
              title="Go to Analysis"
              description="Fuel usage and machine performance"
              icon={<BarChart3 size={24} />}
              onClick={() => navigate('/user/analysis')}
            />
          </div>

          {/* Live Alerts */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              Live Anomaly Alerts
              <div className="ml-auto flex items-center gap-2">
                
                <span className="text-sm text-gray-600 flex items-center font-normal hover:text-black cursor-pointer">More <ChevronRight className='w-4 h-4 mt-1'/></span>
              </div>
            </h2>

            {alerts.alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ✅ All systems operating normally.
              </div>
            ) : (
              <ul className="space-y-4">
                {alerts.alerts.map((alert, idx) => (
                  <li
                    key={idx}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 hover:bg-red-100 transition"
                  >
                    {alert.message}
                    <div className='text-[12px] text-red-500'>{formatUpdatedAt(alert.createdAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Machine Overview Table */}
          <MachineOverview devices={devices} loading={loading} error="Failed to load data" />
        </div>
      </div>
    </UserWrapper>
  );
};

export default UserDashboard;

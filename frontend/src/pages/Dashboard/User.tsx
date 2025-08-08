import React from 'react';
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
  Bell,
  Settings,
  Filter,
  RefreshCw
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
  trendUp?: boolean;
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp = true, className = "" }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600">
        {icon}
      </div>
      {trend && (
        <span className={`text-sm font-medium flex items-center px-2 py-1 rounded-full ${
          trendUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
        }`}>
          <TrendingUp size={12} className={`mr-1 ${!trendUp && 'rotate-180'}`} />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-black">{value}</p>
  </div>
);

type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  gradient?: string;
};

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, onClick, gradient = "from-blue-500 to-indigo-600" }) => (
  <div
    onClick={onClick}
    className="cursor-pointer group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
    <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700">
      Explore <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

export function UserDashboard(){
  const { userId } = useParams();
  const { user } = useUserProfile(userId!);
  const { devices } = useFetchDevice(userId!);
  const alerts = useFetchLiveAlerts();
  const { today, thisWeek } = useAnomalyStats();
  const navigate = useNavigate();

  const total = devices.length;
  const online = devices.filter((d) => d.status === 'active').length;
  const offline = total - online;
  const uptime = total > 0 ? Math.round((online / total) * 100) : 0;
  const currentDate=new Date().toString().slice(0,10);
  const alertCount=alerts.alerts.filter(alert=>
    new Date(alert.createdAt).toString().slice(0,10)===currentDate
  ).length


  return (
    <UserWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Welcome back, {user?.name || 'User'}</p>
              </div>
              <div className="flex items-center space-x-4">
                
                <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={()=>navigate(`/user/${userId}/anamoly`)}>
                  <Bell size={20} className="text-gray-700"  />
                  {alertCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{alertCount}</span>
                    </div>
                  )}
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Settings size={20} className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard 
              title="Total Machines" 
              value={total} 
              icon={<Cpu size={24} />}
            />
            <StatCard 
              title="Online Now" 
              value={online} 
              icon={<Wifi size={24} />}
              trend={`${uptime}%`}
              trendUp={true}
            />
            <StatCard 
              title="Offline" 
              value={offline} 
              icon={<WifiOff size={24} />}
            />
            <StatCard 
              title="Today's Alerts" 
              value={today} 
              icon={<AlertTriangle size={24} />}
            />
            <StatCard 
              title="Weekly Anomalies" 
              value={thisWeek} 
              icon={<Activity size={24} />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              title="Machine Fleet"
              description="Monitor, control, and analyze devices"
              icon={<Cpu size={24} />}
              onClick={() => navigate(`/user/${userId}/machines`)}
              gradient="from-blue-500 to-blue-600"
            />
            <ActionCard
              title="Anomaly Intelligence"
              description="AI-powered detection and alerts"
              icon={<Shield size={24} />}
              onClick={() => navigate(`/user/${userId}/anamoly`)}
              gradient="from-purple-500 to-purple-600"
            />
            <ActionCard
              title="Advanced Analytics"
              description="Insights on fuel, usage & performance"
              icon={<BarChart3 size={24} />}
              onClick={() => navigate(`/user/${userId}/analytics`)}
              gradient="from-emerald-500 to-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600">
                        <Cpu size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-black">Fleet Overview</h2>
                        <p className="text-sm text-gray-600">{online} of {total} devices online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-black flex items-center">
                        <Filter size={16} className="mr-2" />
                        Filter
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <RefreshCw size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6">
                  <MachineOverview devices={devices} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl text-red-600">
            <Zap size={20} />
          </div>
          <h2 className="text-lg font-semibold text-black">Live Alerts</h2>
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
          <Shield size={32} className="mx-auto mb-3 text-green-500" />
          <p className="text-gray-600">No active alerts. All systems are normal.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-135 overflow-y-auto pr-2">
          {alerts.alerts.map((alert, i) => (
            <div key={i} className="p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">{alert.message}</p>
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
</div>

          </div>
        </div>
      </div>
    </UserWrapper>
  );
}
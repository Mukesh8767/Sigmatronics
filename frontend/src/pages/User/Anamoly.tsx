import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
  Filter,
  X,
  Calendar,
  Search
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import { AlertsSkeleton } from '../../components/DeviceLoader';
import UserWrapper from '../Wrappers/UserWrapper';
import { transformMachineCode } from '../../components/machineCodeEncoder';

export const Anamoly = () => {
  const { alerts = [], loading, error } = useFetchLiveAlerts();
  const [selectedDate, setSelectedDate] = useState<string>(''); // Format: YYYY-MM-DD
  const [searchDevice, setSearchDevice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const isSameDate = (dateStr: string, selected: string): boolean => {
    const alertDate = new Date(dateStr);
    const selectedDateObj = new Date(selected);
    return (
      alertDate.getDate() === selectedDateObj.getDate() &&
      alertDate.getMonth() === selectedDateObj.getMonth() &&
      alertDate.getFullYear() === selectedDateObj.getFullYear()
    );
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesDate = selectedDate ? isSameDate(alert.createdAt, selectedDate) : true;
      const matchesDevice = searchDevice
        ? transformMachineCode(alert.machineId).toLowerCase().includes(searchDevice.toLowerCase())
        : true;
      return matchesDate && matchesDevice;
    });
  }, [alerts, selectedDate, searchDevice]);

  const todayCount = alerts.filter(alert => isSameDate(alert.createdAt, new Date().toISOString())).length;

  const AlertCard = ({ alert }: { alert: any }) => {
    const isTodayAlert = isSameDate(alert.createdAt, new Date().toISOString());

    return (
      <div
        className={`group relative rounded-2xl p-4 transition-all duration-300 ${isTodayAlert
          ? 'bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30'
          : 'bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-[#2C2C2E]'
          } hover:shadow-md cursor-default`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isTodayAlert
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-[#3A3A3C] text-gray-600 dark:text-[#8E8E93]'
              }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate">
                  {transformMachineCode(alert.machineId)}
                </p>
                <p className="text-sm text-[#424245] dark:text-[#E5E5EA] mt-0.5 leading-relaxed">
                  {alert.message}
                </p>
              </div>
              {isTodayAlert && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold text-[10px] tracking-wide uppercase">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-[#86868B] dark:text-[#98989D]">
                <Clock className="w-3.5 h-3.5" />
                {formatUpdatedAt(alert.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="flex flex-col items-center sm:items-start px-4 first:pl-0 border-r border-gray-200 dark:border-[#2C2C2E] last:border-0 last:pr-0">
      <p className="text-xs font-medium text-[#86868B] uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <p className="text-xl font-bold text-[#1D1D1F] dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <UserWrapper>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black font-sans pb-12 transition-colors duration-300">

        {/* Header Block */}
        <div className="sticky top-0 z-30 bg-[#F5F5F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-[#1C1C1E]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1D1D1F] dark:text-white">Anomalies</h1>
                  <div className="flex items-center gap-2 text-xs text-[#86868B]">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Real-time Monitoring Active</span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              {!loading && (
                <div className="flex items-center bg-white dark:bg-[#1C1C1E] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-[#2C2C2E] overflow-x-auto no-scrollbar">
                  <StatItem label="Total" value={alerts.length} color="bg-blue-500" />
                  <StatItem label="Today" value={todayCount} color="bg-orange-500" />
                  <StatItem label="Shown" value={filteredAlerts.length} color="bg-green-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#86868B]">
              {filteredAlerts.length} Alert{filteredAlerts.length !== 1 ? 's' : ''} found
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 border ${showFilters
                ? 'bg-[#0071E3] text-white border-transparent shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white border-gray-200 dark:border-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/80'
                }`}
              title="Filter Alerts"
            >
              {showFilters ? <X size={20} /> : <Filter size={20} />}
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-48 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-[#2C2C2E]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#86868B] uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar size={12} /> Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-[#F5F5F7] dark:bg-black rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] dark:text-white border-none focus:ring-2 focus:ring-[#0071E3] transition-shadow outline-none"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#86868B] uppercase tracking-wide flex items-center gap-1.5">
                    <Search size={12} /> Device
                  </label>
                  <input
                    type="text"
                    placeholder="Search ID..."
                    className="w-full bg-[#F5F5F7] dark:bg-black rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] dark:text-white border-none focus:ring-2 focus:ring-[#0071E3] transition-shadow outline-none placeholder:text-gray-400"
                    value={searchDevice}
                    onChange={e => setSearchDevice(e.target.value)}
                  />
                </div>
              </div>
              {(selectedDate || searchDevice) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => { setSelectedDate(''); setSearchDevice(''); }}
                    className="text-xs font-semibold text-[#0071E3] hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <AlertsSkeleton />
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4 opacity-80" />
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Unable to Load Alerts</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-[#2C2C2E] rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white mb-2">All Clear</h3>
              <p className="text-[#86868B] max-w-sm mx-auto">
                No anomalies detected matching your filters. System is operating normally.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAlerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          )}
        </div>

      </div>
    </UserWrapper>
  );
};

export default Anamoly;

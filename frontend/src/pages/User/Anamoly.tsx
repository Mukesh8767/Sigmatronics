import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  Zap,
  Bell,
  Filter,
  Loader2
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import AlertSkeleton from '../../components/DeviceLoader';
import UserWrapper from '../Wrappers/UserWrapper';
import { Button } from '../../components/button';
import { transformMachineCode } from '../../components/machineCodeEncoder';

export const Anamoly = () => {
  const { alerts = [], loading, error } = useFetchLiveAlerts();
  const [selectedDate, setSelectedDate] = useState<string>(''); // Format: YYYY-MM-DD
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

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
      const matchesSeverity = selectedSeverity === 'all' ? true : (alert as any).severity === selectedSeverity;
      return matchesDate && matchesSeverity;
    });
  }, [alerts, selectedDate, selectedSeverity]);

  const AlertCard = ({ alert }: { alert: any }) => {
    const isTodayAlert = isSameDate(alert.createdAt, new Date().toISOString());

    return (
      <div
        className={`rounded-lg border p-4 shadow-sm transition-all ${isTodayAlert
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3 items-start">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isTodayAlert ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {transformMachineCode(alert.machineId)} : {alert.message}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatUpdatedAt(alert.createdAt)}
                </span>
                {isTodayAlert && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-semibold text-xs">
                    Today
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatsCard = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: number;
  }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e7eb] flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-[#5f6b7a]">{label}</p>
        <p className="text-3xl font-bold text-[#0f172a] mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <UserWrapper>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 bg-white">
        <header className="flex flex-col gap-2 text-[#0f172a]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Realtime anomaly center</p>
                <h1 className="text-2xl font-bold text-[#0f172a]">Alerts & Anomalies</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Live monitoring active</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Track anomalies per device with AWS-style clarity.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Alerts</p>
                <p className="text-2xl font-semibold text-slate-900">{alerts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Filtered</p>
                <p className="text-2xl font-semibold text-slate-900">{filteredAlerts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Today</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {alerts.filter(alert =>
                    isSameDate(alert.createdAt, new Date().toISOString())
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm text-[#4b5563]">Filters</p>
              <h3 className="text-lg font-semibold text-[#111827]">Refine alerts</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[#4b5563]">
                <Filter className="w-4 h-4" />
                <span>Date</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                  <Button variant='secondary' onClick={() => setSelectedDate('')}>
                    Clear
                  </Button>
                )}
              </div>
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value)}
              >
                <option value="all">All severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                icon={Zap}
                label="Live alerts"
                value={filteredAlerts.length}
              />
              <StatsCard
                icon={Bell}
                label="Total alerts"
                value={alerts.length}
              />
              <StatsCard
                icon={Shield}
                label="Healthy devices"
                value={Math.max(0, alerts.length - filteredAlerts.length)}
              />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <AlertSkeleton />}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              Unable to Load Alerts
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* No Alerts */}
        {!loading && !error && filteredAlerts.length === 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-3">
              No Alerts Found
            </h3>
            <p className="text-lg text-green-700 mb-4">
              No alerts available for the selected date.
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Shield className="w-5 h-5" />
              <span className="font-medium">System Status: Healthy</span>
            </div>
          </div>
        )}

        {/* Alerts */}
        {!loading && !error && filteredAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Showing {filteredAlerts.length} Alert{filteredAlerts.length !== 1 ? 's' : ''}
            </h2>
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </UserWrapper>
  );
};

export default Anamoly;

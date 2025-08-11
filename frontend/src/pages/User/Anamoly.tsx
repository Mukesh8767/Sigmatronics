import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  Zap,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import AlertSkeleton from '../../components/DeviceLoader';
import UserWrapper from '../Wrappers/UserWrapper';
import { Button } from '../../components/button';
import { transformMachineCode } from '../../components/machineCodeEncoder';

export const Anamoly = () => {
  const { alerts = [], loading, error } = useFetchLiveAlerts();
  const [selectedDate, setSelectedDate] = useState<string>(''); // Format: YYYY-MM-DD

  const isSameDate = (dateStr: string, selected: string): boolean => {
    const alertDate = new Date(dateStr);
    const selectedDateObj = new Date(selected);
    return (
      alertDate.getDate() === selectedDateObj.getDate() &&
      alertDate.getMonth() === selectedDateObj.getMonth() &&
      alertDate.getFullYear() === selectedDateObj.getFullYear()
    );
  };

  const filteredAlerts = selectedDate
    ? alerts.filter(alert => isSameDate(alert.createdAt, selectedDate))
    : alerts;

  const AlertCard = ({ alert }: { alert: any }) => {
    const isTodayAlert = isSameDate(alert.createdAt, new Date().toISOString());

    return (
      <div
        className={`rounded-lg border p-4 shadow-sm transition-all ${
          isTodayAlert
            ? 'bg-blue-50 border-blue-300'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3 items-start">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isTodayAlert ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
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
    color
  }: {
    icon: any;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <UserWrapper>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <div className="flex items-center  gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
          </div>
          <p className="text-sm text-gray-600 flex">
            Live monitoring of anomalies, thresholds, and events in your system
          </p>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="w-4 h-4" />
            <span>Live monitoring active</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="date-filter" className="text-sm text-gray-600">
              Filter by Date:
            </label>
            <input
              type="date"
              id="date-filter"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <Button children={"Clear"} variant='secondary' onClick={() => setSelectedDate('')}/>
            )}
          </div>
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatsCard
              icon={Zap}
              label={selectedDate ? "Filtered Alerts" : "Today's Alerts"}
              value={
                selectedDate
                  ? filteredAlerts.length
                  : alerts.filter(alert =>
                      isSameDate(alert.createdAt, new Date().toISOString())
                    ).length
              }
              color="bg-blue-500"
            />
            <StatsCard
              icon={Bell}
              label="Total Alerts"
              value={alerts.length}
              color="bg-gray-500"
            />
          </div>
        )}

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
            <h2 className="text-xl font-semibold text-gray-800">
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

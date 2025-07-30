import { AlertTriangle } from 'lucide-react';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import AlertSkeleton from '../../components/DeviceLoader';
import UserWrapper from '../Wrappers/UserWrapper';

export const Anamoly = () => {
  const { alerts = [], loading, error } = useFetchLiveAlerts();

  return (
    <UserWrapper>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="text-red-600" size={24} />
            <h1 className="text-2xl font-semibold text-gray-900">Live Alerts</h1>
          </div>
          <p className="text-sm text-gray-500">
            Real-time fuel level or anomaly alerts from your devices.
          </p>
        </header>

        {/* Loading Skeleton */}
        {loading && <AlertSkeleton />}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* No Alerts */}
        {!loading && !error && alerts.length === 0 && (
          <div className="bg-green-50 text-green-700 text-center py-6 rounded-xl">
            ✅ All systems are operating within normal parameters.
          </div>
        )}

        {/* Alert List */}
        {!loading && !error && alerts.length > 0 && (
          <ul className="space-y-4">
            {alerts.map((alert, idx) => (
              <li
                key={idx}
                className=" border border-red-200 text-red-900 rounded-xl p-4 shadow-sm hover:bg-red-100 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-base">{alert.message}</div>
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {formatUpdatedAt(alert.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserWrapper>
  );
};

export default Anamoly;

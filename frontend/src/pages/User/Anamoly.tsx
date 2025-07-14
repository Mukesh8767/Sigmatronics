import { AlertTriangle } from 'lucide-react';
import { useFetchLiveAlerts } from '../../hooks/useFetchLiveAlerts';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import AlertSkeleton from '../../components/DeviceLoader'; 
import UserWrapper from '../Wrappers/UserWrapper';

export const Anamoly = () => {
  const { alerts = [], loading, error } = useFetchLiveAlerts();

  return (
    <UserWrapper>
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="text-red-600" /> Live Alerts
          </h1>
          <p className="text-sm text-slate-500">
            Real-time fuel level or anomaly alerts from your devices.
          </p>
        </div>
      </div>

      {loading && <AlertSkeleton />} 
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && alerts.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          ✅ All systems are operating within normal parameters.
        </div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <ul className="space-y-4">
          {alerts.map((alert, idx) => (
            <li
              key={idx}
              className="bg-red-50   rounded-xl p-4 text-red-900 hover:bg-red-100 hover:border-white transition"
            >
              <div className="font-medium text-base">{alert.message}</div>
              <div className="text-sm text-red-500 mt-1">
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

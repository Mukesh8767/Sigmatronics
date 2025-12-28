import { Cpu } from "lucide-react";
import UserWrapper from "../Wrappers/UserWrapper";
import { useUserDeviceSolutions } from "../../hooks/useUserDeviceSolutions";
import { SolutionTable } from "../../components/tables/SolutionTable";
import { useParams, Outlet } from "react-router-dom"; // ✅ Import Outlet
import SolutionTableSkeleton from "../../components/DeviceLoader";

export const UserMachines = () => {
  const { userId } = useParams();
  const { solutions = [], loading, error } = useUserDeviceSolutions(userId || "");

  return (
    <UserWrapper>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-1 text-black">
              <Cpu /> Device Readings
            </h1>
            <p className="text-sm text-slate-500">
              Monitor and retrieve your device's data and reports.
            </p>
          </div>
        </div>

        {loading && <SolutionTableSkeleton />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && solutions.length > 0 && (
          // @ts-ignore
          <SolutionTable data={solutions} />
        )}
        {!loading && !error && solutions.length === 0 && (
          <p className="text-gray-500">No solutions found for this user.</p>
        )}

        <Outlet />
      </div>
    </UserWrapper>
  );
};

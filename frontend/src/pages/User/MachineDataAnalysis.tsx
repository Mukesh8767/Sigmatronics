import { Outlet, useParams } from "react-router-dom";
import { Cpu } from "lucide-react";
import { useUserDeviceSolutions } from "../../hooks/useUserDeviceSolutions";
import { AnalysisSolutionTable } from "../../components/tables/AnalysisSolutionTable";
import SolutionTableSkeleton from "../../components/DeviceLoader";

export const MachineDataAnalysis = () => {
  const { userId } = useParams();
  const { solutions = [], loading, error } = useUserDeviceSolutions(userId || "");

  return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-1">
              <Cpu /> Machines
            </h1>
            <p className="text-sm text-slate-500">
              Monitor and retrieve your machine's data and reports.
            </p>
          </div>
        </div>

        {loading && <SolutionTableSkeleton/>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && solutions.length > 0 && (
          // @ts-ignore
          <AnalysisSolutionTable data={solutions} />
        )}
        {!loading && !error && solutions.length === 0 && (
          <p className="text-gray-500">No solutions found for this user.</p>
        )}

        <Outlet />  
      </div>
  );
};

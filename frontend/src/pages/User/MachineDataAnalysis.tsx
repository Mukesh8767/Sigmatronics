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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-black">
            <Cpu className="text-blue-600" />
            Machine Data Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time data from your connected machines.
          </p>
        </div>
      </div>

      {loading && <SolutionTableSkeleton />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          <p className="font-medium">Error loading machine solutions:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && solutions.length > 0 && (
        <AnalysisSolutionTable
          data={solutions.map((s) => ({
            solutionType: s.solutionType,
            freq: s.freq,
            //@ts-ignore
            solutionName: s.solutionName 
          }))}
        />
      )}

      {!loading && !error && solutions.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 text-gray-600 rounded-lg p-6 text-center mb-6">
          <p className="text-md font-medium">No solutions found for this user.</p>
          <p className="text-sm mt-1">
            You can begin by configuring analysis solutions to see machine data here.
          </p>
        </div>
      )}

      <Outlet />
    </div>
  );
};

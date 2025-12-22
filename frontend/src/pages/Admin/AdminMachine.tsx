import { useEffect, useState } from "react";
import DeviceAssignmentForm from "../../components/forms/AssignMachineForm";
import MachineAssignmentTable from "../../components/tables/MachineAssignmentTable";
import { useAllFetchRootUsers } from "../../hooks/useFetchadminUsers";
import { useSolutions } from "../../hooks/useFetchSolutions";
import axiosInstance from "../../../utils/axiosInstance";
import AdminWrapper from "../Wrappers/AdminWrapper";
import { Button } from "../../components/button";
import { Cpu, Search } from "lucide-react";

export const AdminMachine = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<string>("");
  const [machineTransactions, setMachineTransactions] = useState<any[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [val, setVal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = 5;

  const { users, loading, error } = useAllFetchRootUsers();
  const { solutions = [] } = useSolutions();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedSolution) return;
      try {
        const response = await axiosInstance.get(
          `/api/device/by-solution?solutionType=${selectedSolution}&page=${currentPage}&limit=${pageSize}`
        );
        const data = response.data.data || [];
        setMachineTransactions(data);
        setFilteredMachines(data);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch machines by solution", err);
      }
    };

    fetchTransactions();
  }, [selectedSolution, currentPage, val]);

  const handleRefresh = () => {
    setVal((prev) => !prev);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lower = query.toLowerCase();
    const filtered = machineTransactions.filter((m: any) =>
      m.machineId?.toLowerCase().includes(lower) || m.loca?.toLowerCase().includes(lower)
    );
    setFilteredMachines(filtered);
  };

  return (
    <AdminWrapper>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Manage and Assign Devices</h1>
            <p className="text-sm text-gray-500">
              Assign devices to users and manage existing ones.
            </p>
          </div>

          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            size="sm"
            className="inline-flex items-center gap-2 mt-4 md:mt-0"
          >
            <Cpu className="w-4 h-4" />
            Assign Device(s)
          </Button>
        </div>

        {showForm && (
          <div className="mt-6">
            <DeviceAssignmentForm
              users={users}
              loading={loading}
              error={error}
              onClose={() => setShowForm(false)}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        <div className="mt-12">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Filter by Solution Type
          </label>
          <select
            value={selectedSolution}
            onChange={(e) => {
              setSelectedSolution(e.target.value);
              setCurrentPage(1);
              setSearchQuery("");
            }}
            className="w-full md:w-72 px-5 py-3 rounded-2xl shadow-md"
          >
            <option value="">-- Select Solution --</option>
            {solutions.map((sol: any) => (
              <option key={sol.code} value={sol.code}>
                {sol.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSolution && (
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search by Machine ID or Location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full md:w-96 px-4 py-3 border rounded-xl shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        )}

        <div className="mt-10">
          {selectedSolution ? (
            <MachineAssignmentTable
              onRefresh={handleRefresh}
              data={filteredMachines}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center mt-16 px-6">
              <Search className="w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Select a Solution to View Assignments
              </h2>
              <p className="text-sm text-gray-500 max-w-md">
                Use the dropdown above to choose a solution type and view assigned machines.
                If you haven’t created any assignments yet, start by clicking “Assign Device(s)” above.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminWrapper>
  );
};

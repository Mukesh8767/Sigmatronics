import AdminWrapper from "../Wrappers/AdminWrapper";
import { Plus, Trash2, Pencil } from "lucide-react";
import CreateSolutionForm from "../../components/forms/CreateSolutionForm";

import { Button } from "../../components/button";
import { useSolutions } from "../../hooks/useFetchSolutions";
import { useState } from "react";
import SolutionCardSkeleton from "../../components/SolutionLoader";

export function AdminSolution() {
  const {
    solutions,
    loading,
    error,
    createSolution,
    deleteSolution,
    updateSolution
  } = useSolutions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);

  const handleCreateOrEditSolution = async (data: any) => {
    try {
      if (data._id) {
        await updateSolution(data._id, data);
        alert("Solution updated successfully!");
      } else {
        await createSolution(data);
        alert("Solution created successfully!");
      }
    } catch {
      alert("Error saving solution. Please try again.");
    } finally {
      setEditData(null);
    }
  };

  const handleDeleteSolution = async (id: string) => {
    try {
      await deleteSolution(id);
    } catch {
      alert("Error deleting solution. Please try again.");
    }
  };

  const handleEditSolution = (solution: any) => {
    setEditData(solution);
    setIsModalOpen(true);
  };

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Solutions</h1>
            <p className="text-sm text-slate-500">View and manage all of your solutions here.</p>
          </div>
          <Button
            onClick={() => {
              setEditData(null);
              setIsModalOpen(true);
            }}
            variant="outline"
            size="sm"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 cursor-pointer" />
            Add Solution
          </Button>
        </div>

        {loading ? (
          <p><SolutionCardSkeleton /></p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution) => (
              <div
                key={solution._id}
                className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition relative"
              >
                <button
                  onClick={() => handleDeleteSolution(solution._id)}
                  className="absolute top-4 right-4 text-black hover:text-red-500 transition"
                  title="Delete Solution"
                >
                  <Trash2 className="w-5 h-5 cursor-pointer" />
                </button>

                <button
                  onClick={() => handleEditSolution(solution)}
                  className="absolute top-4 right-12 text-black hover:text-blue-500 transition"
                  title="Edit Solution"
                >
                  <Pencil className="w-5 h-5 cursor-pointer" />
                </button>

                <h2 className="text-lg font-semibold text-slate-800 mb-1">
                  {solution.name}
                 </h2>
                <p className="text-sm text-slate-500 mb-2">{solution.description}</p>
                <p className="text-xs text-slate-400 mb-3">
                  Code: <span className="font-mono text-slate-600">{solution.code}</span>
                </p>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Parameters:</p>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {solution.parameters.map((param, i) => (
                      <li key={i}>
                        <span className="font-semibold">{param.label || param.key}</span>{" "}
                        <span className="text-slate-500">
                          ({param.type}{param.unit ? `, ${param.unit}` : ""})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateSolutionForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          onSubmit={handleCreateOrEditSolution}
          initialData={editData}
        />
      </div>
    </AdminWrapper>
  );
}

import AdminWrapper from "../Wrappers/AdminWrapper";
import { Plus, Trash2, Pencil, Bell, BellOff, Copy, ExternalLink } from "lucide-react";
import CreateSolutionForm from "../../components/forms/CreateSolutionForm";

import { Button } from "../../components/button";
import { useSolutions } from "../../hooks/useFetchSolutions";
import { useState } from "react";
import SolutionCardSkeleton from "../../components/SolutionLoader";
import { transformSolutionCode } from "../../components/solutionCodeEncode";

export function AdminSolution() {
  const {
    solutions,
    loading,
    error,
    createSolution,
    deleteSolution,
    updateSolution
  } = useSolutions();

  const BASE_URL = "http://16.170.250.207/createDeviceReading?machineCode={machineCode}";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      setIsModalOpen(false);
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

  // Build template URL with placeholders {paramKey}
  const buildTemplateUrl = (solution: any) => {
    const params = Array.isArray(solution.parameters) ? solution.parameters : [];
    // Put machine-like param first
    const machineParam = params.find((p: any) => /machine|code/i.test(p.key)) ?? params[0];
    const ordered = machineParam ? [machineParam, ...params.filter((p: any) => p !== machineParam)] : params;
    const qs = ordered
      .map((p: any) => `${encodeURIComponent(p.key)}={${encodeURIComponent(p.key)}}`)
      .join("&");
    return `${BASE_URL}${BASE_URL.includes("?") ? "&" : "?"}${qs}`;
  };

  // Build a test URL replacing placeholders with sample values
 

  const copyTemplate = async (solution: any) => {
    const url = buildTemplateUrl(solution);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(solution._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
      alert("Copy failed — your browser may block clipboard. Try selecting the URL manually.");
    }
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
  {/* Delete Button */}
  <button
    onClick={() => handleDeleteSolution(solution._id)}
    className="absolute top-4 right-4 text-black hover:text-red-500 transition"
    title="Delete Solution"
  >
    <Trash2 className="w-5 h-5 cursor-pointer" />
  </button>

  {/* Edit Button */}
  <button
    onClick={() => handleEditSolution(solution)}
    className="absolute top-4 right-12 text-black hover:text-blue-500 transition"
    title="Edit Solution"
  >
    <Pencil className="w-5 h-5 cursor-pointer" />
  </button>

  {/* Title + Description */}
  <h2 className="text-lg font-semibold text-slate-800 mb-1">
    {solution.name}
  </h2>

  <p className="text-sm text-slate-500 mb-2">{solution.description}</p>

  {/* Code Info */}
  <div className="text-xs text-slate-400 mb-3">
    <div>
      Code:
      <span className="font-mono text-slate-600"> {solution.code}</span>
    </div>

    <div>
      Display Code:
      <span className="font-mono text-slate-600">
        {" "}{transformSolutionCode(solution.code)}
      </span>
    </div>
  </div>

  {/* Parameters */}
  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Parameters:</p>

    <ul className="list-inside text-sm space-y-1 mb-12">
      {Array.isArray(solution.parameters) && solution.parameters.length > 0 ? (
        solution.parameters.map((param, i) => (
          <li key={i} className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700">
                {param.label || param.key}
              </span>
              <span className="text-slate-500">
                {" "}({param.type}{param.unit ? `, ${param.unit}` : ""})
              </span>
            </div>

            <div className="text-lg text-slate-700">
              {param.alert
                ? <Bell className="w-4 h-4 text-slate-500" />
                : <BellOff className="w-4 h-4 text-slate-500" />}
            </div>
          </li>
        ))
      ) : (
        <li className="text-slate-500 text-sm">No parameters defined.</li>
      )}
    </ul>
  </div>

 
  <div className="absolute bottom-4 right-4">
    <button
      onClick={() => copyTemplate(solution)}
      className="
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        bg-gray-100 hover:bg-gray-200 border border-gray-300
        transition-all duration-200 shadow-sm
      "
      title="Copy template URL"
    >
      <Copy className="w-4 h-4 text-gray-600" />
      {copiedId === solution._id ? "Copied!" : "Copy URL"}
    </button>
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

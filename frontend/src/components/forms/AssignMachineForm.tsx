import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, Settings, X, MapPin } from 'lucide-react';
import { Button } from '../button';
import Input from '../input';
import { useAllFetchRootUsers } from '../../hooks/useFetchadminUsers';
import { useSolutions } from '../../hooks/useFetchSolutions';
import axios from 'axios';
import axiosInstance from '../../../utils/axiosInstance';

export interface DeviceAssignmentFormProps {
  users: any[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

const DeviceAssignmentForm: React.FC<DeviceAssignmentFormProps> = ({ onClose, onRefresh }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    assignedTo: '',
    solutionType: '',
    numberOfMachines: 1,
    machineDetails: [{ id: '', loca: '', capacity: '' }]
  });
  console.log(formData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { users = [] } = useAllFetchRootUsers();
  const { solutions = [] } = useSolutions();
  console.log(solutions);

  useEffect(() => {
    setFormData(prev => {
      const updatedDetails = Array(prev.numberOfMachines).fill('').map((_, i) => ({
        id: prev.machineDetails[i]?.id || '',
        loca: prev.machineDetails[i]?.loca || '',
        capacity: prev.machineDetails[i]?.capacity || ''
      }));
      return { ...prev, machineDetails: updatedDetails };
    });
  }, [formData.numberOfMachines]);

  const handleStep1Change = (field: string, value: any) => {
    setErrorMessage(null);
    if (field === 'numberOfMachines') {
      const safeValue = Math.max(1, parseInt(value) || 1);
      setFormData(prev => ({
        ...prev,
        numberOfMachines: safeValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleMachineDetailChange = (index: number, field: 'id' | 'loca' | 'capacity', value: string) => {
    const updated = [...formData.machineDetails];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, machineDetails: updated }));
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const idsTrimmed = formData.machineDetails.map(m => m.id.trim());
    const fullIds = idsTrimmed.map(id => `${formData.solutionType}${id}`);
    const idSet = new Set(fullIds);

    if (idSet.size !== fullIds.length) {
      setErrorMessage("Duplicate Machine IDs detected. Please ensure all IDs are unique.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      assignedTo: formData.assignedTo,
      solutionType: formData.solutionType,
      numberOfMachines: formData.numberOfMachines,
      machineIds: fullIds,
      loca: formData.machineDetails.map(m => m.loca),
      capacities: formData.machineDetails.map(m => m.capacity)
    };

    try {
      const response = await axiosInstance.post(`/api/device/create-multiple`, payload);

      if (response.status >= 200 && response.status < 300) {
        setFormData({
          assignedTo: '',
          solutionType: '',
          numberOfMachines: 1,
          machineDetails: [{ id: '', loca: '', capacity: '' }]
        });
        setCurrentStep(1);
        onRefresh();
        onClose();
      } else {
        setErrorMessage(`Error: ${response.statusText}`);
      }
    } catch (error: any) {
      if (error.response?.data?.message && error.response?.data?.existingMachineIds) {
        setErrorMessage(`Some machine IDs already exist: ${error.response.data.existingMachineIds.join(', ')}`);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid =
    formData.assignedTo &&
    formData.solutionType &&
    formData.numberOfMachines > 0;

  const isStep2Valid =
    formData.machineDetails.every(d => d.id.trim() !== '' && d.capacity.trim() !== '') &&
    formData.machineDetails.length === formData.numberOfMachines;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl mx-4 md:mx-6 rounded-2xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-black" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Device Assignment</h2>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                value={formData.numberOfMachines.toString()}
                onChange={(e) => handleStep1Change('numberOfMachines', parseInt(e.target.value))}
                placeholder="Number of Machines"
                icon={Plus}
              />

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleStep1Change('assignedTo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Solution Type</label>
                <select
                  value={formData.solutionType}
                  onChange={(e) => handleStep1Change('solutionType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
                >
                  <option value="">Select solution</option>
                  {solutions.map(sol => (
                    <option key={sol.code} value={sol.code}>{sol.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} disabled={!isStep1Valid} className="flex items-center">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.machineDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 border p-1 rounded-2xl border-slate-200">
                  <Input
                    value={detail.id}
                    onChange={(e) => handleMachineDetailChange(index, 'id', e.target.value)}
                    placeholder={`Machine ID #${index + 1}`}
                    icon={Settings}
                  />
                  <Input
                    value={detail.loca}
                    onChange={(e) => handleMachineDetailChange(index, 'loca', e.target.value)}
                    placeholder="Location (e.g., Floor 2)"
                    icon={MapPin}
                  />
                  <Input
                    type="number"
                    value={detail.capacity}
                    onChange={(e) => handleMachineDetailChange(index, 'capacity', e.target.value)}
                    placeholder="Capacity"
                    icon={ChevronRight}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(1)} className="flex items-center">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button onClick={handleSubmit} disabled={!isStep2Valid || isSubmitting} className="flex items-center">
                {isSubmitting ? 'Creating...' : 'Create Devices'}
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceAssignmentForm;

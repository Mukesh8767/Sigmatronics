// CreateSolutionModal.tsx
import { useState, useEffect } from 'react';
import {
  Plus, Trash2, FileText, Code, Tag, Hash, Palette,
  BarChart3, TrendingUp, TrendingDown, Send, X, Puzzle
} from 'lucide-react';
import Input from '../input';
import { Button } from '../button';

const paramTypes = [
  'line', 'bar', 'gauge', 'badge', 'geo', 'pie', 'number', 'heatmap', 'progress', 'status-led', 'table'
];

type Parameter = {
  key: string;
  label: string;
  unit: string;
  type: string;
  color: string;
  group: string;
  threshold: { min?: number; max?: number };
};

interface CreateSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  initialData?: {
    _id?: string;
    name: string;
    code: string;
    description: string;
    parameters: Parameter[];
  };
}

export default function CreateSolutionForm({ isOpen, onClose, onSubmit, initialData }: CreateSolutionModalProps) {
  const isEditMode = !!initialData;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<Parameter[]>([
    { key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {} }
  ]);

  useEffect(() => {
  if (initialData) {
    setName(initialData.name || '');
    setCode(initialData.code || '');
    setDescription(initialData.description || '');

    const validatedParams = Array.isArray(initialData.parameters)
      ? initialData.parameters.map((p) => ({
          key: p.key || '',
          label: p.label || '',
          unit: p.unit || '',
          type: p.type || 'line',
          color: p.color || '',
          group: p.group || '',
          threshold: p.threshold || {},
        }))
      : [{ key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {} }];

    setParameters(validatedParams);
  }
}, [initialData]);


  const handleParamChange = <K extends keyof Parameter>(
    index: number,
    field: K,
    value: Parameter[K]
  ) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const addParameter = () => {
    setParameters([...parameters, { key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {} }]);
  };

  const removeParameter = (index: number) => {
    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const solutionData = {
      ...(initialData?._id && { _id: initialData._id }),
      name,
      code,
      description,
      parameters
    };
    if (onSubmit) await onSubmit(solutionData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setParameters([{ key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {} }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4 py-8">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Puzzle className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              {isEditMode ? 'Edit Solution' : 'Create New Solution'}
            </h2>
          </div>
          <button onClick={handleClose} className="hover:bg-gray-800 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-8 py-6 space-y-10">
          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Solution Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter solution name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Code className="w-4 h-4" /> Solution Code
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SIFM"
                  icon={Code}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your solution..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Parameters
              </h3>
              <Button type="button" variant="primary" size="sm" onClick={addParameter} className='flex items-center'>
                <Plus className="w-4 h-4 mr-1" /> Add Parameter
              </Button>
            </div>

            <div className="space-y-4">
              {parameters.map((param, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-6 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Parameter {i + 1}</span>
                    {parameters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParameter(i)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input value={param.key} onChange={(e) => handleParamChange(i, 'key', e.target.value)} placeholder="Key" icon={Hash} />
                    <Input value={param.label} onChange={(e) => handleParamChange(i, 'label', e.target.value)} placeholder="Label" icon={Tag} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input value={param.unit} onChange={(e) => handleParamChange(i, 'unit', e.target.value)} placeholder="Unit (e.g. °C)" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex gap-1 items-center">
                        <Palette className="w-4 h-4" /> Color
                      </label>
                      <input
                        type="color"
                        value={param.color || '#000000'}
                        onChange={(e) => handleParamChange(i, 'color', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={param.type}
                        onChange={(e) => handleParamChange(i, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black bg-white"
                      >
                        {paramTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <Input value={param.group} onChange={(e) => handleParamChange(i, 'group', e.target.value)} placeholder="Group" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min Threshold"
                      value={param.threshold.min?.toString() || ''}
                      onChange={(e) =>
                        handleParamChange(i, 'threshold', { ...param.threshold, min: Number(e.target.value) })
                      }
                      icon={TrendingDown}
                    />
                    <Input
                      type="number"
                      placeholder="Max Threshold"
                      value={param.threshold.max?.toString() || ''}
                      onChange={(e) =>
                        handleParamChange(i, 'threshold', { ...param.threshold, max: Number(e.target.value) })
                      }
                      icon={TrendingUp}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              <Send className="w-4 h-4 mr-2" />
              {isEditMode ? 'Update Solution' : 'Create Solution'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

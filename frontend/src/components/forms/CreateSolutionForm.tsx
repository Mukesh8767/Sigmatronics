import { useState, useEffect } from 'react';
import {
  Plus, Trash2, FileText, Code, Tag, Hash, Palette,
  BarChart3, TrendingUp, TrendingDown, Send, X, Puzzle, Bell, BellOff
} from 'lucide-react';
import Input from '../input';
import { Button } from '../button';

const paramTypes = [
  'line', 'bar', 'gauge', 'badge', 'geo', 'pie', 'number', 'heatmap', 'progress', 'status-led', 'table'
];

const availableUnits = [
  '°C', '°F', 'K', 'm', 'cm', 'mm', 'km', 'in', 'ft', 'mi', 'nm', 'µm',
  'kg', 'g', 'mg', 'µg', 'lb', 'oz', 'ton', '%', 's', 'ms', 'µs', 'ns',
  'min', 'h', 'd', 'A', 'V', 'W', 'Hz', 'Ohm', 'F', 'C', 'S', 'H',
  'm/s', 'km/h', 'mph', 'Pa', 'kPa', 'MPa', 'bar', 'atm', 'psi', 'mmHg',
  'L', 'mL', 'm³', 'cm³', 'ft³', 'in³', 'J', 'kJ', 'Wh', 'kWh', 'cal', 'kcal', 'BTU',
  'Hz', 'kHz', 'MHz', 'GHz', 'rpm', 'ppm', 'ppb', 'mol/L', 'dB',
  'b', 'B', 'KB', 'MB', 'GB', 'TB', 'bps', 'kbps', 'Mbps', 'Gbps',
  '$', '€', '£', '¥', '₹', '₿'
];

type Parameter = {
  key: string;
  label: string;
  unit: string;
  type: string;
  color: string;
  group: string;
  threshold: { min?: number; max?: number };
  alert?: boolean;
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
    alertHours?: number;
    parameters: Parameter[];
  };
}

const convertToMinutes = (value: number, unit: string): number => {
  switch (unit) {
    case 'min': return value;
    case 'h': return value * 60;
    case 'd': return value * 60 * 24;
    case 'w': return value * 60 * 24 * 7;
    case 'mo': return value * 60 * 24 * 30;
    default: return 0;
  }
};

export default function CreateSolutionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateSolutionModalProps) {
  const isEditMode = !!initialData;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [alertValue, setAlertValue] = useState(30);
  const [alertUnit, setAlertUnit] = useState('min');
  const [parameters, setParameters] = useState<Parameter[]>([
    { key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {}, alert: false },
  ]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setDescription(initialData.description || '');

      const totalMinutes = initialData.alertHours || 120;
      if (totalMinutes % (60 * 24 * 30) === 0) {
        setAlertValue(totalMinutes / (60 * 24 * 30));
        setAlertUnit('mo');
      } else if (totalMinutes % (60 * 24 * 7) === 0) {
        setAlertValue(totalMinutes / (60 * 24 * 7));
        setAlertUnit('w');
      } else if (totalMinutes % (60 * 24) === 0) {
        setAlertValue(totalMinutes / (60 * 24));
        setAlertUnit('d');
      } else if (totalMinutes % 60 === 0) {
        setAlertValue(totalMinutes / 60);
        setAlertUnit('h');
      } else {
        setAlertValue(totalMinutes);
        setAlertUnit('min');
      }

      const validatedParams = Array.isArray(initialData.parameters)
        ? initialData.parameters.map((p) => ({
            key: p.key || '',
            label: p.label || '',
            unit: p.unit || '',
            type: p.type || 'line',
            color: p.color || '',
            group: p.group || '',
            threshold: p.threshold || {},
            alert: p.alert || false,
          }))
        : [{
            key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {}, alert: false,
          }];

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
    setParameters([
      ...parameters,
      { key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {}, alert: false },
    ]);
  };

  const removeParameter = (index: number) => {
    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  const isUnitKnown = (unit: string) =>
    unit.trim() === '' || availableUnits.includes(unit.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const alertMinutes = convertToMinutes(alertValue, alertUnit);
    if (!alertMinutes) {
      alert('Please provide a valid alert interval.');
      return;
    }

    for (let p of parameters) {
      if (p.alert && (!p.threshold.min && !p.threshold.max)) {
        alert(`Parameter "${p.key}" requires at least one threshold value when alert is enabled.`);
        return;
      }
    }

    const solutionData = {
      ...(initialData?._id && { _id: initialData._id }),
      name,
      code,
      description,
      alertHours: alertMinutes,
      parameters,
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
    setAlertValue(30);
    setAlertUnit('min');
    setParameters([
      { key: '', label: '', unit: '', type: 'line', color: '', group: '', threshold: {}, alert: false },
    ]);
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
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Solution Name" />
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Solution Code" icon={Code} />
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your solution..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none resize-none"
            />

            {/* Alert Interval */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Alert Interval</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={alertValue}
                  onChange={(e) => setAlertValue(Number(e.target.value))}
                  min={1}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                />
                <select
                  value={alertUnit}
                  onChange={(e) => setAlertUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="min">Minutes</option>
                  <option value="h">Hours</option>
                  <option value="d">Days</option>
                  <option value="w">Weeks</option>
                  <option value="mo">Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Parameters
            </h3>

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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Unit</label>
                      <input
                        list={`unit-options-${i}`}
                        value={param.unit}
                        onChange={(e) => handleParamChange(i, 'unit', e.target.value)}
                        placeholder="Unit (e.g. °C)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                      />
                      <datalist id={`unit-options-${i}`}>
                        {availableUnits.map((u) => <option key={u} value={u} />)}
                      </datalist>
                      {!isUnitKnown(param.unit) && (
                        <p className="text-xs text-yellow-700">Unknown unit. Still allowed.</p>
                      )}
                    </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      >
                        {paramTypes.map((type) => (
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
                      onChange={(e) => handleParamChange(i, 'threshold', {
                        ...param.threshold,
                        min: Number(e.target.value),
                      })}
                      icon={TrendingDown}
                    />
                    <Input
                      type="number"
                      placeholder="Max Threshold"
                      value={param.threshold.max?.toString() || ''}
                      onChange={(e) => handleParamChange(i, 'threshold', {
                        ...param.threshold,
                        max: Number(e.target.value),
                      })}
                      icon={TrendingUp}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleParamChange(i, 'alert', !param.alert)}
                      className={`flex items-center cursor-pointer duration-300 gap-1 text-sm px-3 py-1 rounded-lg transition-colors
                        ${param.alert ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}
                      `}
                    >
                      {param.alert ? <Bell className="w-4 h-4 duration-300" /> : <BellOff className="w-4 h-4 duration-300" />}
                      {param.alert ? 'Alerts On' : 'Alerts Off'}
                    </button>

                    {param.alert && (!param.threshold.min && !param.threshold.max) && (
                      <p className="text-sm text-red-600 ml-2">Enter min or max threshold</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button type="button" variant="primary" size="sm" onClick={addParameter} className="flex">
                  <Plus className="w-4 h-4 mr-1" /> Add Parameter
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-3 border-t border-gray-200">
            <Button type="button" variant="outline" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" size="sm" className="flex items-center">
              <Send className="w-4 h-4 mr-2" />
              {isEditMode ? 'Update Solution' : 'Create Solution'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

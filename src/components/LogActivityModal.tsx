import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Cpu, 
  Calculator, 
  Clock, 
  Check, 
  X, 
  ChevronRight 
} from 'lucide-react';
import { WaterCategory, MeasurementSource, WaterLogEntry, SmartSensor } from '../types/water';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: Omit<WaterLogEntry, 'id'>, editingId?: string) => void;
  sensors: SmartSensor[];
  initialCategory?: string;
  editingEntry?: WaterLogEntry | null;
  dailyBudgetRemaining: number;
}

interface ActivityPreset {
  category: WaterCategory;
  name: string;
  defaultMinutes?: number;
  defaultFlowRate?: number;
  fixedLitres?: number;
  defaultSource: MeasurementSource;
  preferredSensorId?: string;
  notes?: string;
}

const PRESETS: ActivityPreset[] = [
  {
    category: 'shower',
    name: 'Eco Shower (with aerator head)',
    defaultMinutes: 6,
    defaultFlowRate: 6.8,
    defaultSource: 'sensor',
    preferredSensorId: 'sensor-bath-03',
    notes: 'Standard eco showerhead ~6.8 L/min',
  },
  {
    category: 'kitchen',
    name: 'Dishwashing in Sink',
    defaultMinutes: 3,
    defaultFlowRate: 4.5,
    defaultSource: 'sensor',
    preferredSensorId: 'sensor-kitchen-02',
    notes: 'Kitchen sink aerator wash',
  },
  {
    category: 'kitchen',
    name: 'Dishwasher Machine Run',
    fixedLitres: 12.0,
    defaultSource: 'estimate',
    notes: 'EnergyStar full load eco cycle',
  },
  {
    category: 'laundry',
    name: 'Washing Machine Cycle',
    fixedLitres: 38.0,
    defaultSource: 'estimate',
    notes: 'Front-load cold water high-efficiency run',
  },
  {
    category: 'toilet',
    name: 'Dual Flush (Liquid Half Flush)',
    fixedLitres: 3.5,
    defaultSource: 'sensor',
    preferredSensorId: 'sensor-bath-03',
    notes: 'Dual flush low-flow mechanism',
  },
  {
    category: 'toilet',
    name: 'Standard Toilet Flush',
    fixedLitres: 6.0,
    defaultSource: 'estimate',
    notes: 'Standard full cistern volume',
  },
  {
    category: 'garden',
    name: 'Garden Drip Irrigation',
    defaultMinutes: 15,
    defaultFlowRate: 1.1,
    defaultSource: 'sensor',
    preferredSensorId: 'sensor-garden-04',
    notes: 'Targeted root zone micro-drip',
  },
  {
    category: 'drinking',
    name: 'Drinking Water & Food Prep',
    fixedLitres: 2.5,
    defaultSource: 'estimate',
    notes: 'Filtered drinking bottles & cooking water',
  },
];

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  sensors,
  initialCategory,
  editingEntry,
  dailyBudgetRemaining,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WaterCategory>('shower');
  const [fixtureName, setFixtureName] = useState('Eco Showerhead');
  const [source, setSource] = useState<MeasurementSource>('sensor');
  const [calcMode, setCalcMode] = useState<'duration' | 'direct'>('duration');
  const [durationMinutes, setDurationMinutes] = useState<number>(6);
  const [flowRateLpm, setFlowRateLpm] = useState<number>(6.8);
  const [directLitres, setDirectLitres] = useState<number>(40.8);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('sensor-bath-03');
  const [notes, setNotes] = useState<string>('');

  // Sync state when editing or changing initial category
  useEffect(() => {
    if (editingEntry) {
      setSelectedCategory(editingEntry.category);
      setFixtureName(editingEntry.fixtureName);
      setSource(editingEntry.source);
      if (editingEntry.durationMinutes && editingEntry.flowRateLpm) {
        setCalcMode('duration');
        setDurationMinutes(editingEntry.durationMinutes);
        setFlowRateLpm(editingEntry.flowRateLpm);
        setDirectLitres(Number((editingEntry.durationMinutes * editingEntry.flowRateLpm).toFixed(1)));
      } else {
        setCalcMode('direct');
        setDirectLitres(editingEntry.litres);
      }
      setSelectedSensorId(editingEntry.sensorId || 'sensor-main-01');
      setNotes(editingEntry.notes || '');
    } else if (initialCategory) {
      const preset = PRESETS.find(p => p.category === initialCategory) || PRESETS[0];
      applyPreset(preset);
    } else {
      applyPreset(PRESETS[0]);
    }
  }, [editingEntry, initialCategory, isOpen]);

  const applyPreset = (preset: ActivityPreset) => {
    setSelectedCategory(preset.category);
    setFixtureName(preset.name);
    setSource(preset.defaultSource);
    setNotes(preset.notes || '');

    if (preset.fixedLitres) {
      setCalcMode('direct');
      setDirectLitres(preset.fixedLitres);
    } else if (preset.defaultMinutes && preset.defaultFlowRate) {
      setCalcMode('duration');
      setDurationMinutes(preset.defaultMinutes);
      setFlowRateLpm(preset.defaultFlowRate);
      setDirectLitres(Number((preset.defaultMinutes * preset.defaultFlowRate).toFixed(1)));
    }

    if (preset.preferredSensorId) {
      setSelectedSensorId(preset.preferredSensorId);
    }
  };

  // Recalculate directLitres when duration or flowRate changes
  useEffect(() => {
    if (calcMode === 'duration') {
      const calc = Number((durationMinutes * flowRateLpm).toFixed(1));
      setDirectLitres(calc);
    }
  }, [durationMinutes, flowRateLpm, calcMode]);

  if (!isOpen) return null;

  const calculatedTotal = calcMode === 'duration' 
    ? Number((durationMinutes * flowRateLpm).toFixed(1)) 
    : Number(directLitres);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotal <= 0) return;

    onSaveLog(
      {
        timestamp: editingEntry ? editingEntry.timestamp : new Date().toISOString(),
        category: selectedCategory,
        litres: calculatedTotal,
        source,
        fixtureName,
        durationMinutes: calcMode === 'duration' ? durationMinutes : undefined,
        flowRateLpm: calcMode === 'duration' ? flowRateLpm : undefined,
        sensorId: source === 'sensor' ? selectedSensorId : undefined,
        notes: notes.trim() || undefined,
      },
      editingEntry?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Droplet className="w-4 h-4 fill-sky-600 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingEntry ? 'Edit Water Log' : 'Log Water Consumption Event'}
              </h3>
              <p className="text-xs text-slate-500">
                Record exact litres with physical sensor telemetry or calculated flow rates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Carousel if creating new */}
        {!editingEntry && (
          <div className="mt-4 pb-3 border-b border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Fast Presets
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left whitespace-nowrap shrink-0 transition-all ${
                    fixtureName === preset.name
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-medium shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Source Provenance Switch */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Measurement Source Provenance
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource('sensor')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  source === 'sensor'
                    ? 'border-sky-500 bg-sky-50/50 text-sky-950 ring-1 ring-sky-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Cpu className={`w-4 h-4 mt-0.5 ${source === 'sensor' ? 'text-sky-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold">Actual Smart Sensor</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Synced with FlowNet IoT physical meter
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSource('estimate')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  source === 'estimate'
                    ? 'border-slate-700 bg-slate-50 text-slate-950 ring-1 ring-slate-700'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Calculator className={`w-4 h-4 mt-0.5 ${source === 'estimate' ? 'text-slate-800' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold">User Estimated</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Derived from activity duration x rate
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Connected sensor picker if source is sensor */}
          {source === 'sensor' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Linked IoT Smart Meter
              </label>
              <select
                value={selectedSensorId}
                onChange={(e) => setSelectedSensorId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                {sensors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location} - {s.pipeDiameterMm}mm)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Activity Category & Fixture Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as WaterCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                <option value="shower">Shower & Bath</option>
                <option value="kitchen">Kitchen & Dishes</option>
                <option value="toilet">Toilet Flush</option>
                <option value="laundry">Laundry Machine</option>
                <option value="garden">Garden & Plants</option>
                <option value="drinking">Drinking & Prep</option>
                <option value="cleaning">Cleaning & Wash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fixture / Activity Name
              </label>
              <input
                type="text"
                value={fixtureName}
                onChange={(e) => setFixtureName(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>
          </div>

          {/* Calculation Mode Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Volume Calculation Method
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCalcMode('duration')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    calcMode === 'duration' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-500'
                  }`}
                >
                  Duration × Flow Rate
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setCalcMode('direct')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    calcMode === 'direct' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-500'
                  }`}
                >
                  Direct Litre Input
                </button>
              </div>
            </div>

            {calcMode === 'duration' ? (
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-600 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Flow Rate (Litres / min)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={flowRateLpm}
                    onChange={(e) => setFlowRateLpm(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono-numbers"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="2000"
                  value={directLitres}
                  onChange={(e) => setDirectLitres(Number(e.target.value))}
                  required
                  placeholder="Enter exact volume in Litres"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono-numbers text-sm"
                />
              </div>
            )}
          </div>

          {/* Notes field */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Optional Notes / Conservation Practice
            </label>
            <input
              type="text"
              placeholder="e.g. Turned tap off while brushing teeth; used basin method"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          {/* Live Calculated Volume Preview Box */}
          <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Total Volume Recorded:</span>
              <span className="text-2xl font-bold text-sky-900 font-mono-numbers">
                {calculatedTotal} <span className="text-xs font-normal text-slate-500">Litres</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Daily Budget Impact:</span>
              <span className={`font-semibold font-mono-numbers ${
                calculatedTotal > dailyBudgetRemaining ? 'text-amber-600' : 'text-slate-700'
              }`}>
                {calculatedTotal > dailyBudgetRemaining 
                  ? 'Exceeds remaining allowance' 
                  : `${(dailyBudgetRemaining - calculatedTotal).toFixed(1)} L budget left`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm"
            >
              {editingEntry ? 'Update Entry' : 'Save Water Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

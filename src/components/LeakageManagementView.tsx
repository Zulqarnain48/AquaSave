import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Plus, 
  Clock, 
  DollarSign, 
  Activity, 
  Search, 
  FileText, 
  Trash2, 
  Sparkles,
  Droplet
} from 'lucide-react';
import { LeakReport, LeakStatus, LeakUrgency, HouseholdProfile } from '../types/water';
import { triggerCelebration } from '../utils/waterCalculations';

interface LeakageManagementViewProps {
  leaks: LeakReport[];
  profile: HouseholdProfile;
  onAddLeak: (leak: Omit<LeakReport, 'id' | 'reportedAt'>) => void;
  onUpdateLeakStatus: (id: string, status: LeakStatus, technicianNotes?: string) => void;
  onDeleteLeak: (id: string) => void;
}

export const LeakageManagementView: React.FC<LeakageManagementViewProps> = ({
  leaks,
  profile,
  onAddLeak,
  onUpdateLeakStatus,
  onDeleteLeak,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  // Form state
  const [fixtureType, setFixtureType] = useState('Toilet Flapper Valve');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<LeakUrgency>('moderate');
  const [estimatedLoss, setEstimatedLoss] = useState<number>(30);
  const [description, setDescription] = useState('');

  // Interactive leak loss simulator state
  const [dropsPerMinute, setDropsPerMinute] = useState<number>(45);

  const activeLeaks = leaks.filter(l => l.status !== 'repaired');
  const repairedLeaks = leaks.filter(l => l.status === 'repaired');
  const totalDailyLeakLoss = activeLeaks.reduce((acc, l) => acc + l.estimatedLossLitersPerDay, 0);
  const annualLossLitres = totalDailyLeakLoss * 365;
  const annualCostLoss = (annualLossLitres / 1000) * profile.costPer1000L;

  // Simulator calculations
  // 1 drop ~ 0.05 ml; 45 drops/min = 2.25 ml/min = 135 ml/hr = 3.24 L/day
  // For standard domestic plumbing drip rules of thumb:
  // 30 drops/min ~ 5 L/day; steady trickle ~ 40 L/day; fast toilet flapper leak ~ 150 L/day
  const simLitresPerDay = Number(((dropsPerMinute * 0.05 * 60 * 24) / 1000).toFixed(1));
  const simLitresPerYear = Math.round(simLitresPerDay * 365);
  const simCostPerYear = ((simLitresPerYear / 1000) * profile.costPer1000L).toFixed(2);
  const simBathtubsPerYear = Math.round(simLitresPerYear / 150); // 150L standard bath

  const handleCreateLeak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    onAddLeak({
      fixtureType,
      location,
      urgency,
      estimatedLossLitersPerDay: estimatedLoss,
      status: 'investigating',
      description: description || 'Visual or acoustic leak reported by occupant.',
    });

    setShowReportModal(false);
    setLocation('');
    setDescription('');
    setEstimatedLoss(30);
  };

  const handleMarkRepaired = (id: string) => {
    const notes = prompt('Add optional technician repair notes (e.g. Replaced worn flapper gasket):', 'Flapper seal replaced; continuous zero flow verified.');
    if (notes !== null) {
      onUpdateLeakStatus(id, 'repaired', notes);
      triggerCelebration();
    }
  };

  const handleRunDiagnostic = () => {
    setDiagnosticRunning(true);
    setDiagnosticResult(null);

    setTimeout(() => {
      setDiagnosticRunning(false);
      setDiagnosticResult('Acoustic pulse scan complete: Baseline nighttime flow detected at 0.03 L/min on Bathroom line. Flagged active micro-trickle in Guest Powder Room.');
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Leakage Reporting & Water Loss Prevention
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify silent toilet flappers, dripping faucets, and pipe breaches before they waste thousands of litres.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDiagnostic}
            disabled={diagnosticRunning}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 text-sky-600 ${diagnosticRunning ? 'animate-spin' : ''}`} />
            <span>{diagnosticRunning ? 'Scanning Sensors...' : 'Sensor Leak Scan'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Report a Leak</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Scan Output if run */}
      {diagnosticResult && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Automated Diagnostic Assessment:</span>
              <p className="mt-0.5 text-sky-800 leading-relaxed">{diagnosticResult}</p>
            </div>
          </div>
          <button
            onClick={() => setDiagnosticResult(null)}
            className="text-sky-600 hover:text-sky-800 font-semibold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Active Leaks Pending Repair
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono-numbers ${
              activeLeaks.length > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {activeLeaks.length}
            </span>
            <span className="text-xs text-slate-500">
              {activeLeaks.length === 1 ? 'fixture' : 'fixtures'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {repairedLeaks.length} leaks successfully fixed to date
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Current Daily Leak Loss
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono-numbers ${
              totalDailyLeakLoss > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {totalDailyLeakLoss}
            </span>
            <span className="text-xs text-slate-500">Litres / day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ~{Math.round(annualLossLitres).toLocaleString()} Litres lost if left unfixed all year
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Projected Financial Cost
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono-numbers">
              {profile.currencySymbol}{annualCostLoss.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">/ year wasted</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Repairing leaks immediately saves up to 15% on water bills
          </div>
        </div>
      </div>

      {/* Interactive Drip Rate Calculator Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Drip Rate & Water Loss Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag the slider to visualize how even a slow, unassuming drip compounds into immense water waste over time.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Drip Cadence</span>
            <span className="text-lg font-bold text-sky-700 font-mono-numbers">
              {dropsPerMinute} drops / min
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-6">
          <div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={dropsPerMinute}
              onChange={(e) => setDropsPerMinute(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Slow Drip (5/min)</span>
              <span>Steady Tap Drip (60/min)</span>
              <span>Constant Trickle (150/min)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 block">Daily Waste</span>
              <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                {simLitresPerDay} <span className="text-xs font-normal text-slate-500">Litres</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Annual Waste</span>
              <span className="text-xl font-bold text-rose-600 font-mono-numbers">
                {simLitresPerYear.toLocaleString()} <span className="text-xs font-normal text-slate-500">Litres</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Equivalent Bathtubs</span>
              <span className="text-xl font-bold text-sky-700 font-mono-numbers">
                ~{simBathtubsPerYear} <span className="text-xs font-normal text-slate-500">tubs</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Annual Bill Impact</span>
              <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                {profile.currencySymbol}{simCostPerYear}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reported Leaks Registry */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Household Leak Incident Log & Status
          </h3>
          <span className="text-xs text-slate-500">
            {leaks.length} total records
          </span>
        </div>

        {leaks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-medium text-slate-700">No leaks reported in your home!</p>
            <p className="text-slate-400 mt-0.5">All plumbing fixtures are operating nominally.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaks.map((leak) => {
              const isRepaired = leak.status === 'repaired';
              const urgencyColors: Record<LeakUrgency, string> = {
                minor: 'text-slate-700 bg-slate-100',
                moderate: 'text-amber-700 bg-amber-50 border border-amber-200',
                severe: 'text-orange-700 bg-orange-50 border border-orange-200',
                critical: 'text-rose-700 bg-rose-50 border border-rose-200',
              };

              return (
                <div key={leak.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {leak.fixtureType}
                      </span>
                      <span className="text-xs text-slate-500">· {leak.location}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${urgencyColors[leak.urgency]}`}>
                        {leak.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {leak.description}
                    </p>

                    {leak.technicianNotes && (
                      <div className="text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded px-2 py-1 mt-1 inline-block">
                        <strong>Resolution:</strong> {leak.technicianNotes}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-0.5">
                      <span>Reported: {new Date(leak.reportedAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="font-semibold text-rose-600 font-mono-numbers">
                        Loss: {leak.estimatedLossLitersPerDay} L/day
                      </span>
                      {leak.repairedAt && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600">Fixed: {new Date(leak.repairedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {!isRepaired ? (
                      <button
                        onClick={() => handleMarkRepaired(leak.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Repaired</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Repaired & Verified</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this leak record?')) {
                          onDeleteLeak(leak.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Leak Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Report a Plumbing Leak
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeak} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fixture or Component
                </label>
                <select
                  value={fixtureType}
                  onChange={(e) => setFixtureType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                >
                  <option value="Toilet Flapper Valve">Toilet Flapper Valve (Cistern trickling)</option>
                  <option value="Bathroom Sink Faucet">Bathroom Sink Faucet (Dripping spout)</option>
                  <option value="Kitchen Sink Tap">Kitchen Sink Tap / Spray Head</option>
                  <option value="Showerhead / Diverter">Showerhead / Diverter Valve</option>
                  <option value="Outdoor Hose Bib">Outdoor Hose Bib / Spigot</option>
                  <option value="Under-Sink P-Trap">Under-Sink P-Trap / Pipe Joint</option>
                  <option value="Water Heater Relief Valve">Water Heater Pressure Relief Valve</option>
                  <option value="Irrigation Dripper/Sprinkler">Irrigation Dripper / Sprinkler Head</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location in Home
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bath, 2nd Floor or Kitchen Island"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as LeakUrgency)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                  >
                    <option value="minor">Minor (Slow occasional drop)</option>
                    <option value="moderate">Moderate (Steady drip)</option>
                    <option value="severe">Severe (Continuous stream)</option>
                    <option value="critical">Critical (Pipe rupture / burst)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Est. Loss (Litres / Day)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={estimatedLoss}
                    onChange={(e) => setEstimatedLoss(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observations / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe visual leaks, puddles, or acoustic sounds noticed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Submit Leak Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

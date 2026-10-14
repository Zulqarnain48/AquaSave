import React, { useState } from 'react';
import { 
  Droplet, 
  Cpu, 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Bell, 
  Play, 
  Square,
  Users
} from 'lucide-react';
import { SmartSensor, WaterLogEntry, LeakReport, SmartReminder, HouseholdProfile } from '../types/water';
import { calculateTodayMetrics, categoryLabels } from '../utils/waterCalculations';

interface DashboardViewProps {
  logs: WaterLogEntry[];
  sensors: SmartSensor[];
  leaks: LeakReport[];
  reminders: SmartReminder[];
  profile: HouseholdProfile;
  onOpenLogModal: (presetCategory?: string) => void;
  onNavigateTab: (tab: 'tracker' | 'leaks' | 'analytics' | 'goals_tips') => void;
  onToggleReminder: (reminderId: string) => void;
  onSimulateSensorFlow: (sensorId: string, flowLpm: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  logs,
  sensors,
  leaks,
  reminders,
  profile,
  onOpenLogModal,
  onNavigateTab,
  onToggleReminder,
  onSimulateSensorFlow,
}) => {
  const [activeSimulationSensorId, setActiveSimulationSensorId] = useState<string | null>(null);
  const metrics = calculateTodayMetrics(logs, profile);
  const activeLeaks = leaks.filter(l => l.status !== 'repaired');
  const totalDailyLeakLoss = activeLeaks.reduce((sum, l) => sum + l.estimatedLossLitersPerDay, 0);

  const handleToggleSimulation = (sensorId: string) => {
    if (activeSimulationSensorId === sensorId) {
      setActiveSimulationSensorId(null);
      onSimulateSensorFlow(sensorId, 0.0);
    } else {
      setActiveSimulationSensorId(sensorId);
      onSimulateSensorFlow(sensorId, 8.4); // 8.4 L/min simulated active flow
    }
  };

  const sensorPct = metrics.totalLitres > 0 ? Math.round((metrics.sensorLitres / metrics.totalLitres) * 100) : 0;
  const estimatePct = 100 - sensorPct;

  return (
    <div className="space-y-8">
      {/* Leak Warning Banner if active leaks are detected */}
      {activeLeaks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-900">
                Active Leak Detected: {activeLeaks[0].fixtureType} ({activeLeaks[0].location})
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                Losing approx. <span className="font-semibold font-mono-numbers">{activeLeaks[0].estimatedLossLitersPerDay} Litres/day</span>. Continuous flow detected during quiet night hours.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('leaks')}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Resolve Leak</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Grid: Focal Anchor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Consumption Gauge Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Today's Domestic Water Consumption
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono-numbers">
                    {metrics.totalLitres}
                  </span>
                  <span className="text-lg font-semibold text-slate-500">
                    / {profile.dailyBudgetLitres} Litres
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500">Household Budget</span>
                <div className={`text-xl font-bold font-mono-numbers ${metrics.budgetPercentage > 100 ? 'text-rose-600' : 'text-sky-600'}`}>
                  {metrics.budgetPercentage}%
                </div>
                <span className="text-xs text-slate-400">
                  {metrics.remainingLitres > 0 ? `${metrics.remainingLitres} L remaining` : 'Exceeded budget'}
                </span>
              </div>
            </div>

            {/* Progress Bar with safe zone */}
            <div className="mt-5 space-y-2">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    metrics.budgetPercentage > 100
                      ? 'bg-rose-500'
                      : metrics.budgetPercentage > 80
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.budgetPercentage)}%` }}
                />
              </div>

              {/* Source Breakdown Pill-Free Row */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
                  <span className="font-medium text-slate-700">Actual IoT Sensor:</span>
                  <span className="font-mono-numbers font-semibold text-slate-900">{metrics.sensorLitres} L</span>
                  <span className="text-slate-400">({sensorPct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-200 inline-block" />
                  <span className="font-medium text-slate-700">User Estimated:</span>
                  <span className="font-mono-numbers font-semibold text-slate-900">{metrics.estimateLitres} L</span>
                  <span className="text-slate-400">({estimatePct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500">Saved vs Baseline</div>
              <div className="text-lg font-bold text-emerald-600 font-mono-numbers flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span>{metrics.litresSavedVsBaseline} L</span>
              </div>
              <div className="text-[11px] text-slate-400">vs 230L standard</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Per Capita Usage</div>
              <div className="text-lg font-bold text-slate-800 font-mono-numbers mt-0.5 flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{metrics.litresPerPerson} L</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">SDG 6 target: &lt;50L</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Estimated Cost Saved</div>
              <div className="text-lg font-bold text-sky-700 font-mono-numbers mt-0.5">
                {profile.currencySymbol}{metrics.costSavingsToday}
              </div>
              <div className="text-[11px] text-slate-400">@ {profile.currencySymbol}{profile.costPer1000L}/kL</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Active Leak Loss</div>
              <div className={`text-lg font-bold font-mono-numbers mt-0.5 ${totalDailyLeakLoss > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {totalDailyLeakLoss} L/day
              </div>
              <div className="text-[11px] text-slate-400">
                {activeLeaks.length === 0 ? 'Zero leaks active' : `${activeLeaks.length} leak to repair`}
              </div>
            </div>
          </div>
        </div>

        {/* SDG 6 Global Impact Card with editorial imagery */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="relative h-36 bg-slate-100 overflow-hidden">
            <img
              src="/src/assets/images/sdg6_clean_water_hero_1792011315621.jpg"
              alt="SDG 6 Clean Water and Sanitation freshwater natural conservation"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold tracking-wide">
                UN SDG 6 · Clean Water & Sanitation
              </span>
            </div>
          </div>

          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Sustainable Water Stewardship
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                By maintaining daily household consumption under {profile.dailyBudgetLitres}L, you reduce freshwater stress on regional reservoirs and ensure equitable water access.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Your Monthly Water Saved: <span className="font-semibold text-sky-700 font-mono-numbers">~3,480 Litres</span>
              </div>
              <button
                onClick={() => onNavigateTab('goals_tips')}
                className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1"
              >
                <span>SDG Guide</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Log Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Quick Activity Water Logger
            </h3>
            <p className="text-xs text-slate-500">
              Log an activity with one tap or open the detailed flow duration calculator.
            </p>
          </div>
          <button
            onClick={() => onOpenLogModal()}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 transition-colors inline-flex items-center gap-1"
          >
            <span>Custom Flow Logger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { cat: 'shower', name: 'Shower (5 min)', l: 35.0, icon: 'Droplets' },
            { cat: 'kitchen', name: 'Dishwasher Eco', l: 12.0, icon: 'Utensils' },
            { cat: 'laundry', name: 'Washing Cycle', l: 38.0, icon: 'Shirt' },
            { cat: 'toilet', name: 'Dual Flush (Half)', l: 3.5, icon: 'Bath' },
            { cat: 'garden', name: 'Garden Drip 15m', l: 16.0, icon: 'Trees' },
            { cat: 'drinking', name: 'Cooking / Drinks', l: 3.0, icon: 'Coffee' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => onOpenLogModal(item.cat)}
              className="p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <div className="text-xs font-medium text-slate-800 group-hover:text-sky-900 truncate">
                {item.name}
              </div>
              <div className="text-sm font-bold text-sky-700 font-mono-numbers mt-1">
                +{item.l} L
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Quick estimate</div>
            </button>
          ))}
        </div>
      </div>

      {/* IoT Smart Sensors Live Status & Hardware Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Connected Smart Flow Sensors & IoT Telemetry
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-precision ultrasonic and turbine flow meters delivering verified Litre readings.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>4 Sensors Active</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Sampling rate: 1 Hz</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {sensors.map((sensor) => {
            const isSimulating = activeSimulationSensorId === sensor.id;
            const flowDisplay = isSimulating ? 8.4 : sensor.currentFlowLpm;

            return (
              <div
                key={sensor.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSimulating
                    ? 'border-sky-400 bg-sky-50/40 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block truncate">
                      {sensor.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {sensor.location}
                    </span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    flowDisplay > 0 ? 'bg-sky-100 text-sky-800 font-semibold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {sensor.pipeDiameterMm}mm
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Current Flow</span>
                    <span className={`text-2xl font-bold font-mono-numbers ${
                      flowDisplay > 0 ? 'text-sky-600' : 'text-slate-700'
                    }`}>
                      {flowDisplay.toFixed(1)} <span className="text-xs font-normal text-slate-500">L/min</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Today's Flow</span>
                    <span className="text-sm font-semibold text-slate-900 font-mono-numbers">
                      {sensor.todayLitres.toFixed(1)} L
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Battery {sensor.batteryPct}%</span>
                  <button
                    onClick={() => handleToggleSimulation(sensor.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      isSimulating
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                    title={isSimulating ? 'Stop simulated water flow' : 'Simulate water flow on this line'}
                  >
                    {isSimulating ? (
                      <>
                        <Square className="w-3 h-3 fill-rose-600" />
                        <span>Stop Flow</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-slate-600" />
                        <span>Simulate Flow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Active Smart Reminders & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Reminders Strip */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Smart Reminders & Automation
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {reminders.filter(r => r.isActive).length} active alerts
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors"
                >
                  <div className="pr-3">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <span>{reminder.title}</span>
                      <span className="text-[10px] text-emerald-700 font-mono-numbers">
                        +~{reminder.litersSavedPotential}L saved
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {reminder.description}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Trigger: {reminder.triggerTime}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors shrink-0 ${
                      reminder.isActive
                        ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {reminder.isActive ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated push alerts activate during peak usage</span>
            <button
              onClick={() => onNavigateTab('goals_tips')}
              className="text-sky-600 hover:text-sky-800 font-semibold"
            >
              Configure Reminders →
            </button>
          </div>
        </div>

        {/* Recent Water Activities Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Today's Recorded Events
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('tracker')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800"
              >
                View Full Ledger →
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {logs.slice(0, 5).map((log) => {
                const isSensor = log.source === 'sensor';
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSensor ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Droplet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {log.fixtureName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{timeStr}</span>
                          <span>·</span>
                          <span className={isSensor ? 'text-sky-700 font-medium' : 'text-slate-500'}>
                            {isSensor ? 'Smart Sensor' : 'Manual Estimate'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono-numbers">
                        {log.litres.toFixed(1)} L
                      </div>
                      {log.durationMinutes && (
                        <div className="text-[10px] text-slate-400">
                          {log.durationMinutes} min
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onOpenLogModal()}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            + Add New Water Log Entry
          </button>
        </div>
      </div>
    </div>
  );
};

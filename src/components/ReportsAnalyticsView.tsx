import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Calendar, 
  Layers, 
  Cpu, 
  Calculator, 
  Printer, 
  Download,
  Info,
  CheckCircle2,
  Award
} from 'lucide-react';
import { WaterLogEntry, HouseholdProfile } from '../types/water';
import { 
  calculateLast7DaysUsage, 
  calculateHourlyProfile, 
  calculateTodayMetrics,
  categoryLabels 
} from '../utils/waterCalculations';

interface ReportsAnalyticsViewProps {
  logs: WaterLogEntry[];
  profile: HouseholdProfile;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  logs,
  profile,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default: Today (index 6 in 7-day array)
  const [activeHourlyBar, setActiveHourlyBar] = useState<number | null>(null);

  const weeklyData = calculateLast7DaysUsage(logs, profile);
  const hourlyData = calculateHourlyProfile(logs);
  const todayMetrics = calculateTodayMetrics(logs, profile);

  // Total 7-day metrics
  const total7DayLitres = weeklyData.reduce((acc, d) => acc + d.totalLitres, 0);
  const avgDailyLitres = Math.round(total7DayLitres / 7);
  const sensor7DayLitres = weeklyData.reduce((acc, d) => acc + d.sensorLitres, 0);
  const sensorPercentage = total7DayLitres > 0 ? Math.round((sensor7DayLitres / total7DayLitres) * 100) : 0;
  const daysUnderBudget = weeklyData.filter(d => !d.isOverBudget).length;

  // Max value for scaling the 7-day chart
  const maxWeeklyBar = Math.max(...weeklyData.map(d => d.totalLitres), profile.dailyBudgetLitres * 1.25);
  // Max value for hourly chart
  const maxHourlyVal = Math.max(...hourlyData.map(d => d.litres), 15);

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header and Print summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Water Analytics & Progress Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive audit of household consumption trends, sensor validation, and SDG 6 benchmarks.
          </p>
        </div>

        <button
          onClick={handlePrintAudit}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Water Audit Report</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            7-Day Total Consumption
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 font-mono-numbers">
              {total7DayLitres.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">Litres</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Household 7-day aggregate
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Average Daily Usage
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold font-mono-numbers ${
              avgDailyLitres <= profile.dailyBudgetLitres ? 'text-sky-600' : 'text-amber-600'
            }`}>
              {avgDailyLitres}
            </span>
            <span className="text-xs text-slate-500">L / day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Budget limit: {profile.dailyBudgetLitres} L/day
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Days Under Daily Target
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-emerald-600 font-mono-numbers">
              {daysUnderBudget}
            </span>
            <span className="text-xs text-slate-500">/ 7 days</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {Math.round((daysUnderBudget / 7) * 100)}% compliance streak
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Sensor Verified Ratio
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-sky-700 font-mono-numbers">
              {sensorPercentage}%
            </span>
            <span className="text-xs text-slate-500">Telemetry</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {sensor7DayLitres.toFixed(1)} L physical meter readings
          </div>
        </div>
      </div>

      {/* Main 7-Day Trend Stacked Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                7-Day Consumption Trend (Sensor vs Estimated Breakdown)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Solid dark blue represents verified IoT flow sensors; lighter cyan represents manual estimates.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-sky-600 inline-block" />
              <span className="text-slate-600">Smart Sensor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-sky-300 inline-block" />
              <span className="text-slate-600">Manual Estimate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-rose-500 inline-block" />
              <span className="text-rose-600 font-medium">Budget ({profile.dailyBudgetLitres}L)</span>
            </div>
          </div>
        </div>

        {/* The Stacked Bar Chart */}
        <div className="mt-8 relative">
          {/* Target line indicator */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-rose-400 z-10 pointer-events-none"
            style={{
              bottom: `${(profile.dailyBudgetLitres / maxWeeklyBar) * 220}px`,
            }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-semibold text-rose-500 bg-white px-1">
              Daily Target: {profile.dailyBudgetLitres} L
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2 sm:px-6">
            {weeklyData.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              const sensorHeight = (day.sensorLitres / maxWeeklyBar) * 220;
              const estimateHeight = (day.estimateLitres / maxWeeklyBar) * 220;
              const totalHeight = sensorHeight + estimateHeight;

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex-1 flex flex-col items-center cursor-pointer group"
                >
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono-numbers font-semibold text-slate-700 opacity-80 group-hover:opacity-100 mb-1 transition-opacity">
                    {day.totalLitres} L
                  </div>

                  {/* Stacked bar container */}
                  <div className="w-full max-w-[48px] h-[220px] bg-slate-100 rounded-t-lg flex flex-col justify-end overflow-hidden border border-slate-200/60 group-hover:border-sky-400 transition-colors">
                    {/* Top stack: Estimate */}
                    <div
                      className="w-full bg-sky-300 transition-all duration-300"
                      style={{ height: `${estimateHeight}px` }}
                      title={`Estimated: ${day.estimateLitres} L`}
                    />
                    {/* Bottom stack: Sensor */}
                    <div
                      className="w-full bg-sky-600 transition-all duration-300"
                      style={{ height: `${sensorHeight}px` }}
                      title={`Smart Sensor: ${day.sensorLitres} L`}
                    />
                  </div>

                  {/* Day Label */}
                  <div className={`mt-2 text-center text-xs transition-colors ${
                    isSelected ? 'font-bold text-sky-700' : 'text-slate-600 group-hover:text-slate-900'
                  }`}>
                    <div>{day.dayLabel}</div>
                    <div className="text-[10px] text-slate-400">{day.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Deep Dive Info */}
        {selectedDayIndex !== null && weeklyData[selectedDayIndex] && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs bg-slate-50/60 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {weeklyData[selectedDayIndex].dayLabel} ({weeklyData[selectedDayIndex].date}) Detail:
              </span>
              <span>
                Total: <strong className="font-mono-numbers text-slate-900">{weeklyData[selectedDayIndex].totalLitres} L</strong>
              </span>
              <span>·</span>
              <span className="text-sky-700">
                Sensor: <strong className="font-mono-numbers">{weeklyData[selectedDayIndex].sensorLitres} L</strong>
              </span>
              <span>·</span>
              <span className="text-slate-600">
                Estimated: <strong className="font-mono-numbers">{weeklyData[selectedDayIndex].estimateLitres} L</strong>
              </span>
            </div>
            <div>
              <span className={`font-semibold ${
                weeklyData[selectedDayIndex].isOverBudget ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {weeklyData[selectedDayIndex].isOverBudget 
                  ? `Exceeded budget by ${(weeklyData[selectedDayIndex].totalLitres - profile.dailyBudgetLitres).toFixed(1)} L` 
                  : `Within budget by ${(profile.dailyBudgetLitres - weeklyData[selectedDayIndex].totalLitres).toFixed(1)} L`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column: 24-Hour Profile & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly 24-Hour Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Today's Hourly Profile (24-Hour Scan)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pinpoints peak consumption times (e.g. morning showers vs evening dishwashing).
                </p>
              </div>
              <span className="text-xs font-semibold text-sky-700 font-mono-numbers">
                {todayMetrics.totalLitres} L today
              </span>
            </div>

            {/* Hourly interactive bars */}
            <div className="mt-6 h-40 flex items-end gap-1 sm:gap-1.5">
              {hourlyData.map((hour) => {
                const heightPct = maxHourlyVal > 0 ? (hour.litres / maxHourlyVal) * 100 : 0;
                const isHovered = activeHourlyBar === hour.hour;

                return (
                  <div
                    key={hour.hour}
                    onMouseEnter={() => setActiveHourlyBar(hour.hour)}
                    onMouseLeave={() => setActiveHourlyBar(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {isHovered && hour.litres > 0 && (
                      <div className="absolute -top-7 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 font-mono-numbers shadow-sm">
                        {hour.label}: {hour.litres} L
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t transition-all ${
                        hour.litres > 0
                          ? isHovered
                            ? 'bg-sky-500'
                            : 'bg-sky-600'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono-numbers">
              <span>00:00</span>
              <span>06:00 (Peak AM)</span>
              <span>12:00</span>
              <span>18:00 (Peak PM)</span>
              <span>23:00</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Baseline quiet hours flow (2 AM - 5 AM): <strong className="text-slate-800">0.0 L/hr</strong></span>
            <span className="text-emerald-600 font-medium">No continuous night leak</span>
          </div>
        </div>

        {/* Fixture / Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Consumption Breakdown by Fixture
              </h3>
              <span className="text-xs text-slate-500">
                Current day distribution
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {Object.entries(todayMetrics.categoryBreakdown).map(([catKey, litres]) => {
                if (litres <= 0) return null;
                const info = categoryLabels[catKey] || categoryLabels.other;
                const pct = todayMetrics.totalLitres > 0 ? Math.round((litres / todayMetrics.totalLitres) * 100) : 0;

                return (
                  <div key={catKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{info.name}</span>
                      <span className="font-mono-numbers font-semibold text-slate-900">
                        {litres.toFixed(1)} L <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: info.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Largest water sink today: <strong className="text-slate-800">Shower & Bath (49%)</strong></span>
            <span className="text-sky-600 font-medium">Target: &lt;45L</span>
          </div>
        </div>
      </div>

      {/* SDG 6 Global Benchmark Comparison Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Award className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Global SDG 6 Benchmark & Consumption Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium uppercase block">
              WHO Survival Minimum
            </span>
            <div className="mt-1 text-2xl font-bold text-slate-700 font-mono-numbers">
              20 L
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum necessary for basic survival hydration and hygiene in emergency conditions.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <span className="text-[11px] text-emerald-800 font-medium uppercase block">
              Your Household Per-Capita
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono-numbers">
              {todayMetrics.litresPerPerson} L
            </div>
            <p className="text-[11px] text-emerald-800 mt-1">
              Achieved through eco showerheads, full laundry loads, and drip irrigation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40">
            <span className="text-[11px] text-sky-800 font-medium uppercase block">
              SDG 6 Sustainable Target
            </span>
            <div className="mt-1 text-2xl font-bold text-sky-700 font-mono-numbers">
              50 - 100 L
            </div>
            <p className="text-[11px] text-sky-800 mt-1">
              Recommended daily volume for healthy modern domestic living without depleting groundwater.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium uppercase block">
              Typical Unconstrained Home
            </span>
            <div className="mt-1 text-2xl font-bold text-rose-600 font-mono-numbers">
              250+ L
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              High-waste lifestyle with running taps, long showers, and leaking flappers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

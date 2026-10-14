import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Cpu, 
  Calculator, 
  ArrowUpDown, 
  Calendar 
} from 'lucide-react';
import { WaterLogEntry, WaterCategory, MeasurementSource } from '../types/water';
import { categoryLabels } from '../utils/waterCalculations';
import { exportLogsAsCSV } from '../utils/storage';

interface UsageTrackerViewProps {
  logs: WaterLogEntry[];
  onOpenLogModal: (presetCategory?: string, editingEntry?: WaterLogEntry) => void;
  onDeleteLog: (id: string) => void;
}

export const UsageTrackerView: React.FC<UsageTrackerViewProps> = ({
  logs,
  onOpenLogModal,
  onDeleteLog,
}) => {
  const [sourceFilter, setSourceFilter] = useState<'all' | MeasurementSource>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | WaterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered & sorted logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
        if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchFixture = log.fixtureName.toLowerCase().includes(q);
          const matchNotes = (log.notes || '').toLowerCase().includes(q);
          if (!matchFixture && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, sourceFilter, categoryFilter, searchQuery, sortOrder]);

  // Aggregate stats of filtered view
  const aggregateStats = useMemo(() => {
    let total = 0;
    let sensor = 0;
    let estimate = 0;
    filteredLogs.forEach((l) => {
      total += l.litres;
      if (l.source === 'sensor') sensor += l.litres;
      else estimate += l.litres;
    });
    return {
      total: Number(total.toFixed(1)),
      sensor: Number(sensor.toFixed(1)),
      estimate: Number(estimate.toFixed(1)),
      count: filteredLogs.length,
    };
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Water Usage Tracking & Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed log of all domestic water consumption in litres with verified sensor provenance.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => exportLogsAsCSV(filteredLogs)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenLogModal()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Distinction Explainer Banner */}
      <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sky-950">
              Measurement Source Provenance Notice
            </div>
            <div className="text-sky-800 text-[11px] mt-0.5 leading-relaxed">
              <strong>Smart Sensor:</strong> Physical telemetry recorded by FlowNet IoT meters with ultrasonic pulse accuracy.
              <br className="hidden sm:inline" />
              {' '}<strong>Manual Estimate:</strong> Calculated from activity duration and certified fixture flow rate coefficients.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-slate-600 font-mono-numbers">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Current View Total</span>
            <span className="text-base font-bold text-sky-900">{aggregateStats.total} Litres</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search fixture, activity, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Source Filter Segmented Control */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setSourceFilter('all')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                  sourceFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setSourceFilter('sensor')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 ${
                  sourceFilter === 'sensor'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Sensor</span>
              </button>
              <button
                onClick={() => setSourceFilter('estimate')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 ${
                  sourceFilter === 'estimate'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-3 h-3" />
                <span>Estimate</span>
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="shower">Shower & Bath</option>
              <option value="kitchen">Kitchen & Dishes</option>
              <option value="toilet">Toilet Flush</option>
              <option value="laundry">Laundry Machine</option>
              <option value="garden">Garden & Plants</option>
              <option value="drinking">Drinking & Cooking</option>
              <option value="cleaning">Cleaning & Wash</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* View Statistics Sub-Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredLogs.length}</span> recorded water events
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>
              Sensor: <span className="font-semibold text-sky-700 font-mono-numbers">{aggregateStats.sensor} L</span>
            </span>
            <span>·</span>
            <span>
              Estimated: <span className="font-semibold text-slate-700 font-mono-numbers">{aggregateStats.estimate} L</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fixture / Activity</th>
                <th className="py-3 px-4">Provenance</th>
                <th className="py-3 px-4">Duration & Flow</th>
                <th className="py-3 px-4 text-right">Volume (Litres)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Droplet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No water logs matching your filter.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing your filters or log a new activity.</p>
                    <button
                      onClick={() => onOpenLogModal()}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Water Activity</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  const isSensor = log.source === 'sensor';
                  const catInfo = categoryLabels[log.category] || categoryLabels.other;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-numbers">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {catInfo.name}
                        </span>
                      </td>

                      {/* Fixture & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {log.fixtureName}
                        </div>
                        {log.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                            {log.notes}
                          </div>
                        )}
                      </td>

                      {/* Measurement Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSensor ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <Cpu className="w-3 h-3 text-sky-600" />
                            <span>Smart Sensor</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <Calculator className="w-3 h-3 text-slate-500" />
                            <span>Estimated</span>
                          </div>
                        )}
                      </td>

                      {/* Duration & Flow Rate */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono-numbers text-slate-600">
                        {log.durationMinutes ? (
                          <div>
                            <span>{log.durationMinutes} min</span>
                            {log.flowRateLpm && (
                              <span className="text-[11px] text-slate-400 ml-1">
                                (@ {log.flowRateLpm} L/m)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Volume in Litres */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900 font-mono-numbers">
                          {log.litres.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">L</span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onOpenLogModal(undefined, log)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded transition-colors"
                            title="Edit entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this water consumption log?')) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

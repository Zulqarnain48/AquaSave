/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { UsageTrackerView } from './components/UsageTrackerView';
import { LeakageManagementView } from './components/LeakageManagementView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { GoalsAndTipsView } from './components/GoalsAndTipsView';
import { LogActivityModal } from './components/LogActivityModal';
import { SmartReminderModal } from './components/SmartReminderModal';
import { 
  loadStoredState, 
  saveItemToStorage, 
  resetToDemoData, 
  exportDataAsJSON 
} from './utils/storage';
import { 
  WaterLogEntry, 
  SmartSensor, 
  LeakReport, 
  LeakStatus, 
  SmartReminder, 
  WaterGoal, 
  AchievementBadge, 
  ConservationTip, 
  HouseholdProfile 
} from './types/water';
import { calculateTodayMetrics, triggerCelebration } from './utils/waterCalculations';
import { Droplet, Heart, Check, Info } from 'lucide-react';

export default function App() {
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // App domain state
  const [profile, setProfile] = useState<HouseholdProfile>(() => loadStoredState().profile);
  const [sensors, setSensors] = useState<SmartSensor[]>(() => loadStoredState().sensors);
  const [logs, setLogs] = useState<WaterLogEntry[]>(() => loadStoredState().logs);
  const [leaks, setLeaks] = useState<LeakReport[]>(() => loadStoredState().leaks);
  const [reminders, setReminders] = useState<SmartReminder[]>(() => loadStoredState().reminders);
  const [goals, setGoals] = useState<WaterGoal[]>(() => loadStoredState().goals);
  const [achievements, setAchievements] = useState<AchievementBadge[]>(() => loadStoredState().achievements);
  const [tips, setTips] = useState<ConservationTip[]>(() => loadStoredState().tips);

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [presetCategoryForModal, setPresetCategoryForModal] = useState<string | undefined>();
  const [editingLogEntry, setEditingLogEntry] = useState<WaterLogEntry | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Mark loaded
  useEffect(() => {
    setInitialLoaded(true);
  }, []);

  // Save to localStorage when state mutates
  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('profile', profile);
  }, [profile, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('sensors', sensors);
  }, [sensors, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('logs', logs);
  }, [logs, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('leaks', leaks);
  }, [leaks, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('reminders', reminders);
  }, [reminders, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('goals', goals);
  }, [goals, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('achievements', achievements);
  }, [achievements, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded) return;
    saveItemToStorage('tips', tips);
  }, [tips, initialLoaded]);

  // Flash toast helper
  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Reset to default sample data
  const handleResetData = () => {
    const fresh = resetToDemoData();
    setProfile(fresh.profile);
    setSensors(fresh.sensors);
    setLogs(fresh.logs);
    setLeaks(fresh.leaks);
    setReminders(fresh.reminders);
    setGoals(fresh.goals);
    setAchievements(fresh.achievements);
    setTips(fresh.tips);
    showToast('Reset all data to realistic demo benchmark state.');
  };

  // Export JSON
  const handleExportData = () => {
    exportDataAsJSON({
      profile,
      sensors,
      logs,
      leaks,
      reminders,
      goals,
      achievements,
      tips,
    });
    showToast('Water data exported to JSON backup.');
  };

  // Open Log Modal helper
  const handleOpenLogModal = (presetCategory?: string, editingEntry?: WaterLogEntry) => {
    setPresetCategoryForModal(presetCategory);
    setEditingLogEntry(editingEntry || null);
    setIsLogModalOpen(true);
  };

  // Add or Edit Water Log
  const handleSaveLog = (logData: Omit<WaterLogEntry, 'id'>, editingId?: string) => {
    if (editingId) {
      // Editing existing entry
      setLogs((prev) =>
        prev.map((l) => (l.id === editingId ? { ...logData, id: editingId } : l))
      );
      showToast(`Updated water log: ${logData.fixtureName} (${logData.litres.toFixed(1)} L)`);
    } else {
      // New entry
      const newEntry: WaterLogEntry = {
        ...logData,
        id: `log-${Date.now()}`,
      };
      setLogs((prev) => [newEntry, ...prev]);

      // If sensor was linked, update sensor's todayLitres
      if (newEntry.source === 'sensor' && newEntry.sensorId) {
        setSensors((prev) =>
          prev.map((s) =>
            s.id === newEntry.sensorId
              ? { ...s, todayLitres: Number((s.todayLitres + newEntry.litres).toFixed(1)) }
              : s
          )
        );
      }

      // Update goal current litres
      setGoals((prev) =>
        prev.map((g) => {
          if (g.category === 'total' || g.category === newEntry.category) {
            return {
              ...g,
              currentLitres: Number((g.currentLitres + newEntry.litres).toFixed(1)),
            };
          }
          return g;
        })
      );

      showToast(`Logged ${newEntry.litres.toFixed(1)} Litres (${newEntry.source === 'sensor' ? 'Smart Sensor' : 'Estimated'})`);
    }
  };

  // Delete Log
  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    showToast('Log entry removed.');
  };

  // Add Leak Report
  const handleAddLeak = (leakData: Omit<LeakReport, 'id' | 'reportedAt'>) => {
    const newLeak: LeakReport = {
      ...leakData,
      id: `leak-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };
    setLeaks((prev) => [newLeak, ...prev]);
    showToast(`Reported leak: ${newLeak.fixtureType} (${newLeak.location})`);
  };

  // Update Leak Status
  const handleUpdateLeakStatus = (id: string, status: LeakStatus, technicianNotes?: string) => {
    setLeaks((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              repairedAt: status === 'repaired' ? new Date().toISOString() : l.repairedAt,
              technicianNotes: technicianNotes || l.technicianNotes,
            }
          : l
      )
    );
    showToast(`Leak status updated to: ${status}`);
  };

  // Delete Leak
  const handleDeleteLeak = (id: string) => {
    setLeaks((prev) => prev.filter((l) => l.id !== id));
    showToast('Leak record deleted.');
  };

  // Toggle Reminder Active
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // Add Reminder
  const handleAddReminder = (reminderData: Omit<SmartReminder, 'id'>) => {
    const newReminder: SmartReminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [...prev, newReminder]);
    showToast(`Created reminder: ${newReminder.title}`);
  };

  // Delete Reminder
  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showToast('Reminder deleted.');
  };

  // Add Goal
  const handleAddGoal = (goalData: Omit<WaterGoal, 'id' | 'completed'>) => {
    const newGoal: WaterGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast(`Started goal: ${newGoal.title}`);
  };

  // Toggle Goal Complete
  const handleToggleGoalComplete = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  // Delete Goal
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Goal removed.');
  };

  // Toggle Tip Implemented
  const handleToggleTipImplemented = (id: string) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, implemented: !t.implemented } : t))
    );
  };

  // Simulate Sensor Flow (live IoT hardware demonstration)
  const handleSimulateSensorFlow = (sensorId: string, flowLpm: number) => {
    setSensors((prev) =>
      prev.map((s) => (s.id === sensorId ? { ...s, currentFlowLpm: flowLpm } : s))
    );
    if (flowLpm > 0) {
      showToast(`Simulated active water flow on sensor (${flowLpm} L/min).`);
    } else {
      showToast('Simulated flow stopped. Line returned to 0.0 L/min idle.');
    }
  };

  const todayMetrics = calculateTodayMetrics(logs, profile);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => handleOpenLogModal()}
        onResetData={handleResetData}
        onExportData={handleExportData}
      />

      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs py-2.5 px-4 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            logs={logs}
            sensors={sensors}
            leaks={leaks}
            reminders={reminders}
            profile={profile}
            onOpenLogModal={handleOpenLogModal}
            onNavigateTab={setActiveTab}
            onToggleReminder={handleToggleReminder}
            onSimulateSensorFlow={handleSimulateSensorFlow}
          />
        )}

        {activeTab === 'tracker' && (
          <UsageTrackerView
            logs={logs}
            onOpenLogModal={handleOpenLogModal}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {activeTab === 'leaks' && (
          <LeakageManagementView
            leaks={leaks}
            profile={profile}
            onAddLeak={handleAddLeak}
            onUpdateLeakStatus={handleUpdateLeakStatus}
            onDeleteLeak={handleDeleteLeak}
          />
        )}

        {activeTab === 'analytics' && (
          <ReportsAnalyticsView
            logs={logs}
            profile={profile}
          />
        )}

        {activeTab === 'goals_tips' && (
          <GoalsAndTipsView
            goals={goals}
            achievements={achievements}
            tips={tips}
            profile={profile}
            onAddGoal={handleAddGoal}
            onToggleGoalComplete={handleToggleGoalComplete}
            onDeleteGoal={handleDeleteGoal}
            onToggleTipImplemented={handleToggleTipImplemented}
          />
        )}
      </main>

      {/* Footer conforming strictly to anti-slop guidelines */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-sky-500 flex items-center justify-center text-white">
              <Droplet className="w-3 h-3 fill-white" />
            </div>
            <span className="font-semibold text-slate-900">AquaSave System</span>
            <span>·</span>
            <span>Supporting UN SDG 6: Clean Water and Sanitation</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Smart Reminders
            </button>
            <button
              onClick={handleExportData}
              className="hover:text-slate-900 transition-colors"
            >
              Export Data Backup
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset all water data to demo state?')) {
                  handleResetData();
                }
              }}
              className="hover:text-red-600 transition-colors"
            >
              Reset Sample Data
            </button>
          </div>
        </div>
      </footer>

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLogEntry(null);
        }}
        onSaveLog={handleSaveLog}
        sensors={sensors}
        initialCategory={presetCategoryForModal}
        editingEntry={editingLogEntry}
        dailyBudgetRemaining={todayMetrics.remainingLitres}
      />

      {/* Smart Reminders Manager Modal */}
      <SmartReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        reminders={reminders}
        onToggleReminder={handleToggleReminder}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
      />
    </div>
  );
}

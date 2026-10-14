import { 
  WaterLogEntry, 
  SmartSensor, 
  LeakReport, 
  SmartReminder, 
  WaterGoal, 
  AchievementBadge, 
  ConservationTip, 
  HouseholdProfile 
} from '../types/water';
import {
  defaultHouseholdProfile,
  defaultSensors,
  defaultWaterLogs,
  defaultLeakReports,
  defaultSmartReminders,
  defaultGoals,
  defaultAchievements,
  defaultConservationTips,
} from '../data/mockData';

const STORAGE_KEY_PREFIX = 'aquasave_v1_';

export interface AppState {
  profile: HouseholdProfile;
  sensors: SmartSensor[];
  logs: WaterLogEntry[];
  leaks: LeakReport[];
  reminders: SmartReminder[];
  goals: WaterGoal[];
  achievements: AchievementBadge[];
  tips: ConservationTip[];
}

export const loadStoredState = (): AppState => {
  try {
    const profile = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
    const sensors = localStorage.getItem(`${STORAGE_KEY_PREFIX}sensors`);
    const logs = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
    const leaks = localStorage.getItem(`${STORAGE_KEY_PREFIX}leaks`);
    const reminders = localStorage.getItem(`${STORAGE_KEY_PREFIX}reminders`);
    const goals = localStorage.getItem(`${STORAGE_KEY_PREFIX}goals`);
    const achievements = localStorage.getItem(`${STORAGE_KEY_PREFIX}achievements`);
    const tips = localStorage.getItem(`${STORAGE_KEY_PREFIX}tips`);

    return {
      profile: profile ? JSON.parse(profile) : defaultHouseholdProfile,
      sensors: sensors ? JSON.parse(sensors) : defaultSensors,
      logs: logs ? JSON.parse(logs) : defaultWaterLogs,
      leaks: leaks ? JSON.parse(leaks) : defaultLeakReports,
      reminders: reminders ? JSON.parse(reminders) : defaultSmartReminders,
      goals: goals ? JSON.parse(goals) : defaultGoals,
      achievements: achievements ? JSON.parse(achievements) : defaultAchievements,
      tips: tips ? JSON.parse(tips) : defaultConservationTips,
    };
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return {
      profile: defaultHouseholdProfile,
      sensors: defaultSensors,
      logs: defaultWaterLogs,
      leaks: defaultLeakReports,
      reminders: defaultSmartReminders,
      goals: defaultGoals,
      achievements: defaultAchievements,
      tips: defaultConservationTips,
    };
  }
};

export const saveItemToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const resetToDemoData = (): AppState => {
  try {
    localStorage.clear();
  } catch (e) {
    console.error(e);
  }
  return {
    profile: defaultHouseholdProfile,
    sensors: defaultSensors,
    logs: defaultWaterLogs,
    leaks: defaultLeakReports,
    reminders: defaultSmartReminders,
    goals: defaultGoals,
    achievements: defaultAchievements,
    tips: defaultConservationTips,
  };
};

export const exportDataAsJSON = (state: AppState): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `aquasave_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportLogsAsCSV = (logs: WaterLogEntry[]): void => {
  const headers = ['Timestamp', 'Category', 'Litres', 'Measurement Source', 'Fixture / Activity', 'Duration (min)', 'Flow Rate (L/min)', 'Notes'];
  const rows = logs.map(l => [
    new Date(l.timestamp).toLocaleString(),
    l.category,
    l.litres.toFixed(1),
    l.source === 'sensor' ? 'Actual Smart Sensor' : 'User Estimated',
    `"${l.fixtureName.replace(/"/g, '""')}"`,
    l.durationMinutes || '',
    l.flowRateLpm || '',
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `aquasave_water_logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

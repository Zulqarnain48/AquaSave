import confetti from 'canvas-confetti';
import { WaterLogEntry, HouseholdProfile } from '../types/water';

export const triggerCelebration = () => {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0284c7', '#38bdf8', '#7dd3fc', '#0ea5e9', '#0369a1'],
    });
  } catch {
    // fallback gracefully if canvas-confetti is not available
  }
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export interface DayUsageSummary {
  date: string;
  dayLabel: string;
  totalLitres: number;
  sensorLitres: number;
  estimateLitres: number;
  budgetLitres: number;
  isOverBudget: boolean;
}

export const calculateTodayMetrics = (logs: WaterLogEntry[], profile: HouseholdProfile) => {
  const now = new Date();
  const todayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), now));

  let totalLitres = 0;
  let sensorLitres = 0;
  let estimateLitres = 0;

  const categoryBreakdown: Record<string, number> = {
    shower: 0,
    kitchen: 0,
    toilet: 0,
    laundry: 0,
    garden: 0,
    drinking: 0,
    cleaning: 0,
    other: 0,
  };

  todayLogs.forEach(log => {
    totalLitres += log.litres;
    if (log.source === 'sensor') {
      sensorLitres += log.litres;
    } else {
      estimateLitres += log.litres;
    }
    categoryBreakdown[log.category] = (categoryBreakdown[log.category] || 0) + log.litres;
  });

  const remainingLitres = Math.max(0, profile.dailyBudgetLitres - totalLitres);
  const budgetPercentage = Math.round((totalLitres / profile.dailyBudgetLitres) * 100);
  const litresSavedVsBaseline = Math.max(0, profile.baselineLitresPerDay - totalLitres);
  const costSavingsToday = (litresSavedVsBaseline / 1000) * profile.costPer1000L;
  const litresPerPerson = profile.householdMembers > 0 ? totalLitres / profile.householdMembers : totalLitres;

  return {
    todayLogs,
    totalLitres: Number(totalLitres.toFixed(1)),
    sensorLitres: Number(sensorLitres.toFixed(1)),
    estimateLitres: Number(estimateLitres.toFixed(1)),
    remainingLitres: Number(remainingLitres.toFixed(1)),
    budgetPercentage,
    litresSavedVsBaseline: Number(litresSavedVsBaseline.toFixed(1)),
    costSavingsToday: Number(costSavingsToday.toFixed(2)),
    litresPerPerson: Number(litresPerPerson.toFixed(1)),
    categoryBreakdown,
  };
};

export const calculateLast7DaysUsage = (logs: WaterLogEntry[], profile: HouseholdProfile): DayUsageSummary[] => {
  const result: DayUsageSummary[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);

    const dayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), targetDate));

    let total = 0;
    let sensor = 0;
    let estimate = 0;

    dayLogs.forEach(log => {
      total += log.litres;
      if (log.source === 'sensor') {
        sensor += log.litres;
      } else {
        estimate += log.litres;
      }
    });

    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yest' : daysOfWeek[targetDate.getDay()];
    const dateFormatted = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    result.push({
      date: dateFormatted,
      dayLabel,
      totalLitres: Number(total.toFixed(1)),
      sensorLitres: Number(sensor.toFixed(1)),
      estimateLitres: Number(estimate.toFixed(1)),
      budgetLitres: profile.dailyBudgetLitres,
      isOverBudget: total > profile.dailyBudgetLitres,
    });
  }

  return result;
};

export const calculateHourlyProfile = (logs: WaterLogEntry[]) => {
  const now = new Date();
  const hourlyData: { hour: number; label: string; litres: number }[] = [];

  for (let h = 0; h < 24; h++) {
    const label = `${h.toString().padStart(2, '0')}:00`;
    hourlyData.push({ hour: h, label, litres: 0 });
  }

  const todayLogs = logs.filter(log => isSameDay(new Date(log.timestamp), now));
  todayLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourlyData[hour].litres += log.litres;
  });

  return hourlyData.map(d => ({
    ...d,
    litres: Number(d.litres.toFixed(1)),
  }));
};

export const categoryLabels: Record<string, { name: string; color: string; icon: string }> = {
  shower: { name: 'Shower & Bath', color: '#0284c7', icon: 'Droplets' },
  kitchen: { name: 'Kitchen & Dishes', color: '#0ea5e9', icon: 'Utensils' },
  toilet: { name: 'Toilet Flush', color: '#38bdf8', icon: 'Bath' },
  laundry: { name: 'Laundry Machine', color: '#60a5fa', icon: 'Shirt' },
  garden: { name: 'Garden & Plants', color: '#10b981', icon: 'Trees' },
  drinking: { name: 'Drinking & Prep', color: '#06b6d4', icon: 'Coffee' },
  cleaning: { name: 'Cleaning & Wash', color: '#64748b', icon: 'Sparkles' },
  other: { name: 'Other Usage', color: '#94a3b8', icon: 'MoreHorizontal' },
};

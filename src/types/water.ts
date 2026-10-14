export type WaterCategory = 
  | 'shower'
  | 'kitchen'
  | 'toilet'
  | 'laundry'
  | 'garden'
  | 'drinking'
  | 'cleaning'
  | 'other';

export type MeasurementSource = 'sensor' | 'estimate';

export interface WaterLogEntry {
  id: string;
  timestamp: string; // ISO string
  category: WaterCategory;
  litres: number;
  source: MeasurementSource;
  fixtureName: string;
  durationMinutes?: number;
  flowRateLpm?: number;
  notes?: string;
  sensorId?: string;
}

export interface SmartSensor {
  id: string;
  name: string;
  location: string;
  currentFlowLpm: number;
  todayLitres: number;
  status: 'online' | 'idle' | 'warning';
  batteryPct: number;
  lastHeartbeat: string;
  pipeDiameterMm: number;
}

export type LeakUrgency = 'minor' | 'moderate' | 'severe' | 'critical';
export type LeakStatus = 'investigating' | 'scheduled' | 'repaired';

export interface LeakReport {
  id: string;
  reportedAt: string;
  fixtureType: string;
  location: string;
  urgency: LeakUrgency;
  estimatedLossLitersPerDay: number;
  status: LeakStatus;
  description: string;
  repairedAt?: string;
  technicianNotes?: string;
}

export interface SmartReminder {
  id: string;
  title: string;
  description: string;
  category: WaterCategory;
  triggerTime: string; // e.g. "07:30" or "After 5 min shower"
  frequency: 'daily' | 'weekly' | 'smart_trigger';
  isActive: boolean;
  litersSavedPotential: number;
  lastTriggered?: string;
}

export interface WaterGoal {
  id: string;
  title: string;
  targetLitres: number;
  currentLitres: number;
  period: 'daily' | 'weekly' | 'monthly';
  category?: WaterCategory | 'total';
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  progressPercent: number;
  criteria: string;
}

export interface ConservationTip {
  id: string;
  title: string;
  category: WaterCategory;
  potentialSavingsLiters: number;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  description: string;
  annualSavingsLitres: number;
  sdgImpact: string;
  implemented: boolean;
}

export interface HouseholdProfile {
  householdMembers: number;
  dailyBudgetLitres: number; // e.g. 150L per day
  baselineLitresPerDay: number; // typical prior baseline 240L
  costPer1000L: number; // in local currency, e.g. $2.80
  currencySymbol: string;
  addressArea: string;
}

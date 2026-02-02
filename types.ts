
export interface Task {
  id: string;
  time?: string;
  label: string;
  tip?: string;
}

export interface WeightEntry {
  date: string;
  value: number;
}

export interface DailyData {
  diet: Record<string, boolean>;
  exercises: Record<string, boolean>;
  water: number; // in Liters
}

export interface AppState {
  history: Record<string, DailyData>; // Key is YYYY-MM-DD
  weightLogs: WeightEntry[];
  startDate: string; // ISO string
}

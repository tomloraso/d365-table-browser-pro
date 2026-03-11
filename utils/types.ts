export interface Environment {
  id: string;
  label: string;
  url: string;
  defaultCompany: string;
  color: string;
  sortOrder: number;
}

export interface FavoriteEntry {
  id: string;
  tableName: string;
  note?: string;
}

export interface HistoryEntry {
  tableName: string;
  company: string;
  timestamp: number;
}

export interface UserSettings {
  defaultPageSize: number;
  defaultCompany: string;
  theme: 'light' | 'dark' | 'system';
}

export const ENVIRONMENT_COLORS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Purple', value: '#A855F7' },
  { label: 'Teal', value: '#14B8A6' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Yellow', value: '#EAB308' },
] as const;

export const MAX_HISTORY_ENTRIES = 50;

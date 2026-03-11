import { storage } from 'wxt/utils/storage';
import type { Environment, FavoriteEntry, HistoryEntry, UserSettings } from './types';
import type { ODataMetadata } from './odata/types';

export const environmentsStorage = storage.defineItem<Environment[]>(
  'local:environments',
  { fallback: [] }
);

export const activeEnvironmentIdStorage = storage.defineItem<string | null>(
  'local:activeEnvironmentId',
  { fallback: null }
);

export const favoritesStorage = storage.defineItem<FavoriteEntry[]>(
  'local:favorites',
  { fallback: [] }
);

export const historyStorage = storage.defineItem<HistoryEntry[]>(
  'local:history',
  { fallback: [] }
);

export const settingsStorage = storage.defineItem<UserSettings>(
  'sync:settings',
  {
    fallback: {
      defaultPageSize: 25,
      defaultCompany: 'USMF',
      theme: 'system',
    },
  }
);

/**
 * Cached metadata per environment, keyed by environment ID.
 * Stored as a record so we can cache multiple environments independently.
 */
export const metadataCacheStorage = storage.defineItem<Record<string, ODataMetadata>>(
  'local:metadataCache',
  { fallback: {} }
);

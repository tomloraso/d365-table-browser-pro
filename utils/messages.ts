import type { ODataMetadata } from './odata/types';

/**
 * Messages sent between popup/sidepanel and the background service worker.
 */
export type BackgroundMessage =
  | { type: 'FETCH_METADATA'; environmentId: string; environmentUrl: string; forceRefresh?: boolean }
  | { type: 'GET_CACHED_METADATA'; environmentId: string }
  | { type: 'CLEAR_METADATA_CACHE'; environmentId: string }
  | { type: 'EXECUTE_QUERY'; url: string };

export type BackgroundResponse =
  | { type: 'METADATA_RESULT'; data: ODataMetadata }
  | { type: 'METADATA_LOADING'; status: string }
  | { type: 'METADATA_ERROR'; error: string }
  | { type: 'METADATA_CLEARED' }
  | { type: 'NO_CACHE' }
  | { type: 'QUERY_RESULT'; data: Record<string, unknown>[]; totalCount?: number }
  | { type: 'QUERY_ERROR'; error: string; status?: number };

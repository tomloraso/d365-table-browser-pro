import { useState, useEffect, useCallback } from 'react';
import type { BackgroundMessage, BackgroundResponse } from '@/utils/messages';
import type { ODataMetadata, EntityDefinition } from '@/utils/odata/types';

interface UseMetadataResult {
  metadata: ODataMetadata | null;
  loading: boolean;
  error: string | null;
  fetchMetadata: (forceRefresh?: boolean) => void;
  clearCache: () => void;
  searchEntities: (query: string) => EntityDefinition[];
  getEntity: (entitySetName: string) => EntityDefinition | undefined;
  lastFetched: Date | null;
}

export function useMetadata(
  environmentId: string | null,
  environmentUrl: string | null
): UseMetadataResult {
  const [metadata, setMetadata] = useState<ODataMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached metadata on mount or environment change.
  // Does NOT auto-fetch — user must explicitly request via Query/Entities tabs.
  useEffect(() => {
    if (!environmentId) {
      setMetadata(null);
      return;
    }

    let cancelled = false;

    const loadCache = async () => {
      const cacheMsg: BackgroundMessage = {
        type: 'GET_CACHED_METADATA',
        environmentId,
      };
      const cacheResponse = (await browser.runtime.sendMessage(cacheMsg).catch(() => null)) as BackgroundResponse | null;

      if (cancelled || !cacheResponse) return;

      if (cacheResponse.type === 'METADATA_RESULT') {
        setMetadata(cacheResponse.data);
        setError(null);
      }
    };

    loadCache();
    return () => { cancelled = true; };
  }, [environmentId]);

  const fetchMetadata = useCallback(
    async (forceRefresh = false) => {
      if (!environmentId || !environmentUrl) return;

      setLoading(true);
      setError(null);

      try {
        const msg: BackgroundMessage = {
          type: 'FETCH_METADATA',
          environmentId,
          environmentUrl,
          forceRefresh,
        };
        const response = (await browser.runtime.sendMessage(msg)) as BackgroundResponse;

        if (response.type === 'METADATA_RESULT') {
          setMetadata(response.data);
        } else if (response.type === 'METADATA_ERROR') {
          setError(response.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
      } finally {
        setLoading(false);
      }
    },
    [environmentId, environmentUrl]
  );

  const clearCache = useCallback(async () => {
    if (!environmentId) return;
    const msg: BackgroundMessage = {
      type: 'CLEAR_METADATA_CACHE',
      environmentId,
    };
    await browser.runtime.sendMessage(msg).catch(() => {});
    setMetadata(null);
  }, [environmentId]);

  const searchEntities = useCallback(
    (query: string): EntityDefinition[] => {
      if (!metadata || !query.trim()) return [];
      const lowerQuery = query.toLowerCase();
      return metadata.entities.filter(
        (e) =>
          e.entitySetName.toLowerCase().includes(lowerQuery) ||
          e.entityTypeName.toLowerCase().includes(lowerQuery) ||
          (e.tableName && e.tableName.toLowerCase().includes(lowerQuery)) ||
          (e.label && e.label.toLowerCase().includes(lowerQuery))
      );
    },
    [metadata]
  );

  const getEntity = useCallback(
    (entitySetName: string): EntityDefinition | undefined => {
      return metadata?.entities.find((e) => e.entitySetName === entitySetName);
    },
    [metadata]
  );

  const lastFetched = metadata ? new Date(metadata.fetchedAt) : null;

  return {
    metadata,
    loading,
    error,
    fetchMetadata,
    clearCache,
    searchEntities,
    getEntity,
    lastFetched,
  };
}

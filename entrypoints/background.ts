import {
  activeEnvironmentIdStorage,
  environmentsStorage,
  metadataCacheStorage,
} from '@/utils/storage';
import { parseMetadataXml } from '@/utils/odata/metadata-parser';
import { buildMetadataUrl } from '@/utils/d365/urls';
import type { BackgroundMessage, BackgroundResponse } from '@/utils/messages';
import type { ODataMetadata } from '@/utils/odata/types';

const METADATA_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export default defineBackground(() => {
  // ---- Badge management ----
  const updateBadge = async () => {
    const [environments, activeId] = await Promise.all([
      environmentsStorage.getValue(),
      activeEnvironmentIdStorage.getValue(),
    ]);

    const active = environments.find((e) => e.id === activeId);

    if (active) {
      await browser.action.setBadgeBackgroundColor({ color: active.color });
      await browser.action.setBadgeText({ text: ' ' });
      await browser.action.setTitle({ title: `D365 F&O Table & OData Browser Pro - ${active.label}` });
    } else {
      await browser.action.setBadgeText({ text: '' });
      await browser.action.setTitle({ title: 'D365 F&O Table & OData Browser Pro' });
    }
  };

  activeEnvironmentIdStorage.watch(() => updateBadge());
  environmentsStorage.watch(() => updateBadge());
  updateBadge();

  // ---- Metadata fetch and cache ----
  // Track in-flight fetches to avoid duplicate requests
  const fetchingMap = new Map<string, Promise<ODataMetadata>>();

  async function fetchAndCacheMetadata(
    environmentId: string,
    environmentUrl: string,
    forceRefresh = false
  ): Promise<ODataMetadata> {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cache = await metadataCacheStorage.getValue();
      const cached = cache[environmentId];
      if (cached && Date.now() - cached.fetchedAt < METADATA_MAX_AGE_MS) {
        return cached;
      }
    }

    // De-duplicate concurrent requests for the same environment
    const existing = fetchingMap.get(environmentId);
    if (existing) return existing;

    const promise = doFetch(environmentId, environmentUrl);
    fetchingMap.set(environmentId, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      fetchingMap.delete(environmentId);
    }
  }

  async function doFetch(
    environmentId: string,
    environmentUrl: string
  ): Promise<ODataMetadata> {
    const url = buildMetadataUrl(environmentUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let response: Response;
    try {
      response = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
        headers: { Accept: 'application/xml' },
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Metadata fetch timed out. The environment may be slow or unreachable.');
      }
      throw err;
    }
    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'Not authenticated. Please log in to D365 in your browser first.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch metadata: ${response.status} ${response.statusText}`
      );
    }

    const xml = await response.text();
    const metadata = parseMetadataXml(xml, environmentId);

    // Save to cache
    const cache = await metadataCacheStorage.getValue();
    cache[environmentId] = metadata;
    await metadataCacheStorage.setValue(cache);

    return metadata;
  }

  // ---- Message handling ----
  browser.runtime.onMessage.addListener(
    (
      message: BackgroundMessage,
      sender: Browser.runtime.MessageSender,
      sendResponse: (response: BackgroundResponse) => void
    ): true | undefined => {
      // Only accept messages from this extension
      if (sender.id !== browser.runtime.id) return;

      switch (message.type) {
        case 'FETCH_METADATA': {
          fetchAndCacheMetadata(
            message.environmentId,
            message.environmentUrl,
            message.forceRefresh
          )
            .then((data) => sendResponse({ type: 'METADATA_RESULT', data }))
            .catch((err) =>
              sendResponse({
                type: 'METADATA_ERROR',
                error: err instanceof Error ? err.message : String(err),
              })
            );
          return true; // Keep message channel open for async response
        }

        case 'GET_CACHED_METADATA': {
          metadataCacheStorage
            .getValue()
            .then((cache) => {
              const cached = cache[message.environmentId];
              if (cached) {
                sendResponse({ type: 'METADATA_RESULT', data: cached });
              } else {
                sendResponse({ type: 'NO_CACHE' });
              }
            })
            .catch((err) =>
              sendResponse({
                type: 'METADATA_ERROR',
                error: err instanceof Error ? err.message : String(err),
              })
            );
          return true;
        }

        case 'CLEAR_METADATA_CACHE': {
          metadataCacheStorage
            .getValue()
            .then(async (cache) => {
              delete cache[message.environmentId];
              await metadataCacheStorage.setValue(cache);
              sendResponse({ type: 'METADATA_CLEARED' });
            })
            .catch((err) =>
              sendResponse({
                type: 'METADATA_ERROR',
                error: err instanceof Error ? err.message : String(err),
              })
            );
          return true;
        }

        case 'EXECUTE_QUERY': {
          executeQuery(message.url)
            .then((result) => sendResponse(result))
            .catch((err) =>
              sendResponse({
                type: 'QUERY_ERROR',
                error: err instanceof Error ? err.message : String(err),
              })
            );
          return true;
        }

      }
    }
  );

  // ---- OData query execution ----
  async function executeQuery(url: string): Promise<BackgroundResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min for large queries

    let response: Response;
    try {
      response = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { type: 'QUERY_ERROR', error: 'Query timed out. Try reducing the row count or adding filters.' };
      }
      throw err;
    }
    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      return {
        type: 'QUERY_ERROR',
        error: 'Not authenticated. Please log in to D365 in your browser first.',
        status: response.status,
      };
    }

    if (!response.ok) {
      let errorDetail = `${response.status} ${response.statusText}`;
      try {
        const body = await response.json();
        if (body?.error?.message) {
          errorDetail = body.error.message;
        }
      } catch {
        // ignore parse errors
      }
      return {
        type: 'QUERY_ERROR',
        error: errorDetail,
        status: response.status,
      };
    }

    const json = await response.json();
    const data = json.value ?? [];
    const totalCount = json['@odata.count'];

    return {
      type: 'QUERY_RESULT',
      data,
      totalCount: totalCount != null ? Number(totalCount) : undefined,
    };
  }
});

import { useState, useEffect, useCallback } from 'react';
import { historyStorage } from '@/utils/storage';
import { MAX_HISTORY_ENTRIES } from '@/utils/types';
import type { HistoryEntry } from '@/utils/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    historyStorage.getValue().then(setHistory);
    const unwatch = historyStorage.watch((val) => setHistory(val ?? []));
    return unwatch;
  }, []);

  // Sorted by most recent first
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  const addToHistory = useCallback(
    async (tableName: string, company: string) => {
      // Remove existing entry for same table+company
      const filtered = history.filter(
        (h) =>
          !(h.tableName === tableName && h.company === company)
      );

      const entry: HistoryEntry = {
        tableName,
        company,
        timestamp: Date.now(),
      };

      const updated = [entry, ...filtered].slice(0, MAX_HISTORY_ENTRIES);
      await historyStorage.setValue(updated);
    },
    [history]
  );

  const removeFromHistory = useCallback(
    async (tableName: string, company: string, timestamp: number) => {
      const filtered = history.filter(
        (h) =>
          !(h.tableName === tableName && h.company === company && h.timestamp === timestamp)
      );
      await historyStorage.setValue(filtered);
    },
    [history]
  );

  const clearHistory = useCallback(async () => {
    await historyStorage.setValue([]);
  }, []);

  return { history: sortedHistory, addToHistory, removeFromHistory, clearHistory };
}

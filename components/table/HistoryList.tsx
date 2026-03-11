import type { HistoryEntry, Environment } from '@/utils/types';
import { buildTableBrowserUrl } from '@/utils/d365/urls';

interface HistoryListProps {
  history: HistoryEntry[];
  environment: Environment;
  onOpen: (tableName: string, company: string) => void;
  onRemove: (tableName: string, company: string, timestamp: number) => void;
  onClear: () => void;
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HistoryList({ history, environment, onOpen, onRemove, onClear }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-xs text-gray-400">
        No recent tables opened.
      </div>
    );
  }

  const handleOpen = (entry: HistoryEntry) => {
    const url = buildTableBrowserUrl(environment.url, entry.tableName, entry.company);
    window.open(url, '_blank');
    onOpen(entry.tableName, entry.company);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50">
        <span className="text-xs font-medium text-gray-500">Recent</span>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500"
        >
          Clear all
        </button>
      </div>
      <div className="divide-y divide-d365-border">
        {history.slice(0, 20).map((entry, i) => (
          <div
            key={`${entry.tableName}-${entry.timestamp}-${i}`}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 group"
          >
            <button
              onClick={() => handleOpen(entry)}
              className="flex-1 text-left text-sm text-d365-blue hover:underline truncate"
              title={`Open ${entry.tableName} (${entry.company})`}
            >
              {entry.tableName}
            </button>
            <span className="text-xs text-gray-400 shrink-0">{entry.company}</span>
            <span className="text-xs text-gray-300 shrink-0 w-12 text-right">
              {formatTimestamp(entry.timestamp)}
            </span>
            <button
              onClick={() => onRemove(entry.tableName, entry.company, entry.timestamp)}
              className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

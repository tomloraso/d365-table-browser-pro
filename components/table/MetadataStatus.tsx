interface MetadataStatusProps {
  tableCount: number | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  onFetch: (forceRefresh?: boolean) => void;
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MetadataStatus({
  tableCount,
  loading,
  error,
  lastFetched,
  onFetch,
}: MetadataStatusProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-d365-border text-[10px]">
      {loading ? (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-gray-500">Fetching environment tables...</span>
        </>
      ) : error ? (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
          <span className="text-red-500 truncate flex-1" title={error}>
            {error}
          </span>
          <button
            onClick={() => onFetch(true)}
            className="text-d365-blue hover:underline shrink-0"
          >
            Retry
          </button>
        </>
      ) : tableCount !== null ? (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          <span className="text-gray-500">
            {tableCount} tables available
          </span>
          {lastFetched && (
            <span className="text-gray-400">
              ({formatRelativeTime(lastFetched)})
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={() => onFetch(true)}
            className="text-d365-blue hover:underline shrink-0"
          >
            Refresh
          </button>
        </>
      ) : (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-gray-400">Tables not loaded</span>
          <div className="flex-1" />
          <button
            onClick={() => onFetch()}
            className="text-d365-blue hover:underline shrink-0"
          >
            Fetch Tables
          </button>
        </>
      )}
    </div>
  );
}

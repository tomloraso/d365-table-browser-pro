import { useState, useMemo } from 'react';
import type { EntityDefinition } from '@/utils/odata/types';

interface EntityBrowserProps {
  entities: EntityDefinition[];
  onSelect: (entitySetName: string) => void;
  hasMetadata: boolean;
  loading: boolean;
  error: string | null;
  onLoadMetadata: () => void;
}

export function EntityBrowser({
  entities,
  onSelect,
  hasMetadata,
  loading,
  error,
  onLoadMetadata,
}: EntityBrowserProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return entities;
    const q = search.toLowerCase();
    return entities.filter(
      (e) =>
        e.entitySetName.toLowerCase().includes(q) ||
        e.entityTypeName.toLowerCase().includes(q) ||
        (e.tableName && e.tableName.toLowerCase().includes(q)) ||
        (e.label && e.label.toLowerCase().includes(q))
    );
  }, [entities, search]);

  if (!hasMetadata) {
    return (
      <div className="p-6 text-center">
        {loading ? (
          <>
            <div className="inline-block w-5 h-5 border-2 border-d365-blue/30 border-t-d365-blue rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">
              Fetching metadata from environment...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This may take a moment for large environments.
            </p>
          </>
        ) : error ? (
          <>
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={onLoadMetadata}
              className="text-sm bg-d365-blue text-white rounded px-4 py-2 hover:bg-d365-blue/90"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-3">
              Load OData metadata from your D365 environment to browse entities, view fields, and build queries.
            </p>
            <button
              onClick={onLoadMetadata}
              className="text-sm bg-d365-blue text-white rounded px-4 py-2 hover:bg-d365-blue/90"
            >
              Load Metadata
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="px-3 py-2 border-b border-d365-border bg-gray-50">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entities by name, table, or label..."
          className="w-full text-xs border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-d365-blue/30"
          autoFocus
        />
        <div className="text-[10px] text-gray-400 mt-1">
          {filtered.length} of {entities.length} entities
        </div>
      </div>

      {/* Entity list */}
      <div className="divide-y divide-gray-100">
        {filtered.slice(0, 100).map((entity) => (
          <button
            key={entity.entitySetName}
            onClick={() => onSelect(entity.entitySetName)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-800 truncate">
                {entity.entitySetName}
              </span>
              <span className="text-[10px] text-gray-400 shrink-0">
                {entity.properties.length} fields
              </span>
            </div>
            {(entity.label || entity.tableName) && (
              <div className="flex items-center gap-2 mt-0.5">
                {entity.tableName && (
                  <span className="text-[10px] text-d365-blue font-mono">
                    {entity.tableName}
                  </span>
                )}
                {entity.label && (
                  <span className="text-[10px] text-gray-400 truncate">
                    {entity.label}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
        {filtered.length > 100 && (
          <div className="px-3 py-2 text-center text-[10px] text-gray-400">
            Showing first 100 results. Refine your search to see more.
          </div>
        )}
        {filtered.length === 0 && search.trim() && (
          <div className="px-3 py-4 text-center text-xs text-gray-400">
            No entities match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

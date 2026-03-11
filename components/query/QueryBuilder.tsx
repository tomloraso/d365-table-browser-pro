import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { EntityDefinition } from '@/utils/odata/types';
import type { ODataFilter, ODataQueryOptions } from '@/utils/odata/query-builder';
import { buildODataQueryUrl } from '@/utils/odata/query-builder';
import type { BackgroundMessage, BackgroundResponse } from '@/utils/messages';
import { FilterRow } from './FilterRow';
import { DataGrid } from '@/components/data/DataGrid';
import type { Environment } from '@/utils/types';

interface QueryBuilderProps {
  environment: Environment;
  entities: EntityDefinition[];
  onSelectEntity?: (entitySetName: string) => void;
}

export function QueryBuilder({ environment, entities, onSelectEntity }: QueryBuilderProps) {
  const [selectedEntitySetName, setSelectedEntitySetName] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ODataFilter[]>([]);
  const [top, setTop] = useState(50);
  const [skip, setSkip] = useState(0);
  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [crossCompany, setCrossCompany] = useState(false);

  const [queryResult, setQueryResult] = useState<Record<string, unknown>[] | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const entity = useMemo(
    () => entities.find((e) => e.entitySetName === selectedEntitySetName),
    [entities, selectedEntitySetName]
  );

  const fieldNames = useMemo(
    () => entity?.properties.map((p) => p.name) ?? [],
    [entity]
  );

  const fieldTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    entity?.properties.forEach((p) => map.set(p.name, p.type));
    return map;
  }, [entity]);

  const filteredEntities = useMemo(() => {
    if (!entitySearch.trim()) return entities.slice(0, 100);
    const q = entitySearch.toLowerCase();
    return entities
      .filter(
        (e) =>
          e.entitySetName.toLowerCase().includes(q) ||
          e.entityTypeName.toLowerCase().includes(q) ||
          (e.label && e.label.toLowerCase().includes(q))
      )
      .slice(0, 100);
  }, [entities, entitySearch]);

  const queryOptions: ODataQueryOptions = useMemo(
    () => ({
      entitySetName: selectedEntitySetName,
      select: selectedFields,
      filters: filters.filter((f) => f.field && f.value),
      orderBy: orderBy || undefined,
      orderDirection,
      top,
      skip,
      crossCompany,
    }),
    [selectedEntitySetName, selectedFields, filters, top, skip, orderBy, orderDirection, crossCompany]
  );

  const queryUrl = useMemo(() => {
    if (!selectedEntitySetName) return '';
    return buildODataQueryUrl(environment.url, queryOptions, fieldTypeMap);
  }, [environment.url, selectedEntitySetName, queryOptions, fieldTypeMap]);

  const handleSelectEntity = (entitySetName: string) => {
    setSelectedEntitySetName(entitySetName);
    setSelectedFields([]);
    setFilters([]);
    setOrderBy('');
    setQueryResult(null);
    setQueryError(null);
    setSkip(0);
    onSelectEntity?.(entitySetName);
  };

  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSelectAllFields = () => {
    if (selectedFields.length === fieldNames.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...fieldNames]);
    }
  };

  const handleAddFilter = () => {
    setFilters((prev) => [...prev, { field: '', operator: 'eq', value: '' }]);
  };

  const handleUpdateFilter = (idx: number, filter: ODataFilter) => {
    setFilters((prev) => prev.map((f, i) => (i === idx ? filter : f)));
  };

  const handleRemoveFilter = (idx: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExecute = useCallback(async () => {
    if (!queryUrl) return;

    setQueryLoading(true);
    setQueryError(null);

    try {
      const msg: BackgroundMessage = { type: 'EXECUTE_QUERY', url: queryUrl };
      const response = (await browser.runtime.sendMessage(msg)) as BackgroundResponse;

      if (response.type === 'QUERY_RESULT') {
        setQueryResult(response.data);
      } else if (response.type === 'QUERY_ERROR') {
        setQueryError(response.error);
        setQueryResult(null);
      }
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Query failed');
      setQueryResult(null);
    } finally {
      setQueryLoading(false);
    }
  }, [queryUrl]);

  const pendingPagination = useRef(false);

  const handleNextPage = () => {
    pendingPagination.current = true;
    setSkip((prev) => prev + top);
  };

  const handlePrevPage = () => {
    pendingPagination.current = true;
    setSkip((prev) => Math.max(0, prev - top));
  };

  // Auto-execute when skip changes due to pagination
  useEffect(() => {
    if (pendingPagination.current) {
      pendingPagination.current = false;
      handleExecute();
    }
  }, [skip, handleExecute]);

  // Entity selection view
  if (!selectedEntitySetName) {
    return (
      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-500">
          Select an entity to build a query.
          {entities.length === 0 && ' Load metadata from the Entities tab first.'}
        </p>
        {entities.length > 0 && (
          <>
            <input
              type="text"
              value={entitySearch}
              onChange={(e) => setEntitySearch(e.target.value)}
              placeholder={`Search ${entities.length} entities...`}
              className="w-full text-xs border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30"
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto border border-d365-border rounded">
              {filteredEntities.map((e) => (
                <div
                  key={e.entitySetName}
                  className="px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-50 border-b border-d365-border last:border-b-0"
                  onClick={() => handleSelectEntity(e.entitySetName)}
                >
                  <span className="font-medium">{e.entitySetName}</span>
                  {e.label && (
                    <span className="ml-2 text-gray-400">{e.label}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Entity header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-d365-border shrink-0">
        <button
          onClick={() => setSelectedEntitySetName('')}
          className="text-xs text-d365-blue hover:underline"
        >
          ← Back
        </button>
        <span className="text-xs font-medium truncate">{selectedEntitySetName}</span>
        {entity?.label && (
          <span className="text-[10px] text-gray-400 truncate">{entity.label}</span>
        )}
      </div>

      {/* Query options */}
      <div className="p-3 space-y-3 border-b border-d365-border shrink-0 overflow-y-auto max-h-80">
        {/* Field selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">
              Fields ({selectedFields.length}/{fieldNames.length})
            </label>
            <button
              onClick={handleSelectAllFields}
              className="text-[10px] text-d365-blue hover:underline"
            >
              {selectedFields.length === fieldNames.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto border border-d365-border rounded p-1.5 grid grid-cols-2 gap-0.5">
            {fieldNames.map((f) => (
              <label key={f} className="flex items-center gap-1 text-[10px] cursor-pointer truncate">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f)}
                  onChange={() => handleToggleField(f)}
                  className="w-3 h-3"
                />
                <span className="truncate" title={f}>{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Filters</label>
            <button
              onClick={handleAddFilter}
              className="text-[10px] text-d365-blue hover:underline"
            >
              + Add filter
            </button>
          </div>
          {filters.length > 0 && (
            <div className="space-y-1">
              {filters.map((f, idx) => (
                <FilterRow
                  key={idx}
                  filter={f}
                  fields={fieldNames}
                  onChange={(updated) => handleUpdateFilter(idx, updated)}
                  onRemove={() => handleRemoveFilter(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Options row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-gray-500">Top</label>
            <input
              type="number"
              value={top}
              onChange={(e) => setTop(Math.min(10000, Math.max(1, parseInt(e.target.value) || 50)))}
              className="w-16 text-xs border border-d365-border rounded px-1.5 py-0.5"
              min={1}
              max={10000}
            />
          </div>

          <div className="flex items-center gap-1">
            <label className="text-[10px] text-gray-500">Order by</label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="text-xs border border-d365-border rounded px-1 py-0.5 bg-white max-w-28"
            >
              <option value="">None</option>
              {fieldNames.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {orderBy && (
              <button
                onClick={() => setOrderDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="text-xs text-d365-blue px-1"
                title={`Currently ${orderDirection}`}
              >
                {orderDirection === 'asc' ? '↑' : '↓'}
              </button>
            )}
          </div>

          <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={crossCompany}
              onChange={(e) => setCrossCompany(e.target.checked)}
              className="w-3 h-3"
            />
            Cross-company
          </label>
        </div>

        {/* URL preview */}
        {queryUrl && (
          <div>
            <button
              onClick={() => setShowUrl(!showUrl)}
              className="text-[10px] text-d365-blue hover:underline"
            >
              {showUrl ? 'Hide' : 'Show'} OData URL
            </button>
            {showUrl && (
              <div
                className="mt-1 p-2 bg-gray-50 border border-d365-border rounded text-[10px] text-gray-600 break-all cursor-pointer select-all"
                title="Click to copy"
                onClick={() => navigator.clipboard.writeText(queryUrl)}
              >
                {queryUrl}
              </div>
            )}
          </div>
        )}

        {/* Warning for large unfiltered queries */}
        {top > 500 && filters.filter((f) => f.field && f.value).length === 0 && (
          <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
            Fetching {top} rows with no filters may be slow and impact your D365 environment. Consider adding filters or reducing the row count.
          </div>
        )}

        {/* Execute button */}
        <button
          onClick={handleExecute}
          disabled={!selectedEntitySetName || queryLoading}
          className="w-full text-sm bg-d365-blue text-white rounded px-3 py-2 hover:bg-d365-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {queryLoading ? 'Executing...' : 'Run Query'}
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {queryError && (
          <div className="px-3 py-2 bg-red-50 text-red-600 text-xs border-b border-red-200">
            {queryError}
          </div>
        )}

        {queryResult && (
          <DataGrid
            data={queryResult}
            columns={selectedFields.length > 0 ? selectedFields : undefined}
            entitySetName={selectedEntitySetName}
            skip={skip}
            top={top}
            onNextPage={queryResult.length >= top ? handleNextPage : undefined}
            onPrevPage={skip > 0 ? handlePrevPage : undefined}
          />
        )}

        {!queryResult && !queryError && !queryLoading && (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
            Configure your query and click Run Query
          </div>
        )}
      </div>
    </div>
  );
}

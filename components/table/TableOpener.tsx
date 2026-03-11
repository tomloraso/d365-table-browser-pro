import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { buildTableBrowserUrl } from '@/utils/d365/urls';
import { searchTables, BUILTIN_TABLE_COUNT } from '@/utils/d365/tables';
import type { Environment } from '@/utils/types';

interface SearchResult {
  name: string;
  description?: string;
}

interface TableOpenerProps {
  environment: Environment;
  onOpen: (tableName: string, company: string) => void;
  isFavorite: (tableName: string) => boolean;
  onToggleFavorite: (tableName: string) => void;
}

export function TableOpener({
  environment,
  onOpen,
  isFavorite,
  onToggleFavorite,
}: TableOpenerProps) {
  const [tableName, setTableName] = useState('');
  const [company, setCompany] = useState(environment.defaultCompany);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  const results = useMemo((): SearchResult[] => {
    if (!tableName.trim()) return [];
    return searchTables(tableName, 50).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }, [tableName]);

  const hasResults = results.length > 0 && showResults;

  const handleOpen = useCallback(() => {
    const name = tableName.trim();
    if (!name) return;

    const url = buildTableBrowserUrl(environment.url, name, company);
    window.open(url, '_blank');
    onOpen(name, company);
  }, [tableName, company, environment.url, onOpen]);

  const handleSelect = useCallback((name: string) => {
    justSelectedRef.current = true;
    setTableName(name);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].name);
      } else {
        handleOpen();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowResults(true);
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      return;
    }

    if (e.key === 'Escape') {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-result-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="p-3 space-y-3">
      <div className="relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Table Name
        </label>
        <div className="flex gap-1">
          <input
            ref={inputRef}
            type="text"
            value={tableName}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (justSelectedRef.current) {
                justSelectedRef.current = false;
                return;
              }
              if (tableName.trim()) setShowResults(true);
            }}
            placeholder={`Search ${BUILTIN_TABLE_COUNT.toLocaleString()} tables...`}
            className="flex-1 text-sm border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30 focus:border-d365-blue"
            autoFocus
            autoComplete="off"
          />
          {tableName.trim() && (
            <button
              type="button"
              onClick={() => onToggleFavorite(tableName.trim())}
              className={`px-2 text-lg leading-none ${
                isFavorite(tableName.trim())
                  ? 'text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
              title={
                isFavorite(tableName.trim())
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              ★
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {hasResults && (
          <div
            ref={resultsRef}
            className="mt-1 bg-white border border-d365-border rounded shadow-lg max-h-60 overflow-y-auto"
          >
            {results.map((entry, idx) => {
              const isSelected = idx === selectedIndex;

              const lowerName = entry.name.toLowerCase();
              const lowerQuery = tableName.toLowerCase();
              const matchStart = lowerName.indexOf(lowerQuery);

              return (
                <div
                  key={entry.name}
                  data-result-item
                  className={`px-2 py-1.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-d365-blue/10 text-d365-blue'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                  onClick={() => handleSelect(entry.name)}
                >
                  <div className="text-sm break-all">
                    {matchStart >= 0 ? (
                      <span>
                        {entry.name.slice(0, matchStart)}
                        <span className="font-semibold text-d365-blue">
                          {entry.name.slice(
                            matchStart,
                            matchStart + tableName.length
                          )}
                        </span>
                        {entry.name.slice(matchStart + tableName.length)}
                      </span>
                    ) : (
                      entry.name
                    )}
                  </div>
                  {entry.description && (
                    <div className="text-[10px] text-gray-400">
                      {entry.description}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="px-2 py-1.5 text-[10px] text-gray-400 border-t border-d365-border bg-gray-50">
              {results.length} result{results.length !== 1 ? 's' : ''} — type any name, even if not listed
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleOpen();
          }}
          placeholder="USMF"
          className="w-full text-sm border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30 focus:border-d365-blue"
        />
      </div>

      <button
        onClick={handleOpen}
        disabled={!tableName.trim()}
        className="w-full text-sm text-white rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        style={{ backgroundColor: environment.color }}
      >
        Open Table Browser
      </button>
    </div>
  );
}

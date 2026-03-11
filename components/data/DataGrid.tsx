import { useState, useMemo } from 'react';
import { toCSV, toTSV, downloadFile, copyToClipboard } from '@/utils/export';

interface DataGridProps {
  data: Record<string, unknown>[];
  columns?: string[];
  entitySetName: string;
  skip: number;
  top: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function DataGrid({
  data,
  columns,
  entitySetName,
  skip,
  top,
  onNextPage,
  onPrevPage,
}: DataGridProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [exportOpen, setExportOpen] = useState(false);

  // Determine columns from data if not provided
  const cols = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (data.length === 0) return [];
    // Filter out OData metadata fields
    return Object.keys(data[0]).filter((k) => !k.startsWith('@odata'));
  }, [data, columns]);

  // Client-side sort
  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const handleExportCSV = () => {
    const csv = toCSV(data, cols);
    downloadFile(csv, `${entitySetName}.csv`);
    setExportOpen(false);
  };

  const handleCopyTSV = async () => {
    const tsv = toTSV(data, cols);
    await copyToClipboard(tsv);
    setExportOpen(false);
  };

  const handleCopyJSON = async () => {
    // Strip OData metadata
    const clean = data.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of cols) {
        obj[col] = row[col];
      }
      return obj;
    });
    await copyToClipboard(JSON.stringify(clean, null, 2));
    setExportOpen(false);
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
        No results returned
      </div>
    );
  }

  const page = Math.floor(skip / top) + 1;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-d365-border shrink-0">
        <span className="text-[10px] text-gray-500">
          {data.length} row{data.length !== 1 ? 's' : ''}
          {skip > 0 && ` (page ${page})`}
        </span>
        <div className="flex-1" />

        {/* Pagination */}
        {(onPrevPage || onNextPage) && (
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevPage}
              disabled={!onPrevPage}
              className="text-[10px] text-d365-blue hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              ← Prev
            </button>
            <span className="text-[10px] text-gray-400">|</span>
            <button
              onClick={onNextPage}
              disabled={!onNextPage}
              className="text-[10px] text-d365-blue hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              Next →
            </button>
          </div>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="text-[10px] text-d365-blue hover:underline"
          >
            Export ▾
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-d365-border rounded shadow-lg z-50 min-w-32">
              <button
                onClick={handleExportCSV}
                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Download CSV
              </button>
              <button
                onClick={handleCopyTSV}
                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Copy for Excel
              </button>
              <button
                onClick={handleCopyJSON}
                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 border-t border-d365-border"
              >
                Copy JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              {cols.map((col) => (
                <th
                  key={col}
                  className="text-left px-2 py-1.5 border-b-2 border-d365-border font-medium text-gray-600 cursor-pointer hover:text-d365-blue whitespace-nowrap select-none"
                  onClick={() => handleSort(col)}
                >
                  {col}
                  {sortCol === col && (
                    <span className="ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 border-b border-d365-border/50">
                {cols.map((col) => (
                  <td
                    key={col}
                    className="px-2 py-1 whitespace-nowrap max-w-48 truncate text-gray-700"
                    title={row[col] != null ? String(row[col]) : ''}
                  >
                    {row[col] != null ? String(row[col]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { ODataFilter, FilterOperator } from '@/utils/odata/query-builder';
import { FILTER_OPERATORS } from '@/utils/odata/query-builder';

interface FilterRowProps {
  filter: ODataFilter;
  fields: string[];
  onChange: (filter: ODataFilter) => void;
  onRemove: () => void;
}

export function FilterRow({ filter, fields, onChange, onRemove }: FilterRowProps) {
  return (
    <div className="flex items-center gap-1">
      <select
        value={filter.field}
        onChange={(e) => onChange({ ...filter, field: e.target.value })}
        className="flex-1 text-xs border border-d365-border rounded px-1.5 py-1 bg-white min-w-0"
      >
        <option value="">Field...</option>
        {fields.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        value={filter.operator}
        onChange={(e) =>
          onChange({ ...filter, operator: e.target.value as FilterOperator })
        }
        className="text-xs border border-d365-border rounded px-1 py-1 bg-white w-20 shrink-0"
      >
        {FILTER_OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={filter.value}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
        placeholder="Value"
        className="flex-1 text-xs border border-d365-border rounded px-1.5 py-1 min-w-0"
      />

      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 text-sm shrink-0 px-1"
        title="Remove filter"
      >
        ×
      </button>
    </div>
  );
}

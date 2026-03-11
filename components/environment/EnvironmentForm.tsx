import { useState } from 'react';
import { ENVIRONMENT_COLORS } from '@/utils/types';
import type { Environment } from '@/utils/types';

interface EnvironmentFormProps {
  initial?: Environment;
  onSave: (data: Omit<Environment, 'id' | 'sortOrder'>) => void;
  onCancel: () => void;
}

export function EnvironmentForm({ initial, onSave, onCancel }: EnvironmentFormProps) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [defaultCompany, setDefaultCompany] = useState(initial?.defaultCompany ?? 'USMF');
  const [color, setColor] = useState(initial?.color ?? ENVIRONMENT_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    onSave({ label: label.trim(), url: url.trim(), defaultCompany: defaultCompany.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Dev, UAT, Prod"
          className="w-full text-sm border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30 focus:border-d365-blue"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Environment URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://myorg.operations.dynamics.com"
          className="w-full text-sm border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30 focus:border-d365-blue"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Default Company
        </label>
        <input
          type="text"
          value={defaultCompany}
          onChange={(e) => setDefaultCompany(e.target.value)}
          placeholder="USMF"
          className="w-full text-sm border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30 focus:border-d365-blue"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
        <div className="flex gap-2 flex-wrap">
          {ENVIRONMENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                color === c.value ? 'border-gray-800 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 text-sm bg-d365-blue text-white rounded px-3 py-1.5 hover:bg-d365-blue/90 transition-colors"
        >
          {initial ? 'Update' : 'Add Environment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-d365-gray hover:text-gray-800 px-3 py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

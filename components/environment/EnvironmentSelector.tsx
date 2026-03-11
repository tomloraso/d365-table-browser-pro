import type { Environment } from '@/utils/types';

interface EnvironmentSelectorProps {
  environments: Environment[];
  activeEnvironment: Environment | null;
  onSelect: (id: string) => void;
  onManage: () => void;
}

export function EnvironmentSelector({
  environments,
  activeEnvironment,
  onSelect,
  onManage,
}: EnvironmentSelectorProps) {
  if (environments.length === 0) {
    return (
      <div className="p-3 text-center">
        <p className="text-sm text-gray-500 mb-2">No environments configured</p>
        <button
          onClick={onManage}
          className="text-sm text-d365-blue hover:underline font-medium"
        >
          + Add Environment
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-d365-border bg-d365-light">
      <div className="flex-1 min-w-0">
        <select
          value={activeEnvironment?.id ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full text-sm bg-white border border-d365-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-d365-blue/30 focus:border-d365-blue"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.label}
            </option>
          ))}
        </select>
      </div>
      {activeEnvironment && (
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: activeEnvironment.color }}
          title={activeEnvironment.label}
        />
      )}
      <button
        onClick={onManage}
        className="text-xs text-d365-gray hover:text-d365-blue shrink-0"
        title="Manage Environments"
      >
        ⚙
      </button>
    </div>
  );
}

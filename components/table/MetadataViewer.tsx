import { useState, useMemo } from 'react';
import type { EntityDefinition, EnumDefinition } from '@/utils/odata/types';

interface MetadataViewerProps {
  entity: EntityDefinition;
  enumTypes: EnumDefinition[];
  onNavigate?: (entitySetName: string) => void;
  onClose: () => void;
}

type Tab = 'fields' | 'relations' | 'enums';

export function MetadataViewer({
  entity,
  enumTypes,
  onNavigate,
  onClose,
}: MetadataViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('fields');
  const [fieldFilter, setFieldFilter] = useState('');

  const filteredProperties = useMemo(() => {
    if (!fieldFilter.trim()) return entity.properties;
    const q = fieldFilter.toLowerCase();
    return entity.properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.label && p.label.toLowerCase().includes(q))
    );
  }, [entity.properties, fieldFilter]);

  // Find enum fields and their definitions
  const entityEnums = useMemo(() => {
    const result: { field: string; enumDef: EnumDefinition }[] = [];
    for (const prop of entity.properties) {
      if (prop.enumTypeName) {
        const enumDef = enumTypes.find(
          (e) =>
            e.name === prop.enumTypeName ||
            e.name.endsWith('.' + prop.enumTypeName)
        );
        if (enumDef) {
          result.push({ field: prop.name, enumDef });
        }
      }
    }
    return result;
  }, [entity.properties, enumTypes]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-d365-border bg-d365-light shrink-0">
        <button
          onClick={onClose}
          className="text-sm text-d365-gray hover:text-d365-dark"
          title="Back"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-d365-dark truncate">
            {entity.entitySetName}
          </h2>
          <div className="flex items-center gap-2">
            {entity.tableName && (
              <span className="text-[10px] text-d365-gray">
                Table: {entity.tableName}
              </span>
            )}
            {entity.label && (
              <span className="text-[10px] text-gray-400 truncate">
                {entity.label}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-gray-400 shrink-0">
          {entity.properties.length} fields
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-d365-border shrink-0">
        {(
          [
            ['fields', `Fields (${entity.properties.length})`],
            ['relations', `Relations (${entity.navigationProperties.length})`],
            ['enums', `Enums (${entityEnums.length})`],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-d365-blue border-b-2 border-d365-blue'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'fields' && (
          <div>
            {/* Field search */}
            <div className="px-3 py-2 border-b border-d365-border bg-gray-50">
              <input
                type="text"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                placeholder="Filter fields..."
                className="w-full text-xs border border-d365-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-d365-blue/30"
              />
            </div>

            {/* Key fields indicator */}
            {entity.keyFields.length > 0 && (
              <div className="px-3 py-1.5 bg-yellow-50 border-b border-yellow-100 text-[10px] text-yellow-700">
                Key: {entity.keyFields.join(', ')}
              </div>
            )}

            {/* Field list */}
            <div className="divide-y divide-gray-100">
              {filteredProperties.map((prop) => {
                const isKey = entity.keyFields.includes(prop.name);
                return (
                  <div
                    key={prop.name}
                    className="px-3 py-1.5 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono ${
                          isKey ? 'font-semibold text-yellow-700' : 'text-gray-800'
                        }`}
                      >
                        {prop.name}
                      </span>
                      {isKey && (
                        <span className="text-[9px] bg-yellow-100 text-yellow-700 rounded px-1">
                          KEY
                        </span>
                      )}
                      {!prop.nullable && !isKey && (
                        <span className="text-[9px] bg-red-50 text-red-400 rounded px-1">
                          REQ
                        </span>
                      )}
                      {prop.enumTypeName && (
                        <span className="text-[9px] bg-purple-50 text-purple-500 rounded px-1">
                          ENUM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-d365-blue font-mono">
                        {prop.type}
                      </span>
                      {prop.maxLength && (
                        <span className="text-[10px] text-gray-400">
                          max:{prop.maxLength}
                        </span>
                      )}
                      {prop.label && (
                        <span className="text-[10px] text-gray-400 truncate">
                          {prop.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredProperties.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">
                  No fields match "{fieldFilter}"
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'relations' && (
          <div>
            {entity.navigationProperties.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No navigation properties defined
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {entity.navigationProperties.map((nav) => {
                  // Extract short name from full type name
                  const shortType = nav.targetEntityType.includes('.')
                    ? nav.targetEntityType.split('.').pop()!
                    : nav.targetEntityType;

                  return (
                    <div
                      key={nav.name}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-800">
                          {nav.name}
                        </span>
                        <span className="text-[9px] bg-blue-50 text-blue-500 rounded px-1">
                          {nav.isCollection ? 'Collection' : 'Single'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-gray-400">→</span>
                        {onNavigate ? (
                          <button
                            onClick={() => onNavigate(shortType)}
                            className="text-[10px] text-d365-blue hover:underline font-mono"
                          >
                            {shortType}
                          </button>
                        ) : (
                          <span className="text-[10px] text-d365-blue font-mono">
                            {shortType}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'enums' && (
          <div>
            {entityEnums.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No enum fields found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {entityEnums.map(({ field, enumDef }) => (
                  <div key={field} className="px-3 py-2">
                    <div className="text-xs font-mono font-medium text-gray-800 mb-1">
                      {field}
                      <span className="text-[10px] font-normal text-purple-500 ml-1">
                        {enumDef.name.split('.').pop()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      {enumDef.members.map((member) => (
                        <div
                          key={member.name}
                          className="flex items-center gap-1 text-[10px]"
                        >
                          <span className="text-gray-400 font-mono w-5 text-right shrink-0">
                            {member.value}
                          </span>
                          <span className="text-gray-600 truncate">
                            {member.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

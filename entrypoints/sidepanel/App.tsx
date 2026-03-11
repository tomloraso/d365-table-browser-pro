import { useState } from 'react';
import { useEnvironments } from '@/hooks/useEnvironments';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import { useMetadata } from '@/hooks/useMetadata';
import { EnvironmentSelector } from '@/components/environment/EnvironmentSelector';
import { EnvironmentForm } from '@/components/environment/EnvironmentForm';
import { TableOpener } from '@/components/table/TableOpener';
import { FavoritesList } from '@/components/table/FavoritesList';
import { HistoryList } from '@/components/table/HistoryList';
import { MetadataStatus } from '@/components/table/MetadataStatus';
import { MetadataViewer } from '@/components/table/MetadataViewer';
import { EntityBrowser } from '@/components/table/EntityBrowser';
import { QueryBuilder } from '@/components/query/QueryBuilder';
import type { Environment } from '@/utils/types';

type View = 'main' | 'add-env' | 'metadata';

function App() {
  const {
    environments,
    activeEnvironment,
    loading,
    addEnvironment,
    setActiveEnvironment,
  } = useEnvironments();
  const { favorites, removeFavorite, isFavorite, toggleFavorite } = useFavorites();
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();
  const {
    metadata,
    loading: metadataLoading,
    error: metadataError,
    fetchMetadata,
    getEntity,
    lastFetched,
  } = useMetadata(
    activeEnvironment?.id ?? null,
    activeEnvironment?.url ?? null
  );

  const [view, setView] = useState<View>('main');
  const [activeTab, setActiveTab] = useState<'browse' | 'query' | 'entities' | 'favorites' | 'history'>(
    'browse'
  );
  const [selectedEntitySetName, setSelectedEntitySetName] = useState<string | null>(null);

  const handleManageEnvironments = () => {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    }
  };

  const handleAddEnvironment = async (data: Omit<Environment, 'id' | 'sortOrder'>) => {
    await addEnvironment(data);
    setView('main');
  };

  const handleTableOpen = (tableName: string, company: string) => {
    addToHistory(tableName, company);
  };

  const handleViewMetadata = (entitySetName: string) => {
    setSelectedEntitySetName(entitySetName);
    setView('metadata');
  };

  const handleNavigateEntity = (entityTypeName: string) => {
    if (!metadata) return;
    const entity = metadata.entities.find(
      (e) =>
        e.entityTypeName === entityTypeName ||
        e.entitySetName === entityTypeName
    );
    if (entity) {
      setSelectedEntitySetName(entity.entitySetName);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (view === 'add-env' || environments.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <div className="px-3 py-2 border-b border-d365-border bg-d365-light">
          <h1 className="text-sm font-semibold text-d365-dark">
            {environments.length === 0 ? 'Welcome! Add your first environment' : 'Add Environment'}
          </h1>
        </div>
        <EnvironmentForm
          onSave={handleAddEnvironment}
          onCancel={() => setView('main')}
        />
      </div>
    );
  }

  // Full-height metadata viewer in side panel
  if (view === 'metadata' && selectedEntitySetName && metadata) {
    const entity = getEntity(selectedEntitySetName);
    if (entity) {
      return (
        <div className="h-screen flex flex-col">
          <MetadataViewer
            entity={entity}
            enumTypes={metadata.enumTypes}
            onNavigate={handleNavigateEntity}
            onClose={() => setView('main')}
          />
        </div>
      );
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-d365-border bg-d365-light shrink-0">
        <span className="text-sm font-semibold text-d365-dark shrink-0">D365 F&O Table & OData Browser Pro</span>
        <div className="flex-1" />
        <button
          onClick={() => setView('add-env')}
          className="text-xs text-d365-blue hover:underline shrink-0"
        >
          + Add
        </button>
      </div>

      <EnvironmentSelector
        environments={environments}
        activeEnvironment={activeEnvironment}
        onSelect={setActiveEnvironment}
        onManage={handleManageEnvironments}
      />

      {/* Tabs */}
      <div className="flex border-b border-d365-border shrink-0">
        {(['browse', 'query', 'entities', 'favorites', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-d365-blue border-b-2 border-d365-blue'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'browse' && 'Browse'}
            {tab === 'query' && 'Query'}
            {tab === 'entities' &&
              `Entities${metadata ? ` (${metadata.entities.length})` : ''}`}
            {tab === 'favorites' && `Fav (${favorites.length})`}
            {tab === 'history' && 'History'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'browse' && activeEnvironment && (
          <div className="overflow-y-auto">
            <TableOpener
              environment={activeEnvironment}
              onOpen={handleTableOpen}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}

        {activeTab === 'query' && activeEnvironment && (
          <QueryBuilder
            environment={activeEnvironment}
            entities={metadata?.entities ?? []}
          />
        )}

        {activeTab === 'entities' && activeEnvironment && (
          <div className="overflow-y-auto">
            <EntityBrowser
              entities={metadata?.entities ?? []}
              onSelect={handleViewMetadata}
              hasMetadata={!!metadata}
              loading={metadataLoading}
              error={metadataError}
              onLoadMetadata={() => fetchMetadata()}
            />
          </div>
        )}

        {activeTab === 'favorites' && activeEnvironment && (
          <div className="overflow-y-auto">
            <FavoritesList
              favorites={favorites}
              environment={activeEnvironment}
              onRemove={removeFavorite}
              onOpen={handleTableOpen}
            />
          </div>
        )}

        {activeTab === 'history' && activeEnvironment && (
          <div className="overflow-y-auto">
            <HistoryList
              history={history}
              environment={activeEnvironment}
              onOpen={handleTableOpen}
              onRemove={removeFromHistory}
              onClear={clearHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

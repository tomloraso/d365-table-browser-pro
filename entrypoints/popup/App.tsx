import { useState } from 'react';
import { useEnvironments } from '@/hooks/useEnvironments';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import { EnvironmentSelector } from '@/components/environment/EnvironmentSelector';
import { EnvironmentForm } from '@/components/environment/EnvironmentForm';
import { TableOpener } from '@/components/table/TableOpener';
import { FavoritesList } from '@/components/table/FavoritesList';
import { HistoryList } from '@/components/table/HistoryList';
import type { Environment } from '@/utils/types';

type View = 'main' | 'add-env';

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

  const [view, setView] = useState<View>('main');
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites' | 'history'>('browse');

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

  if (loading) {
    return (
      <div className="w-[400px] h-[300px] flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (view === 'add-env' || environments.length === 0) {
    return (
      <div className="w-[400px]">
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

  return (
    <div className="w-[400px]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-d365-border bg-d365-light">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-d365-dark">D365 F&O Table & OData Browser Pro</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={async () => {
              try {
                const win = await chrome.windows.getCurrent();
                await (chrome as any).sidePanel.open({ windowId: win.id });
                window.close();
              } catch {
                alert('To open the side panel:\nClick the side panel icon in the top-right of your browser toolbar, then select "D365 F&O Table & OData Browser Pro".');
              }
            }}
            className="text-xs text-d365-blue hover:underline"
            title="Open side panel for Query Builder & Entities"
          >
            Build OData Query
          </button>
          <button
            onClick={() => setView('add-env')}
            className="text-xs text-d365-blue hover:underline"
            title="Add environment"
          >
            + Add Environment
          </button>
        </div>
      </div>

      <EnvironmentSelector
        environments={environments}
        activeEnvironment={activeEnvironment}
        onSelect={setActiveEnvironment}
        onManage={handleManageEnvironments}
      />

      {/* Tabs */}
      <div className="flex border-b border-d365-border">
        {(['browse', 'favorites', 'history'] as const).map((tab) => (
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
            {tab === 'favorites' && `Favorites (${favorites.length})`}
            {tab === 'history' && 'History'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'browse' && activeEnvironment && (
        <TableOpener
          environment={activeEnvironment}
          onOpen={handleTableOpen}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {activeTab === 'favorites' && activeEnvironment && (
        <FavoritesList
          favorites={favorites}
          environment={activeEnvironment}
          onRemove={removeFavorite}
          onOpen={handleTableOpen}
        />
      )}

      {activeTab === 'history' && activeEnvironment && (
        <HistoryList
          history={history}
          environment={activeEnvironment}
          onOpen={handleTableOpen}
          onRemove={removeFromHistory}
          onClear={clearHistory}
        />
      )}

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-d365-border text-center">
        <span className="text-[10px] text-gray-400">
          Created by{' '}
          <a
            href="https://www.linkedin.com/in/tomloraso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-d365-blue hover:underline"
          >
            Tom Loraso
          </a>
        </span>
      </div>
    </div>
  );
}

export default App;

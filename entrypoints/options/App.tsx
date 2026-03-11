import { useState } from 'react';
import { useEnvironments } from '@/hooks/useEnvironments';
import { EnvironmentForm } from '@/components/environment/EnvironmentForm';
import { ENVIRONMENT_COLORS } from '@/utils/types';
import type { Environment } from '@/utils/types';

function App() {
  const {
    environments,
    activeEnvironment,
    loading,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    setActiveEnvironment,
  } = useEnvironments();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = async (data: Omit<Environment, 'id' | 'sortOrder'>) => {
    await addEnvironment(data);
    setShowAddForm(false);
  };

  const handleUpdate = async (data: Omit<Environment, 'id' | 'sortOrder'>) => {
    if (!editingId) return;
    await updateEnvironment(editingId, data);
    setEditingId(null);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await removeEnvironment(id);
    setConfirmDeleteId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const editingEnv = environments.find((e) => e.id === editingId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-d365-dark mb-1">D365 F&O Table & OData Browser Pro</h1>
        <p className="text-sm text-d365-gray mb-6">
          Manage your D365 Finance & Operations environments
        </p>

        {/* Environment list */}
        <div className="bg-white rounded-lg border border-d365-border shadow-sm mb-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-d365-border">
            <h2 className="text-sm font-semibold text-d365-dark">Environments</h2>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
              }}
              className="text-sm text-d365-blue hover:underline font-medium"
            >
              + Add Environment
            </button>
          </div>

          {environments.length === 0 && !showAddForm ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400 mb-3">No environments configured yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-sm bg-d365-blue text-white rounded px-4 py-2 hover:bg-d365-blue/90"
              >
                Add Your First Environment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-d365-border">
              {environments.map((env) => (
                <div key={env.id}>
                  {editingId === env.id ? (
                    <EnvironmentForm
                      initial={editingEnv}
                      onSave={handleUpdate}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 group">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: env.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-d365-dark">
                            {env.label}
                          </span>
                          {activeEnvironment?.id === env.id && (
                            <span className="text-xs bg-d365-blue/10 text-d365-blue rounded px-1.5 py-0.5">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-d365-gray truncate">{env.url}</p>
                        <p className="text-xs text-gray-400">
                          Company: {env.defaultCompany}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {activeEnvironment?.id !== env.id && (
                          <button
                            onClick={() => setActiveEnvironment(env.id)}
                            className="text-xs text-d365-blue hover:underline px-2 py-1"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(env.id);
                            setShowAddForm(false);
                            setConfirmDeleteId(null);
                          }}
                          className="text-xs text-d365-gray hover:text-d365-dark px-2 py-1"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === env.id ? (
                          <>
                            <span className="text-xs text-red-600 px-1">Remove?</span>
                            <button
                              onClick={() => handleDelete(env.id)}
                              className="text-xs text-red-600 font-medium hover:underline px-1"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-d365-gray hover:text-d365-dark px-1"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(env.id)}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {showAddForm && (
            <div className="border-t border-d365-border">
              <EnvironmentForm
                onSave={handleAdd}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white rounded-lg border border-d365-border shadow-sm p-4">
          <h2 className="text-sm font-semibold text-d365-dark mb-2">About</h2>
          <p className="text-xs text-d365-gray leading-relaxed">
            D365 F&O Table & OData Browser Pro is a read-only tool for exploring Dynamics 365
            Finance & Operations tables, metadata, and data. It uses your existing
            browser session to authenticate — no credentials are stored.
          </p>
          <p className="text-xs text-gray-400 mt-2">Version 1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">
            Created by{' '}
            <a
              href="https://www.linkedin.com/in/tomloraso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-d365-blue hover:underline"
            >
              Tom Loraso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

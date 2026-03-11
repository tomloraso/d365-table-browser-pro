import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { environmentsStorage, activeEnvironmentIdStorage } from '@/utils/storage';
import { normalizeEnvironmentUrl } from '@/utils/d365/urls';
import type { Environment } from '@/utils/types';

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [envs, activeId] = await Promise.all([
        environmentsStorage.getValue(),
        activeEnvironmentIdStorage.getValue(),
      ]);
      setEnvironments(envs);
      setActiveEnvironmentId(activeId);
      setLoading(false);
    };
    load();

    const unwatchEnvs = environmentsStorage.watch((newVal) => {
      setEnvironments(newVal ?? []);
    });
    const unwatchActive = activeEnvironmentIdStorage.watch((newVal) => {
      setActiveEnvironmentId(newVal ?? null);
    });

    return () => {
      unwatchEnvs();
      unwatchActive();
    };
  }, []);

  const activeEnvironment = environments.find((e) => e.id === activeEnvironmentId) ?? null;

  const addEnvironment = useCallback(
    async (env: Omit<Environment, 'id' | 'sortOrder'>) => {
      const newEnv: Environment = {
        ...env,
        url: normalizeEnvironmentUrl(env.url),
        id: uuidv4(),
        sortOrder: environments.length,
      };
      const updated = [...environments, newEnv];
      await environmentsStorage.setValue(updated);
      if (!activeEnvironmentId) {
        await activeEnvironmentIdStorage.setValue(newEnv.id);
      }
      return newEnv;
    },
    [environments, activeEnvironmentId]
  );

  const updateEnvironment = useCallback(
    async (id: string, changes: Partial<Omit<Environment, 'id'>>) => {
      const updated = environments.map((e) =>
        e.id === id
          ? {
              ...e,
              ...changes,
              url: changes.url ? normalizeEnvironmentUrl(changes.url) : e.url,
            }
          : e
      );
      await environmentsStorage.setValue(updated);
    },
    [environments]
  );

  const removeEnvironment = useCallback(
    async (id: string) => {
      const updated = environments.filter((e) => e.id !== id);
      await environmentsStorage.setValue(updated);
      if (activeEnvironmentId === id) {
        await activeEnvironmentIdStorage.setValue(updated[0]?.id ?? null);
      }
    },
    [environments, activeEnvironmentId]
  );

  const setActiveEnvironment = useCallback(async (id: string) => {
    await activeEnvironmentIdStorage.setValue(id);
  }, []);

  return {
    environments,
    activeEnvironment,
    activeEnvironmentId,
    loading,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    setActiveEnvironment,
  };
}

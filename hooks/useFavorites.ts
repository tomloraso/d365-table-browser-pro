import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { favoritesStorage } from '@/utils/storage';
import type { FavoriteEntry } from '@/utils/types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    favoritesStorage.getValue().then(setFavorites);
    const unwatch = favoritesStorage.watch((val) => setFavorites(val ?? []));
    return unwatch;
  }, []);

  const addFavorite = useCallback(
    async (tableName: string) => {
      const exists = favorites.some(
        (f) => f.tableName.toLowerCase() === tableName.toLowerCase()
      );
      if (exists) return;
      const entry: FavoriteEntry = {
        id: uuidv4(),
        tableName,
      };
      await favoritesStorage.setValue([...favorites, entry]);
    },
    [favorites]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      await favoritesStorage.setValue(favorites.filter((f) => f.id !== id));
    },
    [favorites]
  );

  const isFavorite = useCallback(
    (tableName: string) => {
      return favorites.some(
        (f) => f.tableName.toLowerCase() === tableName.toLowerCase()
      );
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (tableName: string) => {
      const existing = favorites.find(
        (f) => f.tableName.toLowerCase() === tableName.toLowerCase()
      );
      if (existing) {
        await removeFavorite(existing.id);
      } else {
        await addFavorite(tableName);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}

import type { FavoriteEntry, Environment } from '@/utils/types';
import { buildTableBrowserUrl } from '@/utils/d365/urls';

interface FavoritesListProps {
  favorites: FavoriteEntry[];
  environment: Environment;
  onRemove: (id: string) => void;
  onOpen: (tableName: string, company: string) => void;
}

export function FavoritesList({ favorites, environment, onRemove, onOpen }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-xs text-gray-400">
        No favorites yet. Star a table to add it here.
      </div>
    );
  }

  const handleOpen = (tableName: string) => {
    const url = buildTableBrowserUrl(environment.url, tableName, environment.defaultCompany);
    window.open(url, '_blank');
    onOpen(tableName, environment.defaultCompany);
  };

  return (
    <div className="divide-y divide-d365-border">
      {favorites.map((fav) => (
        <div
          key={fav.id}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 group"
        >
          <button
            onClick={() => handleOpen(fav.tableName)}
            className="flex-1 text-left text-sm text-d365-blue hover:underline truncate"
            title={`Open ${fav.tableName}`}
          >
            {fav.tableName}
          </button>
          <button
            onClick={() => onRemove(fav.id)}
            className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove from favorites"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

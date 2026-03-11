import { D365_TABLES } from './table-names';

export interface TableEntry {
  name: string;
  description: string;
}

/** Pre-built lowercase index for fast search */
let _searchIndex: { name: string; nameLower: string; desc: string; descLower: string }[] | null = null;

function getSearchIndex() {
  if (!_searchIndex) {
    _searchIndex = D365_TABLES.map(([name, desc]) => ({
      name,
      nameLower: name.toLowerCase(),
      desc,
      descLower: desc.toLowerCase(),
    }));
  }
  return _searchIndex;
}

/**
 * Search D365 tables by name or description using case-insensitive contains.
 * Returns up to `limit` results.
 */
export function searchTables(query: string, limit = 50): TableEntry[] {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase();
  const index = getSearchIndex();
  const results: TableEntry[] = [];

  for (const entry of index) {
    if (entry.nameLower.includes(lowerQuery) || entry.descLower.includes(lowerQuery)) {
      results.push({ name: entry.name, description: entry.desc });
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Check if a table name exists in the static list.
 */
export function isKnownTable(name: string): boolean {
  const lower = name.toLowerCase();
  return getSearchIndex().some((e) => e.nameLower === lower);
}

/** Total number of built-in tables */
export const BUILTIN_TABLE_COUNT = D365_TABLES.length;

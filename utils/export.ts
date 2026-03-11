/**
 * Export utilities for query results.
 */

/**
 * Convert array of objects to CSV string.
 */
export function toCSV(data: Record<string, unknown>[], columns?: string[]): string {
  if (data.length === 0) return '';

  const cols = columns ?? Object.keys(data[0]);

  const escapeCell = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = cols.map(escapeCell).join(',');
  const rows = data.map((row) =>
    cols.map((col) => escapeCell(row[col])).join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Download a string as a file.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

/**
 * Convert data to tab-separated values (for pasting into Excel).
 */
export function toTSV(data: Record<string, unknown>[], columns?: string[]): string {
  if (data.length === 0) return '';

  const cols = columns ?? Object.keys(data[0]);

  const escapeCell = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    return str.replace(/\t/g, ' ').replace(/\n/g, ' ');
  };

  const header = cols.map(escapeCell).join('\t');
  const rows = data.map((row) =>
    cols.map((col) => escapeCell(row[col])).join('\t')
  );

  return [header, ...rows].join('\n');
}

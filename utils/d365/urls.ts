/**
 * Build the D365 Table Browser URL
 */
export function buildTableBrowserUrl(
  environmentUrl: string,
  tableName: string,
  company: string
): string {
  const base = environmentUrl.replace(/\/+$/, '');
  const params = new URLSearchParams({
    mi: 'SysTableBrowser',
    tableName: tableName,
    cmp: company,
  });
  return `${base}/?${params.toString()}`;
}

/**
 * Build the OData metadata URL
 */
export function buildMetadataUrl(environmentUrl: string): string {
  const base = environmentUrl.replace(/\/+$/, '');
  return `${base}/data/$metadata`;
}

/**
 * Build an OData query URL
 */
export function buildODataUrl(
  environmentUrl: string,
  entityName: string,
  options?: {
    select?: string[];
    filter?: string;
    top?: number;
    skip?: number;
    orderBy?: string;
    crossCompany?: boolean;
    count?: boolean;
  }
): string {
  const base = environmentUrl.replace(/\/+$/, '');
  const params = new URLSearchParams();

  if (options?.select?.length) {
    params.set('$select', options.select.join(','));
  }
  if (options?.filter) {
    params.set('$filter', options.filter);
  }
  if (options?.top) {
    params.set('$top', String(options.top));
  }
  if (options?.skip) {
    params.set('$skip', String(options.skip));
  }
  if (options?.orderBy) {
    params.set('$orderby', options.orderBy);
  }
  if (options?.crossCompany) {
    params.set('cross-company', 'true');
  }
  if (options?.count) {
    params.set('$count', 'true');
  }

  const queryString = params.toString();
  return `${base}/data/${entityName}${queryString ? '?' + queryString : ''}`;
}

/**
 * Normalize a D365 environment URL (strip trailing slashes, ensure https)
 */
export function normalizeEnvironmentUrl(url: string): string {
  let normalized = url.trim().replace(/\/+$/, '');
  if (normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }
  if (!normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

/**
 * Validate a D365 environment URL
 */
export function isValidEnvironmentUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeEnvironmentUrl(url));
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname.endsWith('.dynamics.com') ||
        parsed.hostname.endsWith('.operations.dynamics.com') ||
        parsed.hostname.endsWith('.cloudax.dynamics.com'))
    );
  } catch {
    return false;
  }
}

/**
 * Build OData query URLs from structured query definitions.
 */

export interface ODataFilter {
  field: string;
  operator: FilterOperator;
  value: string;
}

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  | 'contains'
  | 'startswith'
  | 'endswith';

export const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'eq', label: '=' },
  { value: 'ne', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'ge', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'le', label: '<=' },
  { value: 'contains', label: 'contains' },
  { value: 'startswith', label: 'starts with' },
  { value: 'endswith', label: 'ends with' },
];

export interface ODataQueryOptions {
  entitySetName: string;
  select: string[];
  filters: ODataFilter[];
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  top: number;
  skip: number;
  crossCompany: boolean;
}

/**
 * Format a single filter expression.
 */
function formatFilter(f: ODataFilter, fieldType?: string): string {
  const isNumeric =
    fieldType === 'Int32' ||
    fieldType === 'Int64' ||
    fieldType === 'Decimal' ||
    fieldType === 'Double' ||
    fieldType === 'Single';
  const isBool = fieldType === 'Boolean';

  let val: string;
  if (isNumeric) {
    val = f.value;
  } else if (isBool) {
    val = f.value.toLowerCase() === 'true' ? 'true' : 'false';
  } else {
    val = `'${f.value.replace(/'/g, "''")}'`;
  }

  switch (f.operator) {
    case 'contains':
      return `contains(${f.field},${val})`;
    case 'startswith':
      return `startswith(${f.field},${val})`;
    case 'endswith':
      return `endswith(${f.field},${val})`;
    default:
      return `${f.field} ${f.operator} ${val}`;
  }
}

/**
 * Build an OData query URL from structured options.
 */
export function buildODataQueryUrl(
  baseUrl: string,
  options: ODataQueryOptions,
  fieldTypes?: Map<string, string>
): string {
  const params: string[] = [];

  if (options.select.length > 0) {
    params.push(`$select=${options.select.join(',')}`);
  }

  if (options.filters.length > 0) {
    const filterExprs = options.filters
      .filter((f) => f.field && f.value)
      .map((f) => formatFilter(f, fieldTypes?.get(f.field)));
    if (filterExprs.length > 0) {
      params.push(`$filter=${filterExprs.join(' and ')}`);
    }
  }

  if (options.orderBy) {
    params.push(`$orderby=${options.orderBy} ${options.orderDirection || 'asc'}`);
  }

  if (options.top > 0) {
    params.push(`$top=${options.top}`);
  }

  if (options.skip > 0) {
    params.push(`$skip=${options.skip}`);
  }

  if (options.crossCompany) {
    params.push('cross-company=true');
  }

  // Normalize base URL
  const base = baseUrl.replace(/\/+$/, '');
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';

  return `${base}/data/${options.entitySetName}${queryString}`;
}

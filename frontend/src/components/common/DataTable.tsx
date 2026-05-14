import { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  searchable?: boolean;
  exportFilename?: string;
}

function exportCSV<T>(columns: Column<T>[], data: T[], filename: string) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = (row as Record<string, unknown>)[c.key as string];
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataTable<T>({ columns, data, keyField, searchable = true, exportFilename }: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const PAGE_SIZE = 8;

  const filtered = data.filter(row =>
    !query || Object.values(row as Record<string, unknown>).some(v =>
      String(v).toLowerCase().includes(query.toLowerCase())
    )
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '');
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '');
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  const pages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: string) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
    setPage(0);
  }

  return (
    <div className="datatable-wrapper">
      <div className="datatable-toolbar">
        {searchable && (
          <input
            className="datatable-search"
            placeholder="Search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            aria-label="Search table"
          />
        )}
        {exportFilename && (
          <button
            className="export-btn"
            onClick={() => exportCSV(columns, sorted, exportFilename)}
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="datatable-scroll">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(String(col.key))}
                  className="datatable-th"
                  aria-sort={sortKey === String(col.key) ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                >
                  {col.label}
                  {sortKey === String(col.key) && (
                    <span aria-hidden="true">{sortAsc ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="datatable-empty">No records found.</td></tr>
            ) : (
              paged.map(row => (
                <tr key={String((row as Record<string, unknown>)[keyField as string])}>
                  {columns.map(col => (
                    <td key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="datatable-pagination">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
          <span>{page + 1} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}>Next</button>
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: unknown, record: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (record: T) => void;
}

export default function DataTable<T>({ columns, data, onRowClick }: DataTableProps<T>) {
  const getVal = (record: T, key: string): unknown => {
    return (record as Record<string, unknown>)[key];
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                暂无数据
              </td>
            </tr>
          ) : (
            data.map((record, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(record)}
                className={`border-b border-slate-100 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(getVal(record, col.key), record) : String(getVal(record, col.key) ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import type { PagedResult } from '../../types';
import Pagination from './Pagination';
import SearchInput from './SearchInput';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination?: PagedResult<T>;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  actionsLabel?: string;
  renderActions?: (row: T) => React.ReactNode;
  searchPlaceholder?: string;
}

export default function DataTable<T>({
  data,
  columns,
  pagination,
  onPageChange,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  actionsLabel = 'Acciones',
  renderActions,
  searchPlaceholder = 'Buscar...',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const hasActionsColumn = renderActions !== undefined;
  const allColumns = hasActionsColumn
    ? [
        ...columns,
        {
          id: 'actions',
          header: actionsLabel,
          cell: ({ row }: { row: any }) => renderActions(row.original),
        } as ColumnDef<T, any>,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md">
          <SearchInput
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ),
                        desc: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ),
                      }[header.column.getIsSorted() as string] ?? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {globalFilter ? `No se encontraron resultados para "${globalFilter}"` : emptyMessage}
                </td>
              </tr>
            ) : (
              table.getFilteredRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {globalFilter ? (
              <>Mostrando {filteredRowCount} de {data.length} resultados{filteredRowCount !== data.length && ` (filtrado)`}</>
            ) : (
              pagination ? `Mostrando ${data.length} de ${pagination.totalCount} resultados` : `${data.length} resultados`
            )}
          </p>
          {pagination && onPageChange && (
            <Pagination result={pagination} onPageChange={onPageChange} />
          )}
        </div>
      </div>
    </div>
  );
}
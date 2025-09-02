'use client';

import {
  ColumnDef as TanStackColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RowData,TableColumn } from '@/lib/file-handling/types';
import { cn } from '@/lib/utils';

type VirtualizedTableProps = {
  data: RowData[];
  columns: TableColumn[];
};

export default function VirtualizedTable({ data, columns }: VirtualizedTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Transform the columns to TanStack Table format - add resizing capabilities
  const tableColumns: TanStackColumnDef<RowData>[] = columns.map((column, index) => {
    // Generate a unique ID for empty accessors
    const accessorKey =
      column.accessor === '' || column.accessor === ' ' ? `empty-column-${index}` : column.accessor;

    return {
      id: accessorKey, // Ensure there's a unique ID
      accessorKey: accessorKey,
      accessorFn: (row) => row[column.accessor], // This ensures we can still access the data
      header: column.header.trim() || `Column ${index + 1}`, // Use a fallback header name if empty
      cell: ({ row }) => {
        const value = row.original[column.accessor];
        return value !== undefined ? value : null;
      },
      size: columnSizing[accessorKey] || 150, // Default column width
      enableResizing: true,
    };
  });

  // Set up the table - with resizing
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    onColumnSizingChange: (updater) => {
      setColumnSizing((old) => {
        if (typeof updater === 'function') {
          return updater(old);
        }
        return updater;
      });
    },
    state: {
      columnSizing,
    },
  });

  // Set up the virtualizer
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // Estimate row height
    overscan: 10, // Load extra rows for smoother scrolling
  });

  // Calculate total height for the virtualized content
  const totalHeight = rowVirtualizer.getTotalSize();
  // Get the virtualized rows
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalHeight - (virtualRows[virtualRows.length - 1].end || 0) : 0;

  // Get column count for padding rows
  const columnCount = columns.length;

  return (
    <div className="flex flex-col">
      <style jsx global>{`
        .resizer {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 8px; /* Wider for easier grabbing */
          background: transparent;
          cursor: col-resize;
          user-select: none;
          touch-action: none;
          z-index: 1;
        }

        .resizer.isResizing {
          background: var(--primary);
          opacity: 1;
        }

        .resizer:hover {
          background: var(--primary);
          opacity: 0.5;
        }

        th,
        td {
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
      <div
        ref={tableContainerRef}
        className="h-[calc(100vh-225px)]"
        style={{
          overflow: 'auto',
          border: '1px solid var(--border)',
          borderRadius: '0.375rem',
        }}
      >
        <Table className="relative w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${header.getSize()}px`,
                    }}
                    className="relative select-none"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {/* Resizer handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn('resizer', header.column.getIsResizing() ? 'isResizing' : '')}
                        title="Resize column"
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
              <tr>
                <td colSpan={columnCount} style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={virtualRow.index}
                  className={virtualRow.index % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td colSpan={columnCount} style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

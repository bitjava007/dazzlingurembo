import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Skeleton } from './skeleton';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor?: (row: T, index: number) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  keyExtractor,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-md border border-[#2A2A2A] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2A2A2A] hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className="text-gray-400 bg-[#111111]">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-4 w-full bg-[#2A2A2A]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-[#2A2A2A] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2A2A2A] hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className="text-gray-400 bg-[#111111]">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-[#2A2A2A] hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="text-center py-10 text-gray-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#2A2A2A] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2A2A2A] hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead key={i} className={`text-gray-400 bg-[#111111] ${col.className ?? ''}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow
              key={keyExtractor ? keyExtractor(row, rowIdx) : rowIdx}
              className="border-[#2A2A2A] hover:bg-[#1A1A1A] text-gray-300"
            >
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} className={col.className}>
                  {col.render
                    ? col.render(row)
                    : col.accessor
                      ? String(row[col.accessor] ?? '')
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { LoaderCircle, MoreHorizontal, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { DataTableColumnHeader } from "@/components/table/table-header-sortable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import type { ActionResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

// ============================================
// Selection Column Types
// ============================================

export interface SelectionColumnRenderProps<TData> {
  item: TData;
  index: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export interface SelectionColumnProps<TData> {
  renderHeader: (data?: TData[]) => ReactNode;
  renderCell: (item: TData) => ReactNode;
}

// ============================================
// Legacy Export - DataTable Component (Monolithic)
// ============================================

interface TableData<TData, TValue> {
  queryKey: string;
  queryAction: () => Promise<ActionResponse<TData[]>>;
  columns: ColumnDef<TData, TValue>[];
  filterBy: string;
  editFNAction?: (id: string) => void;
  deleteFNAction?: (ids: string[]) => Promise<ActionResponse<TData>>;
}

/**
 * @deprecated Use compositional DataTable with DataTableHeader, DataTableContent, DataTableFooter instead
 */
export function DataTable<TData, TValue>({
  queryKey,
  queryAction,
  columns,
  filterBy,
  deleteFNAction,
}: TableData<TData, TValue>) {
  const { data, isFetching } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => queryAction(),
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: data?.data || [],
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className={"flex justify-between"}>
        {/* START Filter Section */}
        <div className="flex items-center py-4">
          <Input
            placeholder={`Search by ${filterBy}....`}
            value={
              (table.getColumn(filterBy)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterBy)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        {/* END Filter Section */}

        {/* START Column & Delete many Section */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {deleteFNAction && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={
                    !table.getRowModel().rows.some((row) => row.getIsSelected())
                  }
                >
                  Delete
                  <Trash />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
                <DialogFooter className={"flex-row! items-center gap-2"}>
                  <DialogClose asChild>
                    <Button type="button" className={"w-1/2"}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const selected = table
                        .getRowModel()
                        .rows.filter((row) => row.getIsSelected());

                      // deleted selected user here
                      deleteFNAction(
                        // @ts-expect-error typescript just somehow don't know the type
                        selected.map((item) => item.original.id),
                      ).then((response: ActionResponse<TData>) => {
                        if (response.status === "ERROR") {
                          toast({
                            title: "Error",
                            description: response.error,
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title:
                              "Congratulations!!! User successfully deleted",
                            description: response.success,
                          });
                        }
                      });
                    }}
                    disabled={
                      !table
                        .getRowModel()
                        .rows.some((row) => row.getIsSelected())
                    }
                    className={"h-full w-1/2"}
                  >
                    Delete Anyway
                    <Trash />
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {/* START Column & Delete many Section */}
      </div>

      <Table className={"rounded-md border"}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={""}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={"relative"}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isFetching ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={"h-24 text-center"}
              >
                <span className={"ml-4"}>Loading </span>
                <LoaderCircle className={"inline animate-spin"}></LoaderCircle>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={""}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={""}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={"h-24 text-center"}
              >
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className={"mt-4 flex w-full items-center justify-between"}>
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Legacy Helper Column Exports
// ============================================

export function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className={"grid w-fit place-content-center"}>
        <Checkbox
          className={""}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(value)
          }
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className={"grid w-fit place-content-center"}>
          <Checkbox
            className={"max-w-[100px]"}
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean) => row.toggleSelected(value)}
            aria-label="Select row"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  };
}

export function numberColumn<TData>(): ColumnDef<TData> {
  return {
    accessorKey: "number",
    header: ({ column }) => (
      <DataTableColumnHeader
        className={"w-fit max-w-8"}
        column={column}
        title={"no"}
      />
    ),
    cell: ({ row, table }) => (
      <div className={"flex w-fit max-w-8 justify-center"}>
        {table.getRowModel().rows.indexOf(row) + 1}
      </div>
    ),
  };
}

export function moreActionColumn<TData>({
  editFNAction,
  deleteFNAction,
}: {
  editFNAction?: boolean;
  deleteFNAction?: (ids: string[]) => Promise<ActionResponse<never>>;
}): ColumnDef<TData> {
  return {
    id: "actions",
    header: () => (
      <div className="w-fit max-w-16 text-center">More actions</div>
    ),
    cell: ({ row }) => {
      // @ts-expect-error the id should always there, typescript just doesn't know*/
      const itemId = row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="size-8 w-fit max-w-16 justify-center p-0 px-4"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={"space-y-2"}>
            {editFNAction ? (
              <DropdownMenuItem className={"p-0"} asChild>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/articles/edit-article/${itemId}`}>
                    Edit
                    <SquarePen />
                  </Link>
                </Button>
              </DropdownMenuItem>
            ) : null}
            {deleteFNAction ? (
              <DropdownMenuItem className={"p-0"} asChild>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className={"w-full"}
                    >
                      Delete
                      <Trash />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" className={"w-1/2"}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          deleteFNAction([itemId]).then((response) => {
                            if (response.error) {
                              toast({
                                title: "Error",
                                description: response.error,
                                variant: "destructive",
                              });
                            } else if (response.success) {
                              toast({
                                title: "Success",
                                description: response.success,
                              });
                            }
                          });
                        }}
                        className={"w-1/2"}
                      >
                        Delete Anyway
                        <Trash />
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

// ============================================
// NEW: Compositional DataTable Components
// ============================================

interface DataTableProps {
  children: ReactNode;
}

interface DataTableHeaderProps {
  children: ReactNode;
}

interface DataTableContentProps<TData> {
  className?: string;
  cellClassName?: string;
  columns: number;
  data?: TData[];
  isLoading?: boolean;
  renderCells: (item: TData, index: number) => ReactNode[];
  columnHeaders?: ReactNode;
  selectionColumn?: SelectionColumnProps<TData>;
}

/**
 * Pagination component for DataTable footer
 */
export function Pagination({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  canPreviousPage,
  canNextPage,
}: {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousPage}
        disabled={!canPreviousPage}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={!canNextPage}
      >
        Next
      </Button>
    </div>
  );
}

/**
 * SelectionInfo component - shows selected count and total
 */
export function SelectionInfo({
  selectedCount,
  totalCount,
}: {
  selectedCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex-1 text-muted-foreground text-sm">
      {selectedCount} of {totalCount} row(s) selected.
    </div>
  );
}

/**
 * Main DataTable container component
 * Use as parent with DataTableHeader, DataTableContent, DataTableFooter as children
 */
export function TableRoot({ children }: DataTableProps) {
  return <div>{children}</div>;
}

/**
 * DataTable header section for filters, search, and actions
 */
export function TableHeaderSection({ children }: DataTableHeaderProps) {
  return <div className="flex justify-between">{children}</div>;
}

/**
 * DataTable content section with table rendering
 */
export function TableContent<TData>({
  className,
  cellClassName,
  columns,
  data,
  isLoading,
  renderCells,
  columnHeaders,
  selectionColumn,
}: DataTableContentProps<TData>) {
  // Calculate actual column count including selection column
  const hasSelection = !!selectionColumn;
  const totalColumns = columns + (hasSelection ? 1 : 0);

  return (
    <div className={cn("mt-4 rounded-lg border overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {/* Render selection column header if provided */}
            {hasSelection && (
              <TableHead className="w-12">
                {selectionColumn.renderHeader(data)}
              </TableHead>
            )}
            {columnHeaders
              ? columnHeaders
              : // Default header with numbered columns
                Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i} className="text-center">
                    Column {i + 1}
                  </TableHead>
                ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="h-24 text-center">
                <span className="ml-4">Loading </span>
                <LoaderCircle className="inline animate-spin"></LoaderCircle>
              </TableCell>
            </TableRow>
          ) : data && data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index}>
                {/* Render selection column cell if provided */}
                {hasSelection && (
                  <TableCell className="w-12">
                    {selectionColumn.renderCell(item)}
                  </TableCell>
                )}
                {renderCells(item, index).map((cell, i) => (
                  <TableCell
                    key={i}
                    className={cn(index === 0 ? "pt-4" : "py-3", cellClassName)}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={totalColumns} className="h-24 text-center">
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * DeleteManyButton component for bulk delete actions in table header
 * Shows a delete button when items are selected with confirmation dialog
 */
export function DeleteManyButton({
  selectedCount,
  onDelete,
  deleteLabel = "Delete",
  isLoading = false,
}: {
  selectedCount: number;
  onDelete: () => void;
  deleteLabel?: string;
  isLoading?: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            {deleteLabel}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedCount} item(s).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Anyway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * DataTable footer section - uses children for compositional pattern
 */
export function TableFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex w-full items-center justify-between">
      {children}
    </div>
  );
}

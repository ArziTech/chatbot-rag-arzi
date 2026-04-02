"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SelectColumn } from "@/components/table/select-column";
import {
  DeleteManyButton,
  Pagination,
  SelectionInfo,
  TableContent,
  TableFooter,
  TableHeaderSection,
  TableRoot,
} from "@/components/table/table-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead } from "@/components/ui/table";
import {
  PermissionFormDialog,
  PermissionGate,
  permissionsListQuery,
  useCreatePermission,
  useDeletePermissions,
} from "@/features/permissions";
import type { Permission, PermissionInput } from "@/features/permissions/types";
import { toast } from "@/hooks/use-toast";

export function ExamplesClient() {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageSize = 10;

  // Fetch permissions using typed query (TanStack Query Rules - Rule 2: Typed Query)
  const { data, isLoading } = useQuery(permissionsListQuery());

  // Mutation for creating permissions
  const createPermission = useCreatePermission();

  // Mutation for deleting permissions
  const deletePermissions = useDeletePermissions();

  // Handle delete many
  const handleDeleteMany = async () => {
    const idsToDelete = selectedIds.map((id) => Number(id));
    const result = await deletePermissions.mutateAsync(idsToDelete);

    if (result.success) {
      toast({
        title: "Success",
        description: `Successfully deleted ${result.data?.success.length} permission(s)`,
      });
      setSelectedIds([]);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  // Client-side filtering
  const filteredData = data?.success
    ? (data.data ?? []).filter(
        (p: Permission) =>
          p.label.toLowerCase().includes(filter.toLowerCase()) ||
          p.code.toLowerCase().includes(filter.toLowerCase()),
      )
    : [];

  // Pagination
  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Create selection column for row selection
  const selectionColumn = SelectColumn({
    selectedIds,
    onSelectionChange: setSelectedIds,
    getRowId: (permission: Permission) => String(permission.id),
  });

  const handleCreatePermission = async (
    data: PermissionInput,
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await createPermission.mutateAsync(data);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">DataTable Examples</h1>
      <p className="mb-6 text-muted-foreground">
        Example using compositional DataTable pattern with permissions data
      </p>

      <TableRoot>
        {/* Header Section - Search and Filters */}
        <TableHeaderSection>
          <Input
            placeholder="Search permissions..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <PermissionGate permission="permission.delete">
              <DeleteManyButton
                selectedCount={selectedIds.length}
                onDelete={handleDeleteMany}
                isLoading={deletePermissions.isPending}
              />
            </PermissionGate>
            <Button variant="outline">Filter</Button>
            <PermissionGate permission="permission.create">
              <PermissionFormDialog
                onSubmit={handleCreatePermission}
                trigger={<Button>Add New</Button>}
              />
            </PermissionGate>
          </div>
        </TableHeaderSection>

        {/* Content Section - Table */}
        <TableContent
          columns={4}
          data={paginatedData}
          isLoading={isLoading}
          selectionColumn={selectionColumn}
          columnHeaders={
            <>
              <TableHead>Label</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Status</TableHead>
            </>
          }
          renderCells={(permission: Permission) => [
            <div key="label" className="font-medium">
              {permission.label}
            </div>,
            <div key="code">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {permission.code}
              </code>
            </div>,
            <div key="module">
              {permission.module && (
                <Badge variant="outline">{permission.module}</Badge>
              )}
            </div>,
            <div key="status">
              <Badge variant={permission.isActive ? "default" : "secondary"}>
                {permission.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>,
          ]}
        />

        {/* Footer Section - Pagination */}
        <TableFooter>
          <SelectionInfo
            selectedCount={selectedIds.length}
            totalCount={totalCount}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            canPreviousPage={currentPage > 1}
            canNextPage={currentPage < totalPages}
          />
        </TableFooter>
      </TableRoot>
    </div>
  );
}

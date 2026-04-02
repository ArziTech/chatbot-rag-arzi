"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createPermission,
  deletePermission,
  getPermissions,
  PermissionFormDialog,
  PermissionGate,
  togglePermissionStatus,
  updatePermission,
} from "@/features/permissions";
import type { PermissionInput } from "@/features/permissions/types";

type Permission = {
  id: number;
  code: string;
  label: string;
  href: string | null;
  description: string | null;
  icon: string | null;
  module: string | null;
  isSection: boolean;
  sequence: number;
  parentId: number | null;
  showOnSidebar: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent: {
    id: number;
    label: string;
    code: string;
  } | null;
  _count: {
    children: number;
    RolePermission: number;
  };
};

export function PermissionsClient() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    const result = await getPermissions();
    if (result.success && result.data) {
      setPermissions(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreate = async (data: PermissionInput) => {
    return await createPermission(data);
  };

  const handleUpdate = async (data: PermissionInput) => {
    if (!editingPermission)
      return { success: false, error: "No permission selected" };
    return await updatePermission(editingPermission.id, data);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const result = await deletePermission(deletingId);
    if (result.success) {
      setPermissions(permissions.filter((p) => p.id !== deletingId));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } else {
      alert(result.error);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const result = await togglePermissionStatus(id, !currentStatus);
    if (result.success) {
      setPermissions(
        permissions.map((p) =>
          p.id === id ? { ...p, isActive: !currentStatus } : p,
        ),
      );
    }
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Permissions Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage system permissions and access controls
          </p>
        </div>
        <PermissionGate permission="permissions.manage">
          <PermissionFormDialog
            onSubmit={handleCreate}
            trigger={
              <Button>
                <Plus className="mr-2 size-4" />
                Add Permission
              </Button>
            }
          />
        </PermissionGate>
      </div>

      <Card className=" flex grow">
        <CardHeader className="">
          <CardTitle>All Permissions</CardTitle>
          <CardDescription>
            A list of all permissions in the system ({permissions.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : permissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="mb-4 size-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No permissions found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first permission.
              </p>
              <PermissionGate permission="permissions.manage">
                <PermissionFormDialog
                  onSubmit={handleCreate}
                  trigger={
                    <Button>
                      <Plus className="mr-2 size-4" />
                      Add Permission
                    </Button>
                  }
                />
              </PermissionGate>
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sidebar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Children</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {permission.parent && (
                            <span className="text-muted-foreground">
                              {permission.parent.label} →
                            </span>
                          )}
                          {permission.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {permission.module && (
                          <Badge variant="outline">{permission.module}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.isSection ? (
                          <Badge variant="secondary">Section</Badge>
                        ) : (
                          <Badge variant="outline">Permission</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.showOnSidebar ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            permission.isActive ? "default" : "secondary"
                          }
                          className={permission.isActive ? "bg-green-500" : ""}
                        >
                          {permission.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{permission._count.children}</TableCell>
                      <TableCell>{permission._count.RolePermission}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleStatus(
                                permission.id,
                                permission.isActive,
                              )
                            }
                            title={
                              permission.isActive ? "Deactivate" : "Activate"
                            }
                          >
                            {permission.isActive ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(permission)}
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(permission.id)}
                            title="Delete"
                            disabled={
                              permission._count.children > 0 ||
                              permission._count.RolePermission > 0
                            }
                          >
                            <Trash2
                              className={`size-4 ${
                                permission._count.children > 0 ||
                                permission._count.RolePermission > 0
                                  ? "text-muted-foreground"
                                  : "text-destructive"
                              }`}
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingPermission && (
        <PermissionFormDialog
          permission={editingPermission}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingPermission(null);
            }
          }}
          onSubmit={async (data) => {
            const result = await handleUpdate(data);
            if (result.success) {
              setShowEditDialog(false);
              setEditingPermission(null);
              fetchPermissions();
            }
            return result;
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this permission? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { Database, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
  createRuntimeEnv,
  deleteRuntimeEnv,
  getRuntimeEnvs,
  RuntimeEnvFormDialog,
  updateRuntimeEnv,
} from "@/features/runtime-env";
import type { RuntimeEnvInput } from "@/features/runtime-env/types";

type RuntimeEnv = {
  id: string;
  name: string;
  key: string;
  value: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function RuntimeEnvClient() {
  const [runtimeEnvs, setRuntimeEnvs] = useState<RuntimeEnv[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEnv, setEditingEnv] = useState<RuntimeEnv | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());

  const fetchRuntimeEnvs = useCallback(async () => {
    setLoading(true);
    const result = await getRuntimeEnvs();
    if (result.success && result.data) {
      setRuntimeEnvs(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRuntimeEnvs();
  }, [fetchRuntimeEnvs]);

  const handleCreate = async (data: RuntimeEnvInput) => {
    return await createRuntimeEnv(data);
  };

  const handleUpdate = async (data: RuntimeEnvInput) => {
    if (!editingEnv)
      return { success: false, error: "No runtime environment selected" };
    return await updateRuntimeEnv(editingEnv.id, data);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const result = await deleteRuntimeEnv(deletingId);
    if (result.success) {
      setRuntimeEnvs(runtimeEnvs.filter((env) => env.id !== deletingId));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } else {
      alert(result.error);
    }
  };

  const openEditDialog = (env: RuntimeEnv) => {
    setEditingEnv(env);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const toggleValueVisibility = (id: string) => {
    setVisibleValues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Runtime Environments</h1>
          <p className="text-sm text-muted-foreground">
            Manage your runtime environment variables and configurations
          </p>
        </div>
        <RuntimeEnvFormDialog
          onSubmit={handleCreate}
          trigger={
            <Button>
              <Plus className="mr-2 size-4" />
              Add Runtime Env
            </Button>
          }
        />
      </div>

      <Card className="flex grow">
        <CardHeader>
          <CardTitle>All Runtime Environments</CardTitle>
          <CardDescription>
            A list of all runtime environment variables ({runtimeEnvs.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : runtimeEnvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="mb-4 size-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No runtime environments found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first runtime environment.
              </p>
              <RuntimeEnvFormDialog
                onSubmit={handleCreate}
                trigger={
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Add Runtime Env
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runtimeEnvs.map((env) => (
                    <TableRow key={env.id}>
                      <TableCell className="font-medium">{env.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {env.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {visibleValues.has(env.id) ? env.value : "••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleValueVisibility(env.id)}
                            title={visibleValues.has(env.id) ? "Hide" : "Show"}
                          >
                            {visibleValues.has(env.id) ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {env.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={env.isActive ? "default" : "secondary"}
                          className={env.isActive ? "bg-green-500" : ""}
                        >
                          {env.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(env)}
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(env.id)}
                            title="Delete"
                          >
                            <Trash2 className="size-4 text-destructive" />
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
      {editingEnv && (
        <RuntimeEnvFormDialog
          runtimeEnv={editingEnv}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingEnv(null);
            }
          }}
          onSubmit={async (data) => {
            const result = await handleUpdate(data);
            if (result.success) {
              setShowEditDialog(false);
              setEditingEnv(null);
              fetchRuntimeEnvs();
            }
            return result;
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Runtime Environment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this runtime environment? This action
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

"use client";

import { Loader2, Plus, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PermissionGate } from "..";
import { getPermissionsForSelect } from "../api/permissions";
import type { PermissionInput } from "../types";

type PermissionFormDialogProps = {
  permission?: {
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
  };
  onSubmit: (
    data: PermissionInput,
  ) => Promise<{ success: boolean; error?: string }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function PermissionFormDialog({
  permission,
  onSubmit,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: PermissionFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parentPermissions, setParentPermissions] = useState<
    Array<{
      id: number;
      label: string;
      code: string;
      module: string | null;
    }>
  >([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const isEditing = !!permission;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    code: permission?.code || "",
    label: permission?.label || "",
    href: permission?.href || "",
    description: permission?.description || "",
    icon: permission?.icon || "",
    module: permission?.module || "",
    isSection: permission?.isSection || false,
    sequence: permission?.sequence || 0,
    parentId: permission?.parentId?.toString() || "none",
    showOnSidebar: permission?.showOnSidebar || false,
    isActive: permission?.isActive ?? true,
  });

  const fetchParentPermissions = useCallback(async () => {
    setLoadingParents(true);
    const result = await getPermissionsForSelect();
    if (result.success && result.data) {
      // Filter out current permission when editing
      const filtered = result.data.filter((p) => p.id !== permission?.id);
      setParentPermissions(filtered);
    }
    setLoadingParents(false);
  }, [permission]);

  useEffect(() => {
    if (open) {
      fetchParentPermissions();
    }
  }, [open, fetchParentPermissions]);

  useEffect(() => {
    if (permission) {
      setFormData({
        code: permission.code,
        label: permission.label,
        href: permission.href || "",
        description: permission.description || "",
        icon: permission.icon || "",
        module: permission.module || "",
        isSection: permission.isSection,
        sequence: permission.sequence,
        parentId: permission.parentId?.toString() || "none",
        showOnSidebar: permission.showOnSidebar,
        isActive: permission.isActive,
      });
    }
  }, [permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: PermissionInput = {
      code: formData.code,
      label: formData.label,
      href: formData.href || null,
      description: formData.description || null,
      icon: formData.icon || null,
      module: formData.module || null,
      isSection: formData.isSection,
      sequence: formData.sequence,
      parentId:
        formData.parentId && formData.parentId !== "none"
          ? parseInt(formData.parentId, 10)
          : null,
      showOnSidebar: formData.showOnSidebar,
      isActive: formData.isActive,
    };

    const result = await onSubmit(data);

    if (result.success) {
      setOpen(false);
      if (!isEditing) {
        resetForm();
      }
    } else {
      alert(result.error || "Failed to save permission");
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      label: "",
      href: "",
      description: "",
      icon: "",
      module: "",
      isSection: false,
      sequence: 0,
      parentId: "none",
      showOnSidebar: false,
      isActive: true,
    });
  };

  const modules = [
    "Users",
    "Roles",
    "Permissions",
    "Settings",
    "Dashboard",
    "Reports",
    "System",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <PermissionGate permission="permissions.manage">
            <Button>
              <Plus className="mr-2 size-4" />
              Add Permission
            </Button>
          </PermissionGate>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Permission" : "Create New Permission"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the permission details below."
              : "Fill in the details to create a new permission."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">
                Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="e.g., View Users"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., users.view"
                required
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from label with dot notation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Select
                value={formData.module}
                onValueChange={(value) =>
                  setFormData({ ...formData, module: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sequence">Sequence</Label>
              <Input
                id="sequence"
                type="number"
                value={formData.sequence}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sequence: parseInt(e.target.value, 10) || 0,
                  })
                }
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Order in which this permission appears
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="href">Href / Route</Label>
            <Input
              id="href"
              value={formData.href}
              onChange={(e) =>
                setFormData({ ...formData, href: e.target.value })
              }
              placeholder="e.g., /dashboard/users"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this permission allows..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="e.g., Users, Settings, Shield"
              />
              <p className="text-xs text-muted-foreground">
                Lucide icon name (without extension)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Permission</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value })
                }
                disabled={loadingParents}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent</SelectItem>
                  {parentPermissions.map((perm) => (
                    <SelectItem key={perm.id} value={perm.id.toString()}>
                      {perm.module && `${perm.module}: `}
                      {perm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isSection">Is Section</Label>
                <p className="text-xs text-muted-foreground">
                  Mark as a section/group in sidebar
                </p>
              </div>
              <Switch
                id="isSection"
                checked={formData.isSection}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isSection: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="showOnSidebar">Show on Sidebar</Label>
                <p className="text-xs text-muted-foreground">
                  Display this permission in the sidebar menu
                </p>
              </div>
              <Switch
                id="showOnSidebar"
                checked={formData.showOnSidebar}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showOnSidebar: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable this permission
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Shield className="mr-2 size-4" />
                  {isEditing ? "Update" : "Create"} Permission
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

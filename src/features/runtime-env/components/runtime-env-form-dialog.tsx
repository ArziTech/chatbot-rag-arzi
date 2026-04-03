"use client";

import { Loader2, Plus, Database } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { RuntimeEnvInput } from "../types";

type RuntimeEnvFormDialogProps = {
  runtimeEnv?: {
    id: string;
    name: string;
    key: string;
    value: string;
    description: string | null;
    isActive: boolean;
  };
  onSubmit: (
    data: RuntimeEnvInput,
  ) => Promise<{ success: boolean; error?: string }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function RuntimeEnvFormDialog({
  runtimeEnv,
  onSubmit,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: RuntimeEnvFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!runtimeEnv;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: runtimeEnv?.name || "",
    key: runtimeEnv?.key || "",
    value: runtimeEnv?.value || "",
    description: runtimeEnv?.description || "",
    isActive: runtimeEnv?.isActive ?? true,
  });

  useEffect(() => {
    if (runtimeEnv) {
      setFormData({
        name: runtimeEnv.name,
        key: runtimeEnv.key,
        value: runtimeEnv.value,
        description: runtimeEnv.description || "",
        isActive: runtimeEnv.isActive,
      });
    }
  }, [runtimeEnv]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: RuntimeEnvInput = {
      name: formData.name,
      key: formData.key,
      value: formData.value,
      description: formData.description || null,
      isActive: formData.isActive,
    };

    const result = await onSubmit(data);

    if (result.success) {
      setOpen(false);
      if (!isEditing) {
        resetForm();
      }
    } else {
      alert(result.error || "Failed to save runtime environment");
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      key: "",
      value: "",
      description: "",
      isActive: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 size-4" />
            Add Runtime Env
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Runtime Environment"
              : "Create New Runtime Environment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the runtime environment details below."
              : "Fill in the details to create a new runtime environment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Production API"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">
                Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                placeholder="e.g., OPENAI_API_KEY"
                required
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Environment variable name (cannot be changed after creation)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Value <span className="text-destructive">*</span>
            </Label>
            <Input
              id="value"
              type="password"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder="Enter the value"
              required
            />
            <p className="text-xs text-muted-foreground">
              The value will be encrypted when stored
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this runtime environment is for..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable this runtime environment
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
                  <Database className="mr-2 size-4" />
                  {isEditing ? "Update" : "Create"} Runtime Env
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

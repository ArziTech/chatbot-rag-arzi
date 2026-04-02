"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export interface SelectColumnRenderProps<TData> {
  item: TData;
  index: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export interface SelectColumnProps<TData> {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  getRowId: (item: TData) => string;
}

// Checkbox component with indeterminate state support
function IndeterminateCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  ...props
}: {
  checked: boolean;
  indeterminate: boolean;
  onCheckedChange: (checked: boolean) => void;
} & React.ComponentProps<typeof Checkbox>) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.dataset.state = indeterminate
        ? "indeterminate"
        : checked
          ? "checked"
          : "unchecked";
      ref.current.classList.toggle(
        "data-[state=checked]:bg-primary",
        checked || indeterminate,
      );
      ref.current.classList.toggle(
        "data-[state=checked]:text-primary-foreground",
        checked || indeterminate,
      );
      ref.current.classList.toggle(
        "data-[state=indeterminate]:bg-primary",
        indeterminate,
      );
      ref.current.classList.toggle(
        "data-[state=indeterminate]:text-primary-foreground",
        indeterminate,
      );
    }
  }, [checked, indeterminate]);

  return (
    <Checkbox
      ref={ref}
      checked={indeterminate ? false : checked}
      onCheckedChange={onCheckedChange}
      {...props}
    />
  );
}

/**
 * SelectColumn component for row selection
 * Use this with TableContent to add selection functionality
 *
 * @example
 * ```tsx
 * const [selectedIds, setSelectedIds] = useState<string[]>([]);
 *
 * const selectionColumn = SelectColumn({
 *   selectedIds,
 *   onSelectionChange: setSelectedIds,
 *   getRowId: (item) => item.id,
 * });
 *
 * <TableContent
 *   selectionColumn={selectionColumn}
 *   // ...
 * />
 * ```
 */
export function SelectColumn<TData>({
  selectedIds,
  onSelectionChange,
  getRowId,
}: SelectColumnProps<TData>) {
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Render function for the header (select all)
  // Accepts data to compute all IDs for select all functionality
  const renderHeader = (data?: TData[]): ReactNode => {
    const allIds = data?.map(getRowId) ?? [];
    const isAllSelected =
      allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    const isIndeterminate =
      allIds.length > 0 &&
      !isAllSelected &&
      allIds.some((id) => selectedIds.includes(id));

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        // Select all - add all IDs that aren't already selected
        const newIds = allIds.filter((id) => !selectedIds.includes(id));
        onSelectionChange([...selectedIds, ...newIds]);
      } else {
        // Deselect all - remove all IDs that are in the current page
        onSelectionChange(selectedIds.filter((id) => !allIds.includes(id)));
      }
    };

    return (
      <div className="grid w-fit place-content-center">
        <IndeterminateCheckbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      </div>
    );
  };

  // Render function for each cell
  const renderCell = (item: TData): ReactNode => {
    const id = getRowId(item);
    const isSelected = selectedIds.includes(id);

    return (
      <div className="grid w-fit place-content-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => handleSelectRow(id, !!checked)}
          aria-label="Select row"
        />
      </div>
    );
  };

  // Return the component with both header and cell renderers
  return {
    renderHeader,
    renderCell,
  } as const;
}

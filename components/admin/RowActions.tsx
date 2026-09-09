"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { attendeeRemoval } from "@/lib/admin/monitor";
import type { MonitorRow } from "@/lib/admin/types";

export function AttendeeActions({
  row,
  onEdit,
  onRemove,
}: {
  row: MonitorRow;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const removal = attendeeRemoval(row);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`${row.fullName} — үйлдлүүд`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="size-4" />
          Мэдээлэл засах
        </DropdownMenuItem>

        {removal.kind === "blocked" ? (
          <div className="px-2 py-1.5">
            <p className="text-sm text-neutral-400">{removal.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-neutral-400">
              {removal.reason}
            </p>
          </div>
        ) : (
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            <Trash2 className="size-4" />
            {removal.label}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

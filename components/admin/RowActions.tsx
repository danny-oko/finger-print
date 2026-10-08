"use client";

import { CreditCard, DoorOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { attendeeRemoval, STATE_LABEL } from "@/lib/admin/monitor";
import type { MonitorRow } from "@/lib/admin/types";
import type { ManualStatus } from "@/lib/admin/manage";

const PAYMENT_STATUSES: ManualStatus[] = ["paid", "pending", "cancelled"];

export function AttendeeActions({
  row,
  onEdit,
  onRemove,
  onSetStatus,
  onSetCheckedIn,
}: {
  row: MonitorRow;
  onEdit: () => void;
  onRemove: () => void;
  onSetStatus: (status: ManualStatus) => void;
  onSetCheckedIn: (checkedIn: boolean) => void;
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

        {/* No payment behind an invite — "pending" would leave its page polling
            a Byl checkout that doesn't exist. Delete is the way to revoke one. */}
        {row.source !== "invite" && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CreditCard className="size-4 text-muted-foreground" />
              Төлбөрийн төлөв
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={row.status}
                onValueChange={(value) => onSetStatus(value as ManualStatus)}
              >
                {PAYMENT_STATUSES.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {STATE_LABEL[status]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* The door only lets in paid tickets, and so does the server. */}
        {row.status === "paid" && row.ticketCode && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <DoorOpen className="size-4 text-muted-foreground" />
              Ирц
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={row.checkedInAt ? "in" : "out"}
                onValueChange={(value) => onSetCheckedIn(value === "in")}
              >
                <DropdownMenuRadioItem value="in">Ирсэн</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="out">Ирээгүй</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

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

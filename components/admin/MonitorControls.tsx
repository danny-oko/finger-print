"use client";

import { ArrowDownAZ, ArrowUpAZ, Search, SlidersHorizontal, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  EMPTY_FILTERS,
  STATE_LABEL,
  activeFilterCount,
  type Filters,
  type MonitorState,
  type SortDirection,
} from "@/lib/admin/monitor";
import { cn } from "@/lib/utils";
import {
  GRADE_CHOICES,
  gradeChoiceLabel,
  YOUTH_LEADER,
} from "@/lib/registration/grade";

export type ViewMode = "attendees" | "churches" | "registrations";

const VIEW_LABEL: Record<ViewMode, string> = {
  attendees: "Хүмүүс",
  churches: "Сүмээр",
  registrations: "Төлбөрөөр",
};

const STATES: MonitorState[] = [
  "paid",
  "awaiting",
  "pending",
  "failed",
  "expired",
  "cancelled",
];



export type SortOption<K extends string> = { value: K; label: string };

type ControlsProps<K extends string> = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sortKey: K;
  sortDirection: SortDirection;
  onSortChange: (key: K, direction: SortDirection) => void;
  sortOptions: SortOption<K>[];
  churches: { key: string; label: string; count: number }[];
  resultLabel: string;
};

export function MonitorControls<K extends string>({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  sortKey,
  sortDirection,
  onSortChange,
  sortOptions,
  churches,
  resultLabel,
}: ControlsProps<K>) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const filterCount = activeFilterCount(filters);

  function set<T extends keyof Filters>(field: T, value: Filters[T]) {
    onFiltersChange({ ...filters, [field]: value });
  }

  const toggleDirection = () =>
    onSortChange(sortKey, sortDirection === "asc" ? "desc" : "asc");

  // Rendered inline on desktop and inside the sheet on phones, so there's
  // exactly one definition of what the filters are.
  const fields = (
    <>
      <Select value={filters.state} onValueChange={(v) => set("state", v as Filters["state"])}>
        <SelectTrigger className="w-full sm:w-[9.5rem]">
          <SelectValue placeholder="Төлөв" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Бүх төлөв</SelectItem>
          {STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {STATE_LABEL[state]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.path} onValueChange={(v) => set("path", v as Filters["path"])}>
        <SelectTrigger className="w-full sm:w-[9.5rem]">
          <SelectValue placeholder="Бүртгэсэн арга" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Бүх арга</SelectItem>
          <SelectItem value="individual">Хувиараа бүртгүүлсэн</SelectItem>
          <SelectItem value="church_leader">Ахлагчаар бүртгүүлсэн</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.church} onValueChange={(v) => set("church", v)}>
        <SelectTrigger className="w-full sm:w-[11rem]">
          <SelectValue placeholder="Сүм" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value="all">Бүх сүм</SelectItem>
          {churches.map((church) => (
            <SelectItem key={church.key} value={church.key}>
              {church.label} ({church.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.grade === "all" ? "all" : String(filters.grade)}
        onValueChange={(v) =>
          set(
            "grade",
            v === "all" || v === YOUTH_LEADER ? (v as Filters["grade"]) : Number(v),
          )
        }
      >
        <SelectTrigger className="w-full sm:w-[7.5rem]">
          <SelectValue placeholder="Анги" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Бүх анги</SelectItem>
          {GRADE_CHOICES.map((choice) => (
            <SelectItem key={choice} value={choice}>
              {gradeChoiceLabel(choice)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.checkedIn}
        onValueChange={(v) => set("checkedIn", v as Filters["checkedIn"])}
      >
        <SelectTrigger className="w-full sm:w-[9rem]">
          <SelectValue placeholder="Ирц" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Бүх ирц</SelectItem>
          <SelectItem value="yes">Ирсэн</SelectItem>
          <SelectItem value="no">Ирээгүй</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  const sortField = (
    <div className="flex w-full gap-2 sm:w-auto">
      <Select value={sortKey} onValueChange={(v) => onSortChange(v as K, sortDirection)}>
        <SelectTrigger className="w-full sm:w-[12rem]">
          <SelectValue placeholder="Эрэмбэлэх" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleDirection}
        aria-label={sortDirection === "asc" ? "Өсөхөөр эрэмбэлсэн" : "Буурахаар эрэмбэлсэн"}
        title={sortDirection === "asc" ? "Өсөхөөр" : "Буурахаар"}
        className="shrink-0"
      >
        {sortDirection === "asc" ? (
          <ArrowUpAZ className="size-4" />
        ) : (
          <ArrowDownAZ className="size-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="grid gap-3">
      {/* View switcher — full-width segmented control, thumb-sized on phones */}
      <div
        role="tablist"
        aria-label="Харагдац"
        className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1"
      >
        {(Object.keys(VIEW_LABEL) as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={view === mode}
            onClick={() => onViewChange(mode)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              view === mode
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            {VIEW_LABEL[mode]}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={filters.search}
            onChange={(event) => set("search", event.target.value)}
            placeholder="Нэр, утас, сүм, тасалбар..."
            className="h-10 pl-9"
            inputMode="search"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => set("search", "")}
              aria-label="Хайлт цэвэрлэх"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Phones get the filters in a sheet; md+ shows them inline below. */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="h-10 shrink-0 md:hidden">
              <SlidersHorizontal className="size-4" />
              Шүүх
              {filterCount > 0 && (
                <span className="ml-0.5 rounded-full bg-[#F98C01] px-1.5 text-[11px] font-bold text-white">
                  {filterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Шүүлтүүр ба эрэмбэ</SheetTitle>
            </SheetHeader>

            <div className="grid gap-3 px-4 pb-6">
              <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                Эрэмбэлэх
              </p>
              {sortField}

              <p className="mt-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                Шүүх
              </p>
              {fields}

              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onFiltersChange(EMPTY_FILTERS)}
                  disabled={filterCount === 0}
                >
                  Цэвэрлэх
                </Button>
                <Button type="button" className="flex-1" onClick={() => setSheetOpen(false)}>
                  {resultLabel}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        {fields}
        <div className="ml-auto flex items-center gap-2">
          {filterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
            >
              <X className="size-4" />
              Цэвэрлэх
            </Button>
          )}
          {sortField}
        </div>
      </div>

      <p className="text-xs text-neutral-500">{resultLabel}</p>
    </div>
  );
}

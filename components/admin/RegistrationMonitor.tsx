"use client";

import { Download, LogOut, RefreshCw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AttendeeView } from "@/components/admin/AttendeeView";
import { ChurchView } from "@/components/admin/ChurchView";
import { MonitorControls, type SortOption, type ViewMode } from "@/components/admin/MonitorControls";
import { MonitorStats } from "@/components/admin/MonitorStats";
import { RegistrationView } from "@/components/admin/RegistrationView";
import { Button } from "@/components/ui/button";
import {
  ATTENDEE_SORT_LABEL,
  CHURCH_SORT_LABEL,
  EMPTY_FILTERS,
  REGISTRATION_SORT_LABEL,
  applyFilters,
  computeStats,
  findSimilarGroupPairs,
  groupByChurch,
  groupByRegistration,
  sortAttendees,
  sortChurchGroups,
  sortRegistrations,
  toCsv,
  type AttendeeSortKey,
  type ChurchSortKey,
  type Filters,
  type RegistrationSortKey,
  type SortDirection,
} from "@/lib/admin/monitor";
import type { MonitorResponse, MonitorRow } from "@/lib/admin/types";
import { normalizeChurchName } from "@/lib/registration/churchName";

const AUTO_REFRESH_MS = 60_000;

type SortState<K extends string> = { key: K; direction: SortDirection };

function toOptions<K extends string>(labels: Record<K, string>): SortOption<K>[] {
  return (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));
}

export function RegistrationMonitor() {
  const router = useRouter();

  const [rows, setRows] = React.useState<MonitorRow[]>([]);
  const [generatedAt, setGeneratedAt] = React.useState<string | null>(null);
  const [truncated, setTruncated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [view, setView] = React.useState<ViewMode>("attendees");
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);

  // Each view keeps its own sort, so switching tabs doesn't throw away the
  // ordering you set up in the one you were just looking at.
  const [attendeeSort, setAttendeeSort] = React.useState<SortState<AttendeeSortKey>>({
    key: "registeredAt",
    direction: "desc",
  });
  const [churchSort, setChurchSort] = React.useState<SortState<ChurchSortKey>>({
    key: "attendeeCount",
    direction: "desc",
  });
  const [registrationSort, setRegistrationSort] = React.useState<SortState<RegistrationSortKey>>({
    key: "createdAt",
    direction: "desc",
  });

  // Admin-confirmed "these two spellings are the same church" merges, keyed
  // church -> canonical church. Session-only: it changes how the data reads,
  // never what's stored.
  const [aliases, setAliases] = React.useState<Record<string, string>>({});

  const load = React.useCallback(
    async () => {
      try {
        const res = await fetch("/api/admin/registrations", { cache: "no-store" });

        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("request_failed");

        const data = (await res.json()) as MonitorResponse;
        setRows(data.rows);
        setGeneratedAt(data.generatedAt);
        setTruncated(data.truncated);
        setError(null);
      } catch {
        setError("Мэдээлэл татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  // Flipping the spinner on is the caller's job, so the initial effect below
  // never touches state synchronously on mount.
  const refresh = React.useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const id = setInterval(refresh, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const filteredRows = React.useMemo(() => applyFilters(rows, filters), [rows, filters]);

  // Church options come from the unfiltered set so picking one never empties
  // the dropdown you picked it from.
  const churchOptions = React.useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();

    for (const row of rows) {
      const key = normalizeChurchName(row.churchName) || row.churchName.trim().toLowerCase();
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { label: row.churchName.trim(), count: 1 });
    }

    return [...counts.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "mn"));
  }, [rows]);

  const sortedAttendees = React.useMemo(
    () => sortAttendees(filteredRows, attendeeSort.key, attendeeSort.direction),
    [filteredRows, attendeeSort],
  );

  const churchGroups = React.useMemo(
    () => groupByChurch(filteredRows, aliases),
    [filteredRows, aliases],
  );

  const sortedChurchGroups = React.useMemo(
    () => sortChurchGroups(churchGroups, churchSort.key, churchSort.direction),
    [churchGroups, churchSort],
  );

  const similarPairs = React.useMemo(
    () => findSimilarGroupPairs(sortedChurchGroups),
    [sortedChurchGroups],
  );

  // The church count comes from the same grouping the church view renders,
  // so a manual merge doesn't leave the tile disagreeing with the list.
  const stats = React.useMemo(
    () => ({ ...computeStats(filteredRows), churches: churchGroups.length }),
    [filteredRows, churchGroups],
  );

  const sortedRegistrations = React.useMemo(
    () =>
      sortRegistrations(
        groupByRegistration(filteredRows),
        registrationSort.key,
        registrationSort.direction,
      ),
    [filteredRows, registrationSort],
  );

  const sortConfig = React.useMemo(() => {
    if (view === "churches") {
      return {
        key: churchSort.key as string,
        direction: churchSort.direction,
        options: toOptions(CHURCH_SORT_LABEL) as SortOption<string>[],
        onChange: (key: string, direction: SortDirection) =>
          setChurchSort({ key: key as ChurchSortKey, direction }),
      };
    }
    if (view === "registrations") {
      return {
        key: registrationSort.key as string,
        direction: registrationSort.direction,
        options: toOptions(REGISTRATION_SORT_LABEL) as SortOption<string>[],
        onChange: (key: string, direction: SortDirection) =>
          setRegistrationSort({ key: key as RegistrationSortKey, direction }),
      };
    }
    return {
      key: attendeeSort.key as string,
      direction: attendeeSort.direction,
      options: toOptions(ATTENDEE_SORT_LABEL) as SortOption<string>[],
      onChange: (key: string, direction: SortDirection) =>
        setAttendeeSort({ key: key as AttendeeSortKey, direction }),
    };
  }, [view, attendeeSort, churchSort, registrationSort]);

  const resultLabel =
    view === "churches"
      ? `${sortedChurchGroups.length} сүм · ${filteredRows.length} хүн`
      : view === "registrations"
        ? `${sortedRegistrations.length} төлбөр · ${filteredRows.length} хүн`
        : `${filteredRows.length} хүн`;

  function handleExport() {
    const blob = new Blob([toCsv(sortedAttendees)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finger-print-burtgel-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSignOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-black text-neutral-900 sm:text-lg">
              Бүртгэлийн хяналт
            </h1>
            <p className="truncate text-[11px] text-neutral-500">
              {generatedAt
                ? `Шинэчлэгдсэн ${new Date(generatedAt).toLocaleTimeString("mn-MN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : "Уншиж байна..."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={refreshing}
            aria-label="Шинэчлэх"
            title="Шинэчлэх"
          >
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleExport}
            disabled={sortedAttendees.length === 0}
            aria-label="CSV татах"
            title="CSV татах"
          >
            <Download className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Гарах"
            title="Гарах"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-4 px-4 py-4 pb-16">
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </p>
        )}

        {truncated && (
          <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <TriangleAlert className="size-4 shrink-0" />
            Хэт олон мөр байна — зөвхөн эхний 5000 харагдаж байна.
          </p>
        )}

        <MonitorStats stats={stats} />

        <MonitorControls
          view={view}
          onViewChange={setView}
          filters={filters}
          onFiltersChange={setFilters}
          sortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSortChange={sortConfig.onChange}
          sortOptions={sortConfig.options}
          churches={churchOptions.map((c) => ({ key: c.key, label: c.label, count: c.count }))}
          resultLabel={resultLabel}
        />

        {loading ? (
          <div className="grid gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-neutral-200/60" />
            ))}
          </div>
        ) : view === "attendees" ? (
          <AttendeeView
            rows={sortedAttendees}
            sortKey={attendeeSort.key}
            sortDirection={attendeeSort.direction}
            onSortChange={(key, direction) => setAttendeeSort({ key, direction })}
          />
        ) : view === "churches" ? (
          <ChurchView
            groups={sortedChurchGroups}
            sortKey={churchSort.key}
            sortDirection={churchSort.direction}
            onSortChange={(key, direction) => setChurchSort({ key, direction })}
            similarPairs={similarPairs}
            onMerge={(fromKey, intoKey) =>
              setAliases((prev) => ({ ...prev, [fromKey]: intoKey }))
            }
            mergeCount={Object.keys(aliases).length}
            onResetMerges={() => setAliases({})}
          />
        ) : (
          <RegistrationView
            groups={sortedRegistrations}
            sortKey={registrationSort.key}
            sortDirection={registrationSort.direction}
            onSortChange={(key, direction) => setRegistrationSort({ key, direction })}
          />
        )}
      </div>
    </main>
  );
}

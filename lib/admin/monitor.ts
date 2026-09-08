import type { MonitorRow, RegistrantType } from "@/lib/admin/types";
import { isCloseChurchName, normalizeChurchName } from "@/lib/registration/churchName";
import {
  formatGrade,
  gradeSortValue,
  isYouthLeader,
  YOUTH_LEADER,
} from "@/lib/registration/grade";

// Pure helpers shared by every view in the registration monitor. Everything
// here runs on the client against the full row set, which is what lets the
// dashboard re-sort and re-group instantly instead of re-querying.

/**
 * The state a row is actually *shown* as. This is finer-grained than the
 * `status` column: a pending registration whose bank transfer Byl has
 * reported but not yet confirmed is its own thing, because it needs a human
 * to go and verify it rather than just more waiting.
 */
export type MonitorState =
  | "paid"
  | "awaiting"
  | "pending"
  | "failed"
  | "expired"
  | "cancelled";

export function rowState(row: MonitorRow): MonitorState {
  if (row.status === "paid") return "paid";
  if (row.status === "pending") return row.awaitingVerificationAt ? "awaiting" : "pending";
  return row.status;
}

export const STATE_LABEL: Record<MonitorState, string> = {
  paid: "Төлөгдсөн",
  awaiting: "Шилжүүлэг шалгах",
  pending: "Хүлээгдэж буй",
  failed: "Амжилтгүй",
  expired: "Хугацаа дууссан",
  cancelled: "Цуцлагдсан",
};

export const STATE_CLASS: Record<MonitorState, string> = {
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  awaiting: "bg-sky-100 text-sky-800 border-sky-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  expired: "bg-neutral-200 text-neutral-700 border-neutral-300",
  cancelled: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

export const PATH_LABEL: Record<RegistrantType, string> = {
  individual: "Хувиараа",
  church_leader: "Ахлагчаар",
};

// ─────────────────────────────────────────────────────────────
// Filtering
// ─────────────────────────────────────────────────────────────

export type Filters = {
  search: string;
  state: MonitorState | "all";
  path: RegistrantType | "all";
  church: string | "all";
  grade: number | typeof YOUTH_LEADER | "all";
  checkedIn: "all" | "yes" | "no";
};

export const EMPTY_FILTERS: Filters = {
  search: "",
  state: "all",
  path: "all",
  church: "all",
  grade: "all",
  checkedIn: "all",
};

function haystack(row: MonitorRow): string {
  return [
    row.fullName,
    row.churchName,
    row.phone,
    row.parentPhone,
    row.payerName,
    row.payerPhone,
    row.payerEmail,
    row.ticketCode,
    row.registrationId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * `church` is matched on the *normalized* name so searching for one church
 * catches every spelling of it, across both registration paths. Free-text
 * search gets the same treatment as a fallback, so typing "номин" or "nomin"
 * finds the people who wrote it "NOMIN SUM!!" too.
 */
export function applyFilters(rows: MonitorRow[], filters: Filters): MonitorRow[] {
  const search = filters.search.trim().toLowerCase();
  const normalizedSearch = normalizeChurchName(filters.search);

  return rows.filter((row) => {
    if (filters.state !== "all" && rowState(row) !== filters.state) return false;
    if (filters.path !== "all" && row.registrantType !== filters.path) return false;
    if (filters.grade === YOUTH_LEADER) {
      if (!isYouthLeader(row)) return false;
    } else if (filters.grade !== "all" && row.grade !== filters.grade) {
      return false;
    }
    if (filters.church !== "all" && normalizeChurchName(row.churchName) !== filters.church) {
      return false;
    }
    if (filters.checkedIn === "yes" && !row.checkedInAt) return false;
    if (filters.checkedIn === "no" && row.checkedInAt) return false;

    if (search) {
      const matchesText = haystack(row).includes(search);
      const matchesChurch =
        normalizedSearch.length > 0 &&
        normalizeChurchName(row.churchName).includes(normalizedSearch);
      if (!matchesText && !matchesChurch) return false;
    }

    return true;
  });
}

export function activeFilterCount(filters: Filters): number {
  let count = 0;
  if (filters.search.trim()) count++;
  if (filters.state !== "all") count++;
  if (filters.path !== "all") count++;
  if (filters.church !== "all") count++;
  if (filters.grade !== "all") count++;
  if (filters.checkedIn !== "all") count++;
  return count;
}

// ─────────────────────────────────────────────────────────────
// Sorting
// ─────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export type AttendeeSortKey =
  | "fullName"
  | "churchName"
  | "grade"
  | "state"
  | "path"
  | "payerName"
  | "registeredAt"
  | "ticketCode";

export type ChurchSortKey =
  | "displayName"
  | "attendeeCount"
  | "paidCount"
  | "unpaidCount"
  | "paidRevenueMnt"
  | "lastRegisteredAt";

export type RegistrationSortKey =
  | "payerName"
  | "attendeeCount"
  | "totalMnt"
  | "state"
  | "path"
  | "createdAt";

export const ATTENDEE_SORT_LABEL: Record<AttendeeSortKey, string> = {
  fullName: "Нэр",
  churchName: "Сүм",
  grade: "Анги",
  state: "Төлөв",
  path: "Бүртгэсэн арга",
  payerName: "Төлөгч",
  registeredAt: "Бүртгүүлсэн огноо",
  ticketCode: "Тасалбарын код",
};

export const CHURCH_SORT_LABEL: Record<ChurchSortKey, string> = {
  displayName: "Сүмийн нэр",
  attendeeCount: "Нийт хүн",
  paidCount: "Төлсөн хүн",
  unpaidCount: "Төлөөгүй хүн",
  paidRevenueMnt: "Орсон төлбөр",
  lastRegisteredAt: "Сүүлд бүртгүүлсэн",
};

export const REGISTRATION_SORT_LABEL: Record<RegistrationSortKey, string> = {
  createdAt: "Огноо",
  payerName: "Төлөгч",
  attendeeCount: "Хүний тоо",
  totalMnt: "Дүн",
  state: "Төлөв",
  path: "Бүртгэсэн арга",
};

// Sorted worst-first, so "sort by status" surfaces what needs chasing.
const STATE_ORDER: Record<MonitorState, number> = {
  awaiting: 0,
  pending: 1,
  failed: 2,
  expired: 3,
  cancelled: 4,
  paid: 5,
};

const collator = new Intl.Collator("mn", { sensitivity: "base", numeric: true });

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

function directed(result: number, direction: SortDirection): number {
  return direction === "asc" ? result : -result;
}

export function sortAttendees(
  rows: MonitorRow[],
  key: AttendeeSortKey,
  direction: SortDirection,
): MonitorRow[] {
  const value = (row: MonitorRow): string | number => {
    switch (key) {
      case "fullName":
        return row.fullName;
      case "churchName":
        return row.churchName;
      case "grade":
        return gradeSortValue(row);
      case "state":
        return STATE_ORDER[rowState(row)];
      case "path":
        return PATH_LABEL[row.registrantType];
      case "payerName":
        return row.payerName;
      case "ticketCode":
        return row.ticketCode ?? "";
      case "registeredAt":
        return row.registrationCreatedAt;
    }
  };

  // Ties fall back to name so repeated re-sorts stay stable and readable.
  return [...rows].sort(
    (a, b) => directed(compare(value(a), value(b)), direction) || collator.compare(a.fullName, b.fullName),
  );
}

// ─────────────────────────────────────────────────────────────
// Church grouping — the two registration paths, merged
// ─────────────────────────────────────────────────────────────

export type ChurchLeader = {
  registrationId: string;
  name: string;
  phone: string;
  email: string | null;
  attendeeCount: number;
  state: MonitorState;
};

export type ChurchGroup = {
  key: string;
  displayName: string;
  variants: string[];
  rows: MonitorRow[];
  attendeeCount: number;
  paidCount: number;
  awaitingCount: number;
  pendingCount: number;
  unpaidCount: number;
  checkedInCount: number;
  selfRegisteredCount: number;
  viaLeaderCount: number;
  leaders: ChurchLeader[];
  registrationCount: number;
  paidRevenueMnt: number;
  expectedRevenueMnt: number;
  firstRegisteredAt: string;
  lastRegisteredAt: string;
};

/**
 * `aliases` maps a church key onto another key, so the admin can fold two
 * near-identical spellings ("Нomin sum" / "Номин сүмъ") into one group from
 * the UI when normalization alone didn't catch the typo.
 */
export function groupByChurch(
  rows: MonitorRow[],
  aliases: Record<string, string> = {},
): ChurchGroup[] {
  function resolveKey(name: string): string {
    const base = normalizeChurchName(name) || name.trim().toLowerCase();
    // One hop only — aliases are built pairwise by the UI and a cycle here
    // would hang the render.
    return aliases[base] ?? base;
  }

  const buckets = new Map<string, MonitorRow[]>();

  for (const row of rows) {
    const key = resolveKey(row.churchName);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  return [...buckets.entries()].map(([key, groupRows]) => {
    // Display the spelling the most people actually used; shortest wins ties
    // so stray suffixes ("Номин сүм 2") don't become the group's name.
    const spellingCounts = new Map<string, number>();
    for (const row of groupRows) {
      const name = row.churchName.trim();
      spellingCounts.set(name, (spellingCounts.get(name) ?? 0) + 1);
    }
    const variants = [...spellingCounts.keys()].sort(collator.compare);
    const displayName =
      [...spellingCounts.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].length - b[0].length || collator.compare(a[0], b[0]),
      )[0]?.[0] ?? key;

    const leaders = new Map<string, ChurchLeader>();
    const registrationIds = new Set<string>();

    let paidCount = 0;
    let awaitingCount = 0;
    let pendingCount = 0;
    let checkedInCount = 0;
    let selfRegisteredCount = 0;
    let viaLeaderCount = 0;
    let paidRevenueMnt = 0;
    let expectedRevenueMnt = 0;
    let firstRegisteredAt = groupRows[0].registrationCreatedAt;
    let lastRegisteredAt = groupRows[0].registrationCreatedAt;

    for (const row of groupRows) {
      const state = rowState(row);
      registrationIds.add(row.registrationId);

      if (state === "paid") {
        paidCount++;
        paidRevenueMnt += row.pricePerAttendeeMnt;
      }
      if (state === "awaiting") awaitingCount++;
      if (state === "pending") pendingCount++;
      if (row.checkedInAt) checkedInCount++;

      if (row.registrantType === "church_leader") {
        viaLeaderCount++;
        const existing = leaders.get(row.registrationId);
        if (existing) existing.attendeeCount++;
        else
          leaders.set(row.registrationId, {
            registrationId: row.registrationId,
            name: row.payerName,
            phone: row.payerPhone,
            email: row.payerEmail,
            attendeeCount: 1,
            state,
          });
      } else {
        selfRegisteredCount++;
      }

      expectedRevenueMnt += row.pricePerAttendeeMnt;
      if (row.registrationCreatedAt < firstRegisteredAt) firstRegisteredAt = row.registrationCreatedAt;
      if (row.registrationCreatedAt > lastRegisteredAt) lastRegisteredAt = row.registrationCreatedAt;
    }

    return {
      key,
      displayName,
      variants,
      rows: groupRows,
      attendeeCount: groupRows.length,
      paidCount,
      awaitingCount,
      pendingCount,
      unpaidCount: groupRows.length - paidCount,
      checkedInCount,
      selfRegisteredCount,
      viaLeaderCount,
      leaders: [...leaders.values()].sort((a, b) => b.attendeeCount - a.attendeeCount),
      registrationCount: registrationIds.size,
      paidRevenueMnt,
      expectedRevenueMnt,
      firstRegisteredAt,
      lastRegisteredAt,
    };
  });
}

export function sortChurchGroups(
  groups: ChurchGroup[],
  key: ChurchSortKey,
  direction: SortDirection,
): ChurchGroup[] {
  return [...groups].sort(
    (a, b) =>
      directed(compare(a[key], b[key]), direction) || collator.compare(a.displayName, b.displayName),
  );
}

/**
 * Pairs of groups whose names are close enough to probably be the same
 * church typed two different ways — surfaced so the admin can fold them
 * together rather than silently double-counting a church.
 */
export function findSimilarGroupPairs(groups: ChurchGroup[]): [ChurchGroup, ChurchGroup][] {
  const pairs: [ChurchGroup, ChurchGroup][] = [];

  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (isCloseChurchName(groups[i].displayName, groups[j].displayName)) {
        pairs.push([groups[i], groups[j]]);
      }
    }
  }

  return pairs;
}

// ─────────────────────────────────────────────────────────────
// Registration (payment) grouping
// ─────────────────────────────────────────────────────────────

export type RegistrationGroup = {
  registrationId: string;
  registrantType: RegistrantType;
  payerName: string;
  payerPhone: string;
  payerEmail: string | null;
  attendeeCount: number;
  totalMnt: number;
  state: MonitorState;
  createdAt: string;
  paidAt: string | null;
  ticketsIssuedAt: string | null;
  bylCheckoutUrl: string | null;
  churches: string[];
  rows: MonitorRow[];
};

export function groupByRegistration(rows: MonitorRow[]): RegistrationGroup[] {
  const buckets = new Map<string, MonitorRow[]>();

  for (const row of rows) {
    const bucket = buckets.get(row.registrationId);
    if (bucket) bucket.push(row);
    else buckets.set(row.registrationId, [row]);
  }

  return [...buckets.values()].map((groupRows) => {
    const first = groupRows[0];
    return {
      registrationId: first.registrationId,
      registrantType: first.registrantType,
      payerName: first.payerName,
      payerPhone: first.payerPhone,
      payerEmail: first.payerEmail,
      // Count the rows actually present rather than the stored
      // `attendee_count`, so a filtered view reports what it's showing.
      attendeeCount: groupRows.length,
      totalMnt: first.totalMnt,
      state: rowState(first),
      createdAt: first.registrationCreatedAt,
      paidAt: first.paidAt,
      ticketsIssuedAt: first.ticketsIssuedAt,
      bylCheckoutUrl: first.bylCheckoutUrl,
      churches: [...new Set(groupRows.map((r) => r.churchName.trim()))].sort(collator.compare),
      rows: groupRows,
    };
  });
}

export function sortRegistrations(
  groups: RegistrationGroup[],
  key: RegistrationSortKey,
  direction: SortDirection,
): RegistrationGroup[] {
  const value = (group: RegistrationGroup): string | number => {
    switch (key) {
      case "payerName":
        return group.payerName;
      case "attendeeCount":
        return group.attendeeCount;
      case "totalMnt":
        return group.totalMnt;
      case "state":
        return STATE_ORDER[group.state];
      case "path":
        return PATH_LABEL[group.registrantType];
      case "createdAt":
        return group.createdAt;
    }
  };

  return [...groups].sort(
    (a, b) => directed(compare(value(a), value(b)), direction) || b.createdAt.localeCompare(a.createdAt),
  );
}

// ─────────────────────────────────────────────────────────────
// Summary + export
// ─────────────────────────────────────────────────────────────

export type MonitorStats = {
  attendees: number;
  paid: number;
  awaiting: number;
  pending: number;
  unpaid: number;
  failed: number;
  checkedIn: number;
  churches: number;
  registrations: number;
  selfRegistered: number;
  viaLeader: number;
  collectedMnt: number;
  outstandingMnt: number;
};

export function computeStats(rows: MonitorRow[]): MonitorStats {
  const churches = new Set<string>();
  const registrations = new Set<string>();

  let paid = 0;
  let awaiting = 0;
  let pending = 0;
  let failed = 0;
  let checkedIn = 0;
  let selfRegistered = 0;
  let viaLeader = 0;
  let collectedMnt = 0;
  let outstandingMnt = 0;

  for (const row of rows) {
    const state = rowState(row);
    churches.add(normalizeChurchName(row.churchName) || row.churchName.trim().toLowerCase());
    registrations.add(row.registrationId);

    if (state === "paid") {
      paid++;
      collectedMnt += row.pricePerAttendeeMnt;
    } else {
      if (state === "awaiting") awaiting++;
      if (state === "pending") pending++;
      if (state === "failed" || state === "expired" || state === "cancelled") failed++;
      outstandingMnt += row.pricePerAttendeeMnt;
    }

    if (row.checkedInAt) checkedIn++;
    if (row.registrantType === "church_leader") viaLeader++;
    else selfRegistered++;
  }

  return {
    attendees: rows.length,
    paid,
    awaiting,
    pending,
    unpaid: rows.length - paid,
    failed,
    checkedIn,
    churches: churches.size,
    registrations: registrations.size,
    selfRegistered,
    viaLeader,
    collectedMnt,
    outstandingMnt,
  };
}

const CSV_COLUMNS: [string, (row: MonitorRow) => string | number | null][] = [
  ["Нэр", (r) => r.fullName],
  ["Анги", (r) => formatGrade(r)],
  ["Сүм", (r) => r.churchName],
  ["Утас", (r) => r.phone],
  ["Эцэг эхийн утас", (r) => r.parentPhone],
  ["Бүртгэсэн арга", (r) => PATH_LABEL[r.registrantType]],
  ["Төлөгч", (r) => r.payerName],
  ["Төлөгчийн утас", (r) => r.payerPhone],
  ["Төлөгчийн имэйл", (r) => r.payerEmail],
  ["Төлөв", (r) => STATE_LABEL[rowState(r)]],
  ["Тасалбарын код", (r) => r.ticketCode],
  ["Ирсэн эсэх", (r) => (r.checkedInAt ? "Тийм" : "Үгүй")],
  ["Төлбөр (₮)", (r) => r.pricePerAttendeeMnt],
  ["Бүртгүүлсэн", (r) => r.registrationCreatedAt],
  ["Бүртгэлийн дугаар", (r) => r.registrationId],
];

function csvCell(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Builds a UTF-8 BOM'd CSV so Excel opens the Cyrillic columns correctly. */
export function toCsv(rows: MonitorRow[]): string {
  const lines = [CSV_COLUMNS.map(([header]) => csvCell(header)).join(",")];

  for (const row of rows) {
    lines.push(CSV_COLUMNS.map(([, read]) => csvCell(read(row))).join(","));
  }

  return `﻿${lines.join("\r\n")}`;
}

"use client";

import { Loader2, Search, TicketCheck } from "lucide-react";
import * as React from "react";

import { searchDoor } from "@/lib/admin/actions";
import { formatCheckInTime, parseTicketCode, type DoorSearchHit } from "@/lib/admin/checkIn";
import { formatGrade } from "@/lib/registration/grade";

export function DoorSearch({
  onCheckIn,
  onCode,
  busyId,
  autoFocus = true,
}: {
  onCheckIn: (hit: DoorSearchHit) => void;
  onCode: (code: string) => void;
  busyId: string | null;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<DoorSearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const code = parseTicketCode(query);
  const searching = query.trim().length >= 2;
  const visible = searching ? hits : [];

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const response = await searchDoor(q);
      if (cancelled) return;
      setLoading(false);
      if (response.ok) {
        setHits(response.data.hits);
        setError(null);
      } else {
        setError(response.message);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="grid grid-cols-1 gap-3">
      <label className="relative block">
        <span className="sr-only">Нэр, утас эсвэл тасалбарын код</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Нэр, утас эсвэл код"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          className="h-13 w-full rounded-2xl border border-white/15 bg-white/5 pr-12 pl-12 text-base text-white outline-none placeholder:text-white/35 focus:border-white/40"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-white/50" />
        )}
      </label>

      {code && (
        <button
          type="button"
          onClick={() => {
            onCode(code);
            setQuery("");
          }}
          className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-neutral-950"
        >
          <TicketCheck className="size-5" />
          {code} кодоор оруулах
        </button>
      )}

      {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>}

      {searching && !loading && hits.length === 0 && !error && !code && (
        <p className="py-6 text-center text-sm text-white/45">«{query.trim()}» олдсонгүй.</p>
      )}

      <ul className="grid grid-cols-1 gap-2">
        {visible.map((hit) => (
          <li key={hit.attendeeId} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{hit.fullName}</p>
              <p className="truncate text-sm text-white/55">
                {formatGrade(hit)}, {hit.churchName}
                {hit.phoneTail ? `, ••${hit.phoneTail}` : ""}
              </p>
            </div>

            {hit.checkedInAt ? (
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/70">
                {formatCheckInTime(hit.checkedInAt)}-д орсон
              </span>
            ) : hit.paid ? (
              <button
                type="button"
                onClick={() => onCheckIn(hit)}
                disabled={busyId === hit.attendeeId}
                className="h-10 shrink-0 rounded-full bg-emerald-500 px-4 text-sm font-bold text-emerald-950 disabled:opacity-60"
              >
                {busyId === hit.attendeeId ? <Loader2 className="size-4 animate-spin" /> : "Оруулах"}
              </button>
            ) : (
              <span className="shrink-0 rounded-full bg-red-500/20 px-3 py-1.5 text-sm font-semibold text-red-200">
                Төлөөгүй
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

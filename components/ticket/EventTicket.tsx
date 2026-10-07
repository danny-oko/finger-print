"use client";

import { CheckCircle2 } from "lucide-react";
import * as React from "react";

import { typewriter } from "@/lib/fonts";
import { formatGrade, type AttendeeRole } from "@/lib/registration/grade";
import { qrShapes } from "@/lib/ticket/qrSvg";
import { TICKET_GRADIENT, TICKET_GRAIN } from "@/lib/ticket/texture";
import { cn } from "@/lib/utils";

// Portrait is the landscape card turned a quarter clockwise: the left notch
// moves to the top, the perforation to the top of the stub, the stub's
// notch to the bottom. Notches are cut with masks, so they show whatever
// page the ticket sits on.
const TOOTH = 6;
export const TICKET_SHAPES = {
  "--body-mask-v": "radial-gradient(circle at 50% 0, transparent 16px, #000 16.5px)",
  "--body-mask-h": "radial-gradient(circle at 0 50%, transparent 18px, #000 18.5px)",
  "--stub-mask-v": [
    `conic-gradient(from 0deg at 50% 0, transparent 143.13deg, #000 0 216.87deg, transparent 0) 0 0 / 9px ${TOOTH}px repeat-x`,
    `radial-gradient(circle at 50% 100%, transparent 16px, #000 16.5px) 0 ${TOOTH}px / 100% calc(100% - ${TOOTH}px) no-repeat`,
  ].join(", "),
  "--stub-mask-h": [
    `conic-gradient(from 0deg at 0 50%, transparent 53.13deg, #000 0 126.87deg, transparent 0) 0 0 / ${TOOTH}px 9px repeat-y`,
    `radial-gradient(circle at 100% 50%, transparent 18px, #000 18.5px) ${TOOTH}px 0 / calc(100% - ${TOOTH}px) 100% no-repeat`,
  ].join(", "),
} as React.CSSProperties;

export type EventTicketProps = {
  fullName: string;
  grade: number | null;
  role: AttendeeRole;
  churchName: string;
  ticketCode: string | null;
  checkedIn: boolean;
  invited?: boolean;
  // Take the parent's height and let the QR absorb whatever is left, for
  // screens that must not scroll.
  fill?: boolean;
  className?: string;
};

function TicketQr({ code, className }: { code: string; className?: string }) {
  const { extent, modules, finders } = React.useMemo(() => qrShapes(code), [code]);

  return (
    <svg
      viewBox={`0 0 ${extent} ${extent}`}
      role="img"
      aria-label={`QR тасалбар ${code}`}
      className={cn("fill-neutral-950", className)}
    >
      <path d={modules} />
      <path d={finders} fillRule="evenodd" />
    </svg>
  );
}

function Grain({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 print:hidden", className)}
      style={{ backgroundImage: TICKET_GRAIN, backgroundSize: "180px 180px" }}
    />
  );
}

function RuledLine({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <p className={cn("flex min-w-0 items-end gap-2", className)}>
      <span className="shrink-0 font-bold">{label}:</span>
      <span className="min-w-0 flex-1 truncate border-b border-neutral-950/75 pb-px pl-1 leading-tight">
        {value}
      </span>
    </p>
  );
}

export function EventTicket({
  fullName,
  grade,
  role,
  churchName,
  ticketCode,
  checkedIn,
  invited = false,
  fill = false,
  className,
}: EventTicketProps) {
  // In fill mode on a short viewport (a phone with its browser bars showing)
  // the ticket sheds the duplicate name line and some padding first, so the
  // QR can hold its floor; past that, the slide scrolls rather than shrink it.
  return (
    <div
      className={cn(
        "@container w-full",
        fill && "flex h-full flex-col justify-center print:block print:h-auto",
        className,
      )}
    >
      <article
        style={TICKET_SHAPES}
        className={cn(
          "relative flex w-full flex-col [print-color-adjust:exact] @xl:flex-row print:break-inside-avoid",
          fill && "flex-1 @xl:flex-none print:flex-none",
        )}
      >
        <div
          className={cn(
            "relative flex shrink-0 flex-col overflow-hidden rounded-t-[1.25rem] bg-neutral-950 px-5 pt-6 pb-4 text-left [mask:var(--body-mask-v)] print:[mask:none]",
            "@xl:min-w-0 @xl:flex-1 @xl:rounded-tr-none @xl:rounded-bl-[1.25rem] @xl:py-8 @xl:pr-8 @xl:pl-12 @xl:[mask:var(--body-mask-h)] print:@xl:[mask:none]",
            fill && "[@media(max-height:700px)]:pt-5 [@media(max-height:700px)]:pb-3",
          )}
          style={{
            backgroundImage:
              "radial-gradient(120% 90% at 100% 100%, rgb(233 113 16 / 0.18), transparent 60%)",
          }}
        >
          <Grain className="opacity-[0.18] mix-blend-screen" />

          <div className="relative flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#F98C01] @xl:text-xs">
              2026.10.10<span className="hidden @xs:inline"> · FINGER PRINT</span>
            </p>
            {invited && (
              <span className="-mt-0.5 shrink-0 rounded-full border border-[#F98C01]/40 bg-[#F98C01]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#F9A43A]">
                Урилга
              </span>
            )}
          </div>

          <div className="relative mt-2 @xl:my-auto @xl:py-6">
            <p
              className={cn(
                "line-clamp-2 text-xl leading-tight font-bold break-words text-white @xl:line-clamp-3 @xl:text-3xl @xl:font-black",
                fill && "[@media(max-height:700px)]:text-lg",
              )}
            >
              {fullName}
            </p>
            <p className="mt-1 truncate text-xs text-neutral-400 @xl:mt-2 @xl:text-sm">
              {formatGrade({ grade, role })} · {churchName}
            </p>
          </div>

          <div
            className={cn(
              "relative mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 @xl:mt-0",
              fill && "[@media(max-height:600px)]:mt-1.5 [@media(max-height:600px)]:gap-y-1",
            )}
          >
            {ticketCode && (
              <p
                className={cn(
                  typewriter.className,
                  "text-[15px] font-bold tracking-[0.1em] text-[#F98C01] @xl:text-lg @xl:tracking-[0.12em]",
                )}
              >
                {ticketCode}
              </p>
            )}
            {checkedIn && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 @xl:px-2.5 @xl:text-[11px]">
                <CheckCircle2 className="size-3" />
                Ирсэн бүртгэл хийгдсэн
              </span>
            )}
          </div>
        </div>

        <div
          className={cn(
            "relative z-10 -mt-1.5 flex flex-col overflow-hidden rounded-b-[1.25rem] px-6 pt-5 pb-6 text-neutral-950 [mask:var(--stub-mask-v)] print:[mask:none]",
            "@xl:mt-0 @xl:-ml-1.5 @xl:w-[40%] @xl:shrink-0 @xl:rounded-bl-none @xl:rounded-tr-[1.25rem] @xl:py-8 @xl:pr-10 @xl:pl-9 @xl:[mask:var(--stub-mask-h)] print:@xl:[mask:none]",
            fill &&
              "flex-1 justify-between @xl:flex-none print:flex-none [@media(max-height:700px)]:pt-4 [@media(max-height:700px)]:pb-5 [@media(max-height:600px)]:pt-3",
          )}
          style={{ backgroundImage: TICKET_GRADIENT }}
        >
          <Grain className="opacity-60 mix-blend-overlay" />

          <div
            className={cn(
              typewriter.className,
              "relative grid shrink-0 grid-cols-[minmax(0,1fr)] gap-1.5 text-[13px] @xl:gap-2",
            )}
          >
            <RuledLine
              label="Name"
              value={fullName}
              className={cn(fill && "[@media(max-height:700px)]:hidden")}
            />
            <RuledLine
              label="Date"
              value="2026.10.10"
              className={cn(fill && "[@media(max-height:600px)]:hidden")}
            />
          </div>

          <div
            className={cn(
              "relative mt-3 w-full @xl:mt-5",
              fill
                ? "max-h-[20rem] min-h-[9.5rem] flex-[1_1_9.5rem] [@media(max-height:700px)]:mt-2"
                : "mx-auto aspect-square max-w-[18rem]",
              "@xl:mx-auto @xl:aspect-square @xl:max-h-none @xl:min-h-0 @xl:max-w-[13rem] @xl:flex-none",
              "print:mx-auto print:aspect-square print:max-h-none print:min-h-0 print:max-w-[13rem] print:flex-none",
            )}
          >
            {ticketCode ? (
              <TicketQr code={ticketCode} className="absolute inset-0 size-full" />
            ) : (
              <p className="absolute inset-0 m-auto grid aspect-square max-h-full max-w-full place-items-center rounded-2xl border border-dashed border-neutral-950/40 px-4 text-center text-xs font-medium">
                Тасалбар бэлтгэж байна…
              </p>
            )}
          </div>

          <p className="relative mt-2 shrink-0 text-center text-[11px] font-medium tracking-wide text-balance @xl:mt-3">
            “Хурууны Хээ” – Өсвөрийн семинар
          </p>
        </div>
      </article>
    </div>
  );
}

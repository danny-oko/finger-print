"use client";

import { ChevronDown, CircleQuestionMark } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "fp-admin-help-open";

// localStorage is an external store, so it's read through
// useSyncExternalStore rather than copied into state on mount — that keeps
// the server render (closed) and the first client render honest.
let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function readOpen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private mode — the strip just starts closed every time.
    return false;
  }
}

function writeOpen(open: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
  } catch {
    // Nothing to remember with; the toggle still works this session.
  }
  listeners.forEach((listener) => listener());
}

const TABS = [
  {
    name: "Хүмүүс",
    body: "Бүртгүүлсэн хүн бүр нэг мөр. Нэр, анги, утас буруу бол мөрийн баруун талын ⋯ товчоор засна. Ирээгүй хүнийг мөн эндээс хасна.",
  },
  {
    name: "Сүмээр",
    body: "Аль цуглаанаас хэдэн хүн бүртгүүлснийг харна. Нэг цуглааны нэр хоёр янзаар бичигдсэн бол нийлүүлж болно.",
  },
  {
    name: "Төлбөрөөр",
    body: "Нэг төлбөр = нэг бүртгэл. Хүн нэмэх, төлөгдөөгүй бүртгэлийг цуцлах, устгах үйлдлийг эндээс хийнэ.",
  },
];

export function HelpStrip() {
  const open = React.useSyncExternalStore(subscribe, readOpen, () => false);

  function toggle() {
    writeOpen(!open);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
      >
        <CircleQuestionMark className="size-4 shrink-0 text-neutral-400" />
        <span className="flex-1 text-sm font-medium text-neutral-700">
          Энэ хуудсыг хэрхэн ашиглах вэ?
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <dl className="grid gap-3 border-t border-neutral-100 px-4 py-3 sm:grid-cols-3">
          {TABS.map((tab) => (
            <div key={tab.name}>
              <dt className="text-sm font-bold text-neutral-900">{tab.name}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                {tab.body}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

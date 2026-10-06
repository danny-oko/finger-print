"use client";

import { User, Users } from "lucide-react";

import type { RegistrationMode } from "@/lib/registration/schema";
import { cn } from "@/lib/utils";

const OPTIONS: { value: RegistrationMode; title: string; body?: string; Icon: typeof User }[] = [
  { value: "self", title: "Ганцаараа бүртгүүлэх", Icon: User },
  {
    value: "group",
    title: "Хамтдаа бүртгүүлэх",
    body: "Цуглааныхаа ахлагч болон өсвөрийн найзуудтайгаа хамтдаа бүртгүүлэх",
    Icon: Users,
  },
];

export function ModeChoice({
  value,
  onChange,
}: {
  value: RegistrationMode;
  onChange: (mode: RegistrationMode) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Хэнийг бүртгүүлэх вэ" className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map(({ value: option, title, body, Icon }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
              selected ? "border-ink bg-white" : "border-black/10 bg-mist/60 hover:border-black/25",
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                selected ? "bg-brand text-ink" : "bg-white text-ink/60",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold text-ink">{title}</span>
              {body && <span className="mt-0.5 block text-sm leading-snug text-ink/60">{body}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

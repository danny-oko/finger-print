"use client";

import { Copy, Send } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { showShareToast } from "@/components/come/ShareToast";
import { trackEvent } from "@/lib/analytics/client";
import { cleanFriendName, comePath, FRIEND_NAME_MAX } from "@/lib/come/friendName";

function shareText(to: string | null): string {
  const invite = "чи надтай хамт Хурууны хээ-д урилгатай шүүү! 🥺💌";
  return to ? `${to}, ${invite}` : `Хөөе, ${invite}`;
}

const subscribeNever = () => () => {};

// In-app browsers (Messenger, Instagram) often refuse the async clipboard API
// but still honour the old selection-based copy.
function copyBySelection(text: string): boolean {
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    el.remove();
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyBySelection(text);
  }
}

export function ShareInvite() {
  const [name, setName] = React.useState("");
  // navigator.share only exists in the browser, so the button appears after
  // hydration instead of mismatching the server render.
  const canShare = React.useSyncExternalStore(
    subscribeNever,
    () => typeof navigator.share === "function",
    () => false,
  );

  const to = cleanFriendName(name);
  const link = () => `${window.location.origin}${comePath(to)}`;

  const copy = async () => {
    const url = link();
    showShareToast((await copyText(url)) ? "copied" : "manual", url);
    trackEvent("come_shared", { method: "copy", named: Boolean(to) });
  };

  const share = async () => {
    const url = link();
    try {
      await navigator.share({ title: "Хурууны хээ 2026", text: shareText(to), url });
      showShareToast("shared", url);
      trackEvent("come_shared", { method: "native", named: Boolean(to) });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  };

  return (
    <section className="relative rounded-[1.75rem] border-2 border-dashed border-[#14161A]/40 bg-white/60 p-4 backdrop-blur-sm short:py-3">
      <div className="flex items-center gap-3">
        <Image
          src="/come/heart-hands.gif"
          alt=""
          width={48}
          height={48}
          unoptimized
          className="size-10 shrink-0 short:size-8"
        />
        <div className="min-w-0">
          <h2 className="leading-tight font-black">Найзаа дагуулаад ир!</h2>
          <p className="mt-0.5 truncate text-xs text-neutral-600">
            {to
              ? `${to} өөрийн нэртэй урилга авна 💌`
              : "Найзынхаа нэрийг бичээд илгээ."}
          </p>
        </div>
      </div>

      <label className="mt-3 block short:mt-2">
        <span className="sr-only">Найзын нэр</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={FRIEND_NAME_MAX}
          placeholder="Найзынхаа нэр (жишээ нь: Болд)"
          autoComplete="off"
          enterKeyHint="done"
          className="h-11 w-full rounded-2xl border-2 border-[#14161A] bg-white px-4 text-base font-semibold outline-none placeholder:font-normal placeholder:text-neutral-400 focus:ring-4 focus:ring-[#37A8C4]/30 short:h-10"
        />
      </label>

      <div className="mt-2.5 flex gap-2 short:mt-2">
        {canShare && (
          <button
            type="button"
            onClick={share}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#14161A] bg-[#37A8C4] font-black text-white shadow-[3px_3px_0_#14161A] transition-transform active:translate-y-0.5 short:h-10"
          >
            <Send className="size-4" />
            Илгээх
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#14161A] bg-white font-black whitespace-nowrap shadow-[3px_3px_0_#14161A] transition-transform active:translate-y-0.5 short:h-10"
        >
          <Copy className="size-4" />
          {canShare ? "Хуулах" : "Холбоос хуулах"}
        </button>
      </div>
    </section>
  );
}

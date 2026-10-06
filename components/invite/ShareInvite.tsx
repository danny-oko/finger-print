"use client";

import { Copy, Send } from "lucide-react";
import * as React from "react";

import { showShareToast } from "@/components/invite/ShareToast";
import { trackEvent } from "@/lib/analytics/client";
import { cleanFriendName, invitePath, FRIEND_NAME_MAX } from "@/lib/invite/friendName";
import { EVENT } from "@/lib/event";

function shareText(to: string | null): string {
  const invite = `${EVENT.name} чуулганд хамт явъя. ${EVENT.dateLong}, ${EVENT.time}.`;
  return to ? `${to}, ${invite}` : invite;
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
  const link = () => `${window.location.origin}${invitePath(to)}`;

  const copy = async () => {
    const url = link();
    showShareToast((await copyText(url)) ? "copied" : "manual", url);
    trackEvent("come_shared", { method: "copy", named: Boolean(to) });
  };

  const share = async () => {
    const url = link();
    try {
      await navigator.share({ title: EVENT.name, text: shareText(to), url });
      showShareToast("shared", url);
      trackEvent("come_shared", { method: "native", named: Boolean(to) });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  };

  return (
    <section className="rounded-3xl bg-white px-6 py-5 shadow-[0_1px_2px_rgba(21,23,28,0.06)] short:py-4">
      <h2 className="text-[17px] font-semibold text-ink">Найзаа урих</h2>
      <p className="mt-0.5 text-sm leading-snug text-ink/60 short:hidden">
        Найзынхаа нэрийг бичвэл урилга дээр нь нэр нь гарна.
      </p>

      <label className="mt-3 block">
        <span className="sr-only">Найзын нэр</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={FRIEND_NAME_MAX}
          placeholder="Найзын нэр (заавал биш)"
          autoComplete="off"
          enterKeyHint="done"
          className="h-11 w-full rounded-xl border border-black/15 bg-white px-4 text-base outline-none placeholder:text-ink/40 focus:border-ink focus:ring-[3px] focus:ring-ink/10"
        />
      </label>

      <div className="mt-2 flex gap-2">
        {canShare && (
          <button
            type="button"
            onClick={share}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Send className="size-4" />
            Илгээх
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-black/15 text-[15px] font-semibold whitespace-nowrap text-ink hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink"
        >
          <Copy className="size-4" />
          Холбоос хуулах
        </button>
      </div>
    </section>
  );
}

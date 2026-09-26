"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const INVITE_SEGMENT = /\/invited\/[^/]+/i;

// The invite token is the whole secret behind a free ticket, and it sits in
// the URL — which every page view and custom event carries.
function redactInviteToken(event: BeforeSendEvent): BeforeSendEvent {
  let url: URL;
  try {
    url = new URL(event.url, window.location.origin);
  } catch {
    return event;
  }

  if (!INVITE_SEGMENT.test(url.pathname)) return event;

  url.pathname = url.pathname.replace(INVITE_SEGMENT, "/invited/[token]");
  url.search = "";
  url.hash = "";
  return { ...event, url: url.toString() };
}

export function SiteAnalytics() {
  return <Analytics debug={false} beforeSend={redactInviteToken} />;
}

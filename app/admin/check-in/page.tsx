import type { Metadata, Viewport } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { CheckInScanner } from "@/components/admin/CheckInScanner";
import { isAdminAuthDisabled, isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Хаалганы бүртгэл | Finger Print",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export const dynamic = "force-dynamic";

/**
 * The scanner staff run on their own phones at the door. Same session as the
 * registration monitor, so signing in once covers both.
 */
export default async function CheckInPage() {
  const unprotected = isAdminAuthDisabled();
  const authenticated = await isAdminAuthenticated();

  if (unprotected) {
    console.warn(
      "[admin] ADMIN_PASSWORD is not set — /admin/check-in is open to anyone with the URL.",
    );
  }

  return authenticated ? <CheckInScanner unprotected={unprotected} /> : <AdminLogin />;
}

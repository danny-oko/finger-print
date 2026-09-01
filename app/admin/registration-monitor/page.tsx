import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { RegistrationMonitor } from "@/components/admin/RegistrationMonitor";
import { isAdminAuthDisabled, isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Бүртгэлийн хяналт | Finger Print",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RegistrationMonitorPage() {
  // No ADMIN_PASSWORD set means the login is off and the dashboard is open.
  // Setting that one env var turns it back on — no code change needed.
  const unprotected = isAdminAuthDisabled();
  const authenticated = await isAdminAuthenticated();

  if (unprotected) {
    console.warn(
      "[admin] ADMIN_PASSWORD is not set — /admin/registration-monitor is open to anyone with the URL.",
    );
  }

  return authenticated ? <RegistrationMonitor unprotected={unprotected} /> : <AdminLogin />;
}

import type { Metadata } from "next";

import { AdminHome } from "@/components/admin/AdminHome";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { isAdminAuthDisabled, isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Админ | Finger Print",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const unprotected = isAdminAuthDisabled();
  const authenticated = await isAdminAuthenticated();

  if (unprotected) {
    console.warn("[admin] ADMIN_PASSWORD is not set — /admin is open to anyone with the URL.");
  }

  return authenticated ? <AdminHome unprotected={unprotected} /> : <AdminLogin />;
}

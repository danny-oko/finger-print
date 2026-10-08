import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { StaffRegistration } from "@/components/admin/StaffRegistration";
import { isAdminAuthDisabled, isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Шинэ бүртгэл | Finger Print",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminRegisterPage() {
  const unprotected = isAdminAuthDisabled();
  const authenticated = await isAdminAuthenticated();

  if (unprotected) {
    console.warn(
      "[admin] ADMIN_PASSWORD is not set — /admin/register is open to anyone with the URL.",
    );
  }

  return authenticated ? <StaffRegistration unprotected={unprotected} /> : <AdminLogin />;
}

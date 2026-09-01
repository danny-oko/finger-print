import type { Metadata } from "next";

// import { AdminLogin } from "@/components/admin/AdminLogin";
import { RegistrationMonitor } from "@/components/admin/RegistrationMonitor";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Бүртгэлийн хяналт | Finger Print",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RegistrationMonitorPage() {
  const authenticated = await isAdminAuthenticated();

  return <RegistrationMonitor />;
  // return authenticated ? <RegistrationMonitor /> : <AdminLogin />;
}

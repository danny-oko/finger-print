import type { Metadata, Viewport } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { LotteryStage } from "@/components/admin/lottery/LotteryStage";
import { isAdminAuthDisabled, isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Сугалаа | Finger Print",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export const dynamic = "force-dynamic";

export default async function LotteryPage() {
  const unprotected = isAdminAuthDisabled();
  const authenticated = await isAdminAuthenticated();

  return authenticated ? <LotteryStage unprotected={unprotected} /> : <AdminLogin />;
}

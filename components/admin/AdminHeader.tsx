"use client";

import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AdminHeader({
  title,
  back,
  unprotected = false,
}: {
  title: string;
  back?: string;
  unprotected?: boolean;
}) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-3">
        {back && (
          <Button asChild variant="ghost" size="icon" aria-label="Буцах" title="Буцах">
            <Link href={back}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}

        <h1 className="min-w-0 flex-1 truncate text-base font-black text-neutral-900 sm:text-lg">
          {title}
        </h1>

        {!unprotected && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={signOut}
            aria-label="Гарах"
            title="Гарах"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}

import { ChevronRight, Gift, ScanLine, Table2, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/AdminHeader";

const SECTIONS: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/admin/registration-monitor",
    title: "Бүртгэлийн хяналт",
    description: "Бүх бүртгэл, төлбөр, бүртгэлийн тохиргоо",
    icon: Table2,
  },
  {
    href: "/admin/register",
    title: "Шинэ бүртгэл",
    description: "Хүн эсвэл бүлгийг газар дээр нь бүртгэх",
    icon: UserPlus,
  },
  {
    href: "/admin/check-in",
    title: "Хаалганы бүртгэл",
    description: "QR тасалбар уншиж ирц бүртгэх",
    icon: ScanLine,
  },
  {
    href: "/admin/lottery",
    title: "Сугалаа",
    description: "Ирсэн хүмүүсээс азтан сугалах",
    icon: Gift,
  },
];

export function AdminHome({ unprotected = false }: { unprotected?: boolean }) {
  return (
    <main className="min-h-dvh bg-neutral-50">
      <AdminHeader title="Админ" unprotected={unprotected} />

      <nav aria-label="Админ цэс" className="mx-auto w-full max-w-2xl px-4 py-6">
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {SECTIONS.map(({ href, title, description, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC]">
                  <Icon className="size-5 text-[#F98C01]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-neutral-900">{title}</span>
                  <span className="block truncate text-sm text-neutral-500">{description}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-neutral-400" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}

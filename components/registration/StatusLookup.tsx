"use client";

import { ChevronRight, Loader2, Search } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMnt } from "@/lib/registration/pricing";

type Attendee = {
  id: string;
  full_name: string;
  age: number;
  grade: number;
  church_name: string;
};

type Registration = {
  id: string;
  registrant_type: string;
  payer_name: string;
  payer_phone: string;
  attendee_count: number;
  total_mnt: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired" | "cancelled";
  created_at: string;
  attendees: Attendee[];
};

const STATUS_LABEL: Record<Registration["status"], string> = {
  pending: "Төлбөр хүлээгдэж байна",
  paid: "Төлбөр төлөгдсөн",
  failed: "Амжилтгүй",
  expired: "Хугацаа дууссан",
  cancelled: "Цуцлагдсан",
};

const STATUS_VARIANT: Record<Registration["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-neutral-200 text-neutral-700",
};

export function StatusLookup() {
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length !== 8) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/registration/lookup?phone=${phone}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setRegistrations(data.registrations ?? []);
      setSearched(true);
    } catch {
      setError("Хайлт хийхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
          inputMode="tel"
          maxLength={8}
          placeholder="Утасны дугаараа оруулна уу"
          className="h-11"
        />
        <Button type="submit" size="lg" disabled={phone.length !== 8 || loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Хайх
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {searched && !error && registrations.length === 0 && (
        <p className="text-center text-muted-foreground">
          Энэ дугаараар бүртгэл олдсонгүй. Дугаараа шалгаад дахин оролдоно уу.
        </p>
      )}

      <div className="grid gap-4">
        {registrations.map((reg) => (
          <Card
            key={reg.id}
            className="border-neutral-200 transition-colors hover:border-[#F98C01]"
          >
            {/* The whole card is the tap target — on a phone a small
                "details" link is a needlessly precise thing to hit. */}
            <a href={`/event/registration/${reg.id}`} className="block">
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{reg.payer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reg.created_at).toLocaleDateString("mn-MN")}
                  </p>
                </div>
                <Badge className={STATUS_VARIANT[reg.status]}>
                  {STATUS_LABEL[reg.status]}
                </Badge>
              </div>

              <ul className="grid gap-1 text-sm">
                {reg.attendees.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-muted-foreground">
                    <span>
                      {a.full_name} · {a.grade}-р анги · {a.church_name}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <span className="text-sm text-muted-foreground">{reg.attendee_count} хүн</span>
                <span className="font-bold text-[#F98C01]">{formatMnt(reg.total_mnt)}</span>
              </div>
              <span className="flex items-center justify-center gap-1 text-xs font-medium text-[#F98C01]">
                Дэлгэрэнгүй харах <ChevronRight className="size-3" />
              </span>
            </CardContent>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}

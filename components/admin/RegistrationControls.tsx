"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import type { AdminSettingsResponse } from "@/app/api/admin/settings/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadRegistrationSettings, saveRegistrationSettings } from "@/lib/admin/actions";
import type { RegistrationState, SettingsPatch } from "@/lib/registration/settings";
import { cn } from "@/lib/utils";

const STATES: { value: RegistrationState; label: string; hint: string }[] = [
  { value: "open", label: "Нээлттэй", hint: "Хүн бүр бүртгүүлж болно." },
  { value: "paused", label: "Түр зогсоох", hint: "Төлбөрийн асуудал гэх мэт үед. Маягт хадгалагдана." },
  { value: "closed", label: "Хаах", hint: "Бүртгэл дууссан. Урилгын холбоос ажилласаар байна." },
];

const QUEUE_REASON: Record<string, string> = {
  disabled: "Унтраасан",
  no_secret: "QUEUE_SECRET тохируулаагүй",
  no_shared_store: "Redis холбогдоогүй (Upstash) — идэвхгүй",
};

const STATUS_LINE: Record<string, string> = {
  open: "Нээлттэй",
  paused: "Түр зогссон",
  closed: "Хаагдсан",
  sold_out: "Суудал дүүрсэн",
};

export function RegistrationControls({ refreshKey }: { refreshKey: string | null }) {
  const [data, setData] = React.useState<AdminSettingsResponse | null>(null);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [capacity, setCapacity] = React.useState("");
  const [rate, setRate] = React.useState("");

  const sync = React.useCallback((next: AdminSettingsResponse) => {
    setData(next);
    setCapacity(next.settings.capacity ? String(next.settings.capacity) : "");
    setRate(String(next.settings.queue.admitPerMinute));
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    loadRegistrationSettings().then((result) => {
      if (!cancelled && result.ok) sync(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, sync]);

  async function save(patch: SettingsPatch, done: string) {
    setSaving(true);
    const result = await saveRegistrationSettings(patch);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    sync(result.data);
    toast.success(done);
  }

  if (!data) return null;

  const { settings, availability, queue, queueStats } = data;
  const seats =
    availability.capacity !== null
      ? `${availability.capacity - (availability.seatsLeft ?? 0)} / ${availability.capacity} суудал`
      : "Хязгааргүй";

  return (
    <section className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left"
      >
        <span className="font-bold">Бүртгэлийн тохиргоо</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            availability.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800",
          )}
        >
          {STATUS_LINE[availability.status]}
        </span>
        <span className="text-xs text-neutral-500">{seats}</span>
        <span className="text-xs text-neutral-500">
          Дараалал:{" "}
          {queue.active
            ? `${queueStats?.waiting ?? 0} хүлээж байна, минутад ${queue.admitPerMinute}`
            : QUEUE_REASON[queue.reason]}
        </span>
        <ChevronDown className={cn("ml-auto size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="grid gap-5 border-t border-neutral-200 px-4 py-4">
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Бүртгэлийн төлөв</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {STATES.map((state) => (
                <button
                  key={state.value}
                  type="button"
                  disabled={saving || settings.state === state.value}
                  onClick={() => void save({ state: state.value }, `Бүртгэл: ${state.label}`)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors disabled:cursor-default",
                    settings.state === state.value
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 hover:border-neutral-400",
                  )}
                >
                  <span className="block text-sm font-semibold">{state.label}</span>
                  <span className={cn("block text-xs", settings.state === state.value ? "text-white/70" : "text-neutral-500")}>
                    {state.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const value = capacity.trim() ? Number(capacity) : null;
              if (value !== null && (!Number.isInteger(value) || value < 1)) {
                toast.error("Суудлын тоо эерэг бүхэл тоо байна.");
                return;
              }
              void save({ capacity: value }, value ? `Суудал: ${value}` : "Суудлын хязгаар хасагдлаа");
            }}
          >
            <label htmlFor="capacity" className="text-sm font-semibold">
              Нийт суудал
            </label>
            <p className="text-xs text-neutral-500">
              Төлсөн болон төлбөр хүлээгдэж буй (45 мин, нэхэмжлэх 24 цаг) бүртгэлүүд суудал эзэлнэ. Хоосон бол хязгааргүй.
            </p>
            <div className="flex gap-2">
              <Input
                id="capacity"
                inputMode="numeric"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
                placeholder="Хязгааргүй"
                className="h-10 max-w-40"
              />
              <Button type="submit" variant="outline" className="h-10" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Хадгалах"}
              </Button>
            </div>
          </form>

          <form
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(rate);
              if (!Number.isInteger(value) || value < 1 || value > 600) {
                toast.error("1-600 хооронд тоо оруулна уу.");
                return;
              }
              void save({ queue: { admitPerMinute: value } }, `Дараалал: минутад ${value} хүн`);
            }}
          >
            <label htmlFor="queue-rate" className="text-sm font-semibold">
              Дараалал — минутад нэвтрүүлэх хүн
            </label>
            <p className="text-xs text-neutral-500">
              Олон хүн зэрэг төлбөр рүү орох үед энэ хурдаар ээлжлэн оруулна. Сул үед хэн ч хүлээхгүй. Cloudflare
              D1-ийн хязгаар (5 минутад 1200 хүсэлт) хэтэрвэл бүх систем 5 минут зогсдог тул 20 орчим байлгана уу.
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                id="queue-rate"
                inputMode="numeric"
                value={rate}
                onChange={(e) => setRate(e.target.value.replace(/\D/g, ""))}
                className="h-10 max-w-24"
              />
              <Button type="submit" variant="outline" className="h-10" disabled={saving}>
                Хадгалах
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10"
                disabled={saving}
                onClick={() =>
                  void save(
                    { queue: { mode: settings.queue.mode === "off" ? "auto" : "off" } },
                    settings.queue.mode === "off" ? "Дараалал асаалаа" : "Дараалал унтраалаа",
                  )
                }
              >
                {settings.queue.mode === "off" ? "Дараалал асаах" : "Дараалал унтраах"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

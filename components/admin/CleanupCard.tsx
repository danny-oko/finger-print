"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { previewCleanup, runCleanup } from "@/lib/admin/actions";

const STALE_AFTER_HOURS = 24;

type Stale = {
  id: string;
  payerName: string;
  attendeeCount: number;
  status: string;
  createdAt: string;
};

/**
 * Checkouts and invoices opened and never paid. Nothing expires them, so they
 * accumulate and read like people who are about to pay.
 */
export function CleanupCard({
  refreshKey,
  onDone,
}: {
  refreshKey: string | null;
  onDone: () => void;
}) {
  const [stale, setStale] = React.useState<Stale[]>([]);
  const [confirming, setConfirming] = React.useState(false);
  const [working, setWorking] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    previewCleanup(STALE_AFTER_HOURS).then((result) => {
      if (cancelled || !result.ok) return;
      setStale(result.data.registrations);
    });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (stale.length === 0) return null;

  async function handleDelete() {
    setWorking(true);
    const result = await runCleanup(stale.map((s) => s.id));
    setWorking(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(`${result.data.deleted} ашиглагдаагүй бүртгэл устлаа`);
    setConfirming(false);
    setStale([]);
    onDone();
  }

  const names = stale.slice(0, 5).map((s) => s.payerName);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-900">
            Ашиглагдаагүй нэхэмжлэх — {stale.length}
          </p>
          <p className="text-xs text-neutral-500">
            {STALE_AFTER_HOURS} цагийн өмнө үүссэн ч төлбөр нь хийгдээгүй.
            Устгавал жагсаалт цэвэрхэн болно — төлсөн бүртгэлд огт хамаагүй.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-3.5" />
          Бүгдийг устгах
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        working={working}
        title={`${stale.length} бүртгэлийг устгах уу?`}
        confirmLabel="Тийм, устга"
        body={
          <>
            <p>
              Эдгээр нь төлбөр нь хийгдээгүй бүртгэлүүд. Устгасны дараа буцаах
              боломжгүй.
            </p>
            <p className="text-neutral-700">{names.join(", ")}
              {stale.length > names.length
                ? ` болон бусад ${stale.length - names.length}`
                : ""}
            </p>
            <p>Төлбөр төлсөн бүртгэл, тасалбарууд хэвээр үлдэнэ.</p>
          </>
        }
        onConfirm={handleDelete}
      />
    </>
  );
}

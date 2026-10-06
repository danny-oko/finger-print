import type { Availability } from "@/lib/registration/availability";
import { cn } from "@/lib/utils";

// Shown only when there's something to know. Plenty of seats left is not
// news, and a countdown on every visit would be the pressure tactic this
// page is meant to avoid.
const FEW_SEATS = 40;

export function AvailabilityNotice({ availability }: { availability: Availability }) {
  const notice = (() => {
    switch (availability.status) {
      case "closed":
        return {
          tone: "stop",
          title: "Бүртгэл хаагдсан",
          body: "Энэ жилийн бүртгэл дууссан байна. Бүртгүүлсэн бол тасалбараа «Бүртгэлээ шалгах» хэсгээс харна уу.",
        };
      case "paused":
        return {
          tone: "wait",
          title: "Бүртгэл түр зогссон",
          body: "Удахгүй дахин нээгдэнэ. Бөглөсөн мэдээлэл тань энэ төхөөрөмжид хадгалагдана.",
        };
      case "sold_out":
        return {
          tone: "stop",
          title: "Суудал дүүрсэн",
          body: "Одоогоор сул суудал алга. Төлөгдөөгүй бүртгэлүүд цуцлагдвал суудал гарч магадгүй тул дараа дахин шалгаарай.",
        };
      default:
        if (availability.seatsLeft !== null && availability.seatsLeft <= FEW_SEATS) {
          return {
            tone: "info",
            title: `${availability.seatsLeft} суудал үлдсэн`,
            body: "Бүлгээр бүртгүүлж байгаа бол хүний тоо үлдсэн суудлаас хэтрэхгүй эсэхийг анхаарна уу.",
          };
        }
        return null;
    }
  })();

  if (!notice) return null;

  return (
    <div
      role={notice.tone === "info" ? "status" : "alert"}
      className={cn(
        "mb-6 rounded-2xl border px-5 py-4",
        notice.tone === "stop" && "border-red-200 bg-red-50 text-red-900",
        notice.tone === "wait" && "border-amber-200 bg-amber-50 text-amber-900",
        notice.tone === "info" && "border-sky-200 bg-sky-50 text-sky-900",
      )}
    >
      <p className="font-semibold">{notice.title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{notice.body}</p>
    </div>
  );
}

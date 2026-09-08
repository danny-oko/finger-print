import { NextResponse } from "next/server";

import { d1Query } from "@/lib/d1";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { normalizePhone, phoneSchema } from "@/lib/registration/schema";

type RegistrationRow = {
  id: string;
  registrant_type: string;
  payer_name: string;
  payer_phone: string;
  attendee_count: number;
  total_mnt: number;
  currency: string;
  status: string;
  tickets_issued_at: string | null;
  created_at: string;
};

type AttendeeRow = {
  id: string;
  registration_id: string;
  full_name: string;
  grade: number | null;
  role: string;
  church_name: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("phone") ?? "";
  const phone = normalizePhone(raw);

  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  let step = "select_registrations";

  try {
    const registrations = await d1Query<RegistrationRow>(
      `SELECT DISTINCT r.id, r.registrant_type, r.payer_name, r.payer_phone, r.attendee_count,
              r.total_mnt, r.currency, r.status, r.tickets_issued_at, r.created_at
       FROM registrations r
       LEFT JOIN attendees a ON a.registration_id = r.id
       WHERE r.payer_phone = ? OR a.phone = ? OR a.parent_phone = ?
       ORDER BY r.created_at DESC`,
      [phone, phone, phone],
    );

    if (registrations.length === 0) {
      return NextResponse.json({ registrations: [] });
    }

    step = "select_attendees";

    const ids = registrations.map((r) => r.id);
    const placeholders = ids.map(() => "?").join(", ");
    const attendees = await d1Query<AttendeeRow>(
      `SELECT id, registration_id, full_name, grade, role, church_name
       FROM attendees WHERE registration_id IN (${placeholders})`,
      ids,
    );

    const result = registrations.map((r) => ({
      ...r,
      attendees: attendees.filter((a) => a.registration_id === r.id),
    }));

    return NextResponse.json({ registrations: result });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    // The phone is the search key, not payload — logging the last two digits
    // is enough to line a report up with a log line without storing it.
    logServerError("registration.lookup", error, { step, phone: `••••••${phone.slice(-2)}` });
    return NextResponse.json({ error: code }, { status });
  }
}

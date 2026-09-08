// One vocabulary for failures, shared by the API routes and the screens that
// call them. The point is that "we couldn't find it" and "we're broken" stop
// looking the same: a missing registration is a dead end the user can act on,
// a server fault is a "try again in a minute" that must never be phrased as
// "not found".

export type AppErrorCode =
  | "invalid_input"
  | "invalid_phone"
  | "not_found"
  | "database_error"
  | "service_unavailable"
  | "payment_error"
  | "network_error"
  | "unknown";

export type UserMessage = { title: string; hint?: string };

const MESSAGES: Record<AppErrorCode, UserMessage> = {
  invalid_input: {
    title: "Мэдээлэл дутуу байна",
    hint: "Улаанаар тэмдэглэсэн талбаруудыг шалгана уу.",
  },
  invalid_phone: {
    title: "Утасны дугаар буруу байна",
    hint: "8 оронтой дугаараа шалгаад дахин оруулна уу.",
  },
  not_found: {
    title: "Бүртгэл олдсонгүй",
    hint: "Дугаараа шалгана уу.",
  },
  database_error: {
    title: "Мэдээлэл хадгалагдсангүй",
    hint: "Системд түр алдаа гарлаа. Хэдхэн минутын дараа дахин оролдоно уу.",
  },
  service_unavailable: {
    title: "Систем түр сааталтай байна",
    hint: "Таны мэдээлэл алдагдаагүй. Хэдхэн минутын дараа дахин оролдоно уу.",
  },
  payment_error: {
    title: "Төлбөрийн хуудас нээгдсэнгүй",
    hint: "Бүртгэл тань хадгалагдсан — дахин төлөх боломжтой.",
  },
  network_error: {
    title: "Интернэт холболт тасарлаа",
    hint: "Холболтоо шалгаад дахин оролдоно уу.",
  },
  unknown: {
    title: "Алдаа гарлаа",
    hint: "Дахин оролдоно уу.",
  },
};

export function userMessage(code: string | null | undefined): UserMessage {
  return MESSAGES[code as AppErrorCode] ?? MESSAGES.unknown;
}

/** One line, for a toast or an inline strip. */
export function userMessageText(code: string | null | undefined): string {
  const { title, hint } = userMessage(code);
  return hint ? `${title}. ${hint}` : title;
}

/** Fallback for a failed response that carried no code of its own. */
export function codeFromStatus(status: number): AppErrorCode {
  if (status === 404) return "not_found";
  if (status === 503) return "service_unavailable";
  if (status === 502) return "payment_error";
  if (status === 400 || status === 422) return "invalid_input";
  return "database_error";
}

/**
 * Reads the agreed code off a failed response, falling back to its status.
 * `fetch` only rejects when the request never completed, so that rejection
 * is the one case that genuinely means the network — not the server.
 */
export async function errorCodeFrom(res: Response): Promise<AppErrorCode> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  const code = body?.error;
  return code && code in MESSAGES ? (code as AppErrorCode) : codeFromStatus(res.status);
}

/**
 * What actually went wrong underneath, as far as the logs are concerned.
 * `schema` is called out separately because it never means "bad input" — it
 * means the code and the database disagree, and the fix is a migration.
 */
export type FailureKind =
  | "config"
  | "schema"
  | "constraint"
  | "network"
  | "query"
  | "unknown";

function messageOf(error: unknown): string {
  if (typeof error === "string") return error;
  const message = (error as { message?: unknown } | null)?.message;
  return typeof message === "string" ? message : "";
}

export function failureKind(error: unknown): FailureKind {
  const tagged = (error as { kind?: FailureKind } | null)?.kind;
  if (tagged) return tagged;

  const message = messageOf(error);

  if (/Missing Cloudflare D1 env vars/i.test(message)) return "config";
  if (/no such (table|column)|has no column named|unknown column/i.test(message)) {
    return "schema";
  }
  if (/constraint failed|UNIQUE|FOREIGN KEY|NOT NULL/i.test(message)) return "constraint";
  if (/fetch failed|ECONN|ETIMEDOUT|network|socket hang up|HTTP 5\d\d/i.test(message)) {
    return "network";
  }
  if (/D1 query failed/i.test(message)) return "query";

  return "unknown";
}

/**
 * The HTTP shape a failure should take. A schema mismatch or missing config
 * is our fault and temporary from the user's side, so it's a 503 they can
 * retry rather than a 500 that reads as permanent.
 */
export function httpErrorFor(error: unknown): { code: AppErrorCode; status: number } {
  switch (failureKind(error)) {
    case "config":
    case "schema":
    case "network":
      return { code: "service_unavailable", status: 503 };
    default:
      return { code: "database_error", status: 500 };
  }
}

const REMEDY: Partial<Record<FailureKind, string>> = {
  schema:
    "The database is missing a column this code writes. Apply the pending migrations in db/migrations.",
  config:
    "CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID / CLOUDFLARE_API_TOKEN are not all set. See docs/registration-setup.md.",
  constraint: "A row violated a UNIQUE, NOT NULL or FOREIGN KEY rule — check the values logged above.",
};

/**
 * A single, greppable line per failure. `scope` says where (route + step),
 * `context` says which record — never contact details, since these logs are
 * read in a shared dashboard.
 */
export function logServerError(
  scope: string,
  error: unknown,
  context: Record<string, unknown> = {},
): FailureKind {
  const kind = failureKind(error);
  const detail = (error as { sql?: string; sqliteCode?: string } | null) ?? {};

  console.error(
    `[${scope}] ${kind}: ${messageOf(error) || "unknown error"}`,
    JSON.stringify({
      ...context,
      ...(detail.sql ? { statement: detail.sql } : {}),
      ...(detail.sqliteCode ? { sqliteCode: detail.sqliteCode } : {}),
    }),
  );

  const remedy = REMEDY[kind];
  if (remedy) console.error(`[${scope}] fix: ${remedy}`);

  return kind;
}

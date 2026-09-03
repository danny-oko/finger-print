import { createHmac, timingSafeEqual } from "node:crypto";

// Client for the Byl payment gateway (https://byl.mn/docs).
//
// Byl's hosted "checkout" is the closest match to what registration needs:
// one POST creates a payment page with a line item per attendee, and the
// registrant is redirected to `url` to pay via QPay / Golomt / SocialPay /
// Pocket. We tag every checkout with `client_reference_id = registrationId`
// so the webhook can map a completed payment back to its registration.

const DEFAULT_BASE_URL = "https://byl.mn/api/v1";

function getConfig() {
  const baseUrl = process.env.BYL_API_BASE_URL ?? DEFAULT_BASE_URL;
  const projectId = process.env.BYL_PROJECT_ID;
  const token = process.env.BYL_API_TOKEN;

  if (!projectId || !token) {
    throw new Error(
      "Missing Byl env vars (BYL_PROJECT_ID, BYL_API_TOKEN). See docs/registration-setup.md.",
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), projectId, token };
}

function getWebhookSecret(): string {
  const secret = process.env.BYL_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "Missing Byl env var BYL_WEBHOOK_SECRET. See docs/registration-setup.md.",
    );
  }

  return secret;
}

// Byl caps `client_reference_id` at 48 characters. A registration id is a
// 36-character UUID, so it fits as-is — this just keeps a longer id from
// being silently rejected by the API if that ever changes.
export const CLIENT_REFERENCE_ID_MAX_LENGTH = 48;

export type BylCheckoutItem = {
  price_data: {
    unit_amount: number;
    product_data: {
      name: string;
      client_reference_id?: string;
    };
  };
  quantity: number;
};

export type CreateCheckoutInput = {
  items: BylCheckoutItem[];
  clientReferenceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

export type BylCheckout = {
  id: number;
  url: string;
  status: "open" | "pending" | "complete" | "expired";
  amount_total: string | number;
  amount_subtotal: string | number;
  client_reference_id: string | null;
  customer_email: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

/**
 * Creates a hosted Byl checkout page and returns it. The caller redirects
 * the registrant to `url`; payment confirmation arrives asynchronously as a
 * `checkout.completed` webhook, never from this response.
 */
export async function createCheckout(input: CreateCheckoutInput): Promise<BylCheckout> {
  const { baseUrl, projectId, token } = getConfig();

  if (input.clientReferenceId.length > CLIENT_REFERENCE_ID_MAX_LENGTH) {
    throw new Error(
      `Byl client_reference_id must be at most ${CLIENT_REFERENCE_ID_MAX_LENGTH} characters`,
    );
  }

  const res = await fetch(`${baseUrl}/projects/${projectId}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: input.items,
      client_reference_id: input.clientReferenceId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer_email: input.customerEmail,
      email_collection: true,
      phone_number_collection: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Byl checkout creation failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { data: BylCheckout };

  if (!json.data?.url) {
    throw new Error("Byl checkout creation returned no checkout url");
  }

  return json.data;
}

// Byl's docs name the header `Byl-Signature`, but a rejected delivery is
// indistinguishable from a wrong secret if the real header is spelled
// differently, so accept the plausible variants rather than guess.
const SIGNATURE_HEADERS = ["byl-signature", "x-byl-signature", "byl_signature"];

/** Returns the first signature-bearing header present, or null. */
export function readSignatureHeader(headers: Headers): string | null {
  for (const name of SIGNATURE_HEADERS) {
    const value = headers.get(name);
    if (value) return value.trim();
  }
  return null;
}

/**
 * Verifies the `Byl-Signature` header Byl sends on every webhook call.
 * `rawBody` must be the exact, unparsed request body string — the signature
 * is computed over the raw bytes, and re-serializing the JSON reorders keys
 * and breaks it.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const expected = createHmac("sha256", getWebhookSecret()).update(rawBody, "utf8").digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(signatureHeader, "utf8");

  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

export type BylWebhookEventType =
  | "checkout.completed"
  | "invoice.paid"
  | "invoice.void"
  | "payment.awaiting_verification"
  | "payment.verification_due"
  | (string & {});

export type BylWebhookCheckoutObject = {
  id: number;
  project_id?: number;
  mode?: string;
  status?: string;
  url?: string;
  amount_total?: string | number;
  amount_subtotal?: string | number;
  customer_email?: string | null;
  client_reference_id?: string | null;
};

export type BylWebhookEvent = {
  id: number;
  project_id: number;
  type: BylWebhookEventType;
  object: string;
  data: { object: BylWebhookCheckoutObject };
  created_at: string;
};

/**
 * Byl returns money amounts as either a number or a fixed-point string
 * (e.g. "27000.000000000000"), depending on the endpoint.
 */
export function parseBylAmount(amount: string | number | undefined): number | null {
  if (amount === undefined || amount === null) return null;
  const value = typeof amount === "number" ? amount : Number.parseFloat(amount);
  return Number.isFinite(value) ? Math.round(value) : null;
}

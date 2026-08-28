import { createHmac, timingSafeEqual } from "node:crypto";

function getConfig() {
  const baseUrl = process.env.BONUM_BASE_URL;
  const appSecret = process.env.BONUM_APP_SECRET;
  const terminalId = process.env.BONUM_TERMINAL_ID;
  const checksumKey = process.env.BONUM_MERCHANT_CHECKSUM_KEY;

  if (!baseUrl || !appSecret || !terminalId || !checksumKey) {
    throw new Error(
      "Missing Bonum env vars (BONUM_BASE_URL, BONUM_APP_SECRET, BONUM_TERMINAL_ID, BONUM_MERCHANT_CHECKSUM_KEY). See docs/registration-setup.md.",
    );
  }

  return { baseUrl, appSecret, terminalId, checksumKey };
}

async function getAccessToken(): Promise<string> {
  const { baseUrl, appSecret, terminalId } = getConfig();

  const res = await fetch(`${baseUrl}/bonum-gateway/ecommerce/auth/create`, {
    method: "GET",
    headers: {
      Authorization: `AppSecret ${appSecret}`,
      "X-TERMINAL-ID": terminalId,
    },
  });

  if (!res.ok) {
    throw new Error(`Bonum auth failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { accessToken: string };
  return json.accessToken;
}

export type BonumInvoiceItem = {
  title: string;
  amount: number;
  count: number;
  remark?: string;
};

export type CreateInvoiceInput = {
  amount: number;
  transactionId: string;
  callback: string;
  items: BonumInvoiceItem[];
  expiresIn?: number;
};

export type CreateInvoiceResult = {
  invoiceId: string;
  followUpLink: string;
};

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResult> {
  const { baseUrl } = getConfig();
  const accessToken = await getAccessToken();

  const res = await fetch(`${baseUrl}/bonum-gateway/ecommerce/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "mn",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      callback: input.callback,
      transactionId: input.transactionId,
      expiresIn: input.expiresIn ?? 3600,
      items: input.items,
    }),
  });

  if (!res.ok) {
    throw new Error(`Bonum invoice creation failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as CreateInvoiceResult;
}

/**
 * Verifies the `x-checksum-v2` header Bonum sends on every webhook call.
 * `rawBody` must be the exact, unparsed request body string — the
 * signature is computed over raw bytes, not the re-serialized JSON.
 */
export function verifyWebhookChecksum(rawBody: string, checksumHeader: string | null): boolean {
  if (!checksumHeader) return false;

  const { checksumKey } = getConfig();
  const expected = createHmac("sha256", checksumKey).update(rawBody, "utf8").digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(checksumHeader, "utf8");

  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

export type BonumWebhookPayload = {
  type: string;
  status: "SUCCESS" | "FAILED" | string;
  message?: string;
  body: {
    transactionId: string;
    invoiceId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    invoiceStatus?: string;
    paymentVendor?: string;
    completedAt?: string;
  };
};

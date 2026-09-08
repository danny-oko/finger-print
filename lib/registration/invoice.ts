import { INVOICE_DESCRIPTION_MAX_LENGTH } from "@/lib/byl";

/**
 * The short, readable half of a registration id. Byl assigns an invoice its
 * own id only in the creation response, so the description we send can't
 * contain it — this is the reference that exists before the call and that
 * the admin monitor can be searched by.
 */
export function paymentReference(registrationId: string): string {
  return registrationId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/**
 * What the payer reads on their bank statement. Byl prefixes its own
 * "<project>, <amount>," to this, so keep it to the part that identifies
 * which registration is being paid for.
 */
export function invoiceDescription(reference: string, attendeeCount: number): string {
  return `Хурууны хээ бүртгэлийн хураамж - ${reference} - ${attendeeCount} хүн`.slice(
    0,
    INVOICE_DESCRIPTION_MAX_LENGTH,
  );
}

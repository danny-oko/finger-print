// Paying by plain bank transfer instead of through Byl. Nothing confirms
// these automatically: the registration waits as "awaiting verification"
// until staff find the money on the statement and mark it paid.

export const TRANSFER_ACCOUNT = {
  bank: "Хаан банк",
  iban: "430005005114308421",
} as const;

/** What the payer types as the transfer description, so staff can match it. */
export function transferReference(parts: {
  payerName: string;
  churchName: string;
  payerPhone: string;
}): string {
  return [parts.payerName, parts.churchName, parts.payerPhone]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" - ");
}

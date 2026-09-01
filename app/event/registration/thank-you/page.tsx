import { redirect } from "next/navigation";

// The registration page at /event/registration/<id> is now the canonical
// post-payment view. This route only exists for links already in the wild —
// Byl checkouts created before the success_url changed, and any thank-you
// URL a registrant bookmarked.
export default async function ThankYouRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;

  redirect(rid ? `/event/registration/${rid}` : "/event/status");
}

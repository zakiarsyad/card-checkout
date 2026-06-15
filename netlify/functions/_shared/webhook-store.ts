import { getStore } from "@netlify/blobs";

// A tiny cross-request marker so the success page can confirm that Stripe's
// webhook for a payment actually reached the server. Netlify Blobs is a
// serverless KV store, auto-configured on Netlify and in `netlify dev`.
const STORE = "webhook-receipts";

/** Record that a payment's webhook was received (keyed by PaymentIntent id). */
export async function markPaymentSeen(paymentIntentId: string, at: number): Promise<void> {
  await getStore(STORE).setJSON(`pi/${paymentIntentId}`, { at });
}

/** Returns the receipt time (Unix seconds) if seen, else null. */
export async function wasPaymentSeen(paymentIntentId: string): Promise<number | null> {
  const rec = (await getStore(STORE).get(`pi/${paymentIntentId}`, { type: "json" })) as
    | { at?: number }
    | null;
  return rec && typeof rec.at === "number" ? rec.at : null;
}

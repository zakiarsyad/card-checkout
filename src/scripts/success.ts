/**
 * Success page controller. Reads the PaymentIntent status for *display only* —
 * it never fulfills (fulfillment is the webhook's job; ADR-0002).
 */
import { statusToUiState, STATE_COPY, type PaymentIntentStatus } from "../lib/payment-state";

const TONE: Record<string, string> = {
  succeeded: "succeeded",
  processing: "processing",
  requires_action: "processing",
  failed: "failed",
};

export async function renderSuccess(): Promise<void> {
  const titleEl = document.getElementById("title");
  const messageEl = document.getElementById("message");
  const iconEl = document.getElementById("icon");
  if (!titleEl || !messageEl || !iconEl) return;

  const render = (tone: string, title: string, message: string) => {
    iconEl.dataset.tone = tone;
    titleEl.textContent = title;
    messageEl.textContent = message;
  };

  const params = new URLSearchParams(window.location.search);
  const clientSecret = params.get("payment_intent_client_secret");
  if (!clientSecret) {
    render("failed", "Nothing to show", "We couldn't find a payment to display. Head back to start a new one.");
    return;
  }

  try {
    const pk = import.meta.env.PUBLIC_STRIPE_KEY as string | undefined;
    if (!pk) throw new Error("missing key");
    const { loadStripe } = await import("@stripe/stripe-js");
    const stripe = await loadStripe(pk);
    if (!stripe) throw new Error("stripe failed to load");

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    if (!paymentIntent) throw new Error("no payment intent");

    const ui = statusToUiState(paymentIntent.status as PaymentIntentStatus);
    const copy = STATE_COPY[ui];
    render(TONE[ui] ?? "pending", copy.title || "Payment status", copy.message);
  } catch {
    render(
      "processing",
      "We couldn't read the status",
      "Your payment may still be processing. If you completed checkout, you'll be confirmed via email.",
    );
  }
}

/**
 * Client checkout controller. Framework-free (the only interactive island —
 * docs/STANDARDS.md → Performance). Stripe.js is dynamically imported on the
 * user's intent to pay, so it stays out of the initial bundle.
 *
 * The same confirm path serves both plans; only the server endpoint differs
 * (ADR-0003). Domain logic (state machine, error taxonomy) lives in src/lib
 * and is unit-tested; this file is the thin DOM/Stripe wiring around it.
 */
import { mapStripeError } from "../lib/errors";
import { STATE_COPY } from "../lib/payment-state";
import { formatAmount } from "../lib/money";
import { PLANS, type PlanKey } from "../lib/catalog";
import type { Stripe, StripeElements } from "@stripe/stripe-js";

type Phase = "select" | "pay";

const ENDPOINTS: Record<PlanKey, string> = {
  one_time: "/.netlify/functions/create-payment-intent",
  subscription: "/.netlify/functions/create-subscription",
};

export function initCheckout(): void {
  const form = document.querySelector<HTMLElement>(".card");
  const primary = document.getElementById("primary") as HTMLButtonElement | null;
  const totalEl = document.getElementById("total-amount");
  const paymentSection = document.getElementById("payment-section");
  const statusEl = document.getElementById("status");
  const errorEl = document.getElementById("error");
  if (!form || !primary || !totalEl || !paymentSection || !statusEl || !errorEl) return;

  let phase: Phase = "select";
  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let idempotencyKey = "";

  const selectedPlan = (): PlanKey => {
    const checked = form.querySelector<HTMLInputElement>('input[name="plan"]:checked');
    return (checked?.value as PlanKey) ?? "one_time";
  };

  const setButton = (label: string, opts: { busy?: boolean; disabled?: boolean } = {}) => {
    primary.dataset.busy = opts.busy ? "true" : "false";
    primary.disabled = Boolean(opts.disabled);
    primary.innerHTML = `<span class="btn__spinner" aria-hidden="true"></span><span>${label}</span>`;
  };

  const showStatus = (tone: string, title: string, message: string) => {
    statusEl.hidden = false;
    statusEl.dataset.tone = tone;
    statusEl.textContent = message ? `${title} ${message}` : title;
  };
  const clearStatus = () => {
    statusEl.hidden = true;
    statusEl.textContent = "";
  };
  const showError = (title: string, message: string) => {
    errorEl.hidden = false;
    errorEl.innerHTML = `<strong></strong><span></span>`;
    errorEl.querySelector("strong")!.textContent = title;
    errorEl.querySelector("span")!.textContent = message;
  };
  const clearError = () => {
    errorEl.hidden = true;
    errorEl.textContent = "";
  };

  const payLabel = (): string => {
    const plan = PLANS[selectedPlan()];
    return `Pay ${formatAmount(plan.amount, plan.currency)}`;
  };

  // Keep the signature total in sync with the toggle.
  const syncTotal = () => {
    const plan = PLANS[selectedPlan()];
    totalEl.textContent = formatAmount(plan.amount, plan.currency);
    if (plan.interval) {
      const per = document.createElement("span");
      per.style.cssText = "font-size:var(--text-xl);color:var(--color-ink-500);font-weight:400;";
      per.textContent = `/${plan.interval === "month" ? "mo" : "yr"}`;
      totalEl.appendChild(per);
    }
  };

  form.querySelectorAll<HTMLInputElement>('input[name="plan"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (phase === "select") syncTotal();
    });
  });

  async function startPayment() {
    clearError();
    const plan = PLANS[selectedPlan()];
    setButton("Continue to payment", { busy: true, disabled: true });
    showStatus("submitting", "Setting up checkout…", "");

    try {
      idempotencyKey = idempotencyKey || crypto.randomUUID();

      const res = await fetch(ENDPOINTS[plan.key], {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: plan.key, idempotencyKey }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        clientSecret?: string;
        error?: { message?: string };
      };
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error?.message ?? "We couldn't start checkout. Please try again.");
      }

      const pk = import.meta.env.PUBLIC_STRIPE_KEY as string | undefined;
      if (!pk) throw new Error("Payments aren't configured (missing publishable key).");

      const { loadStripe } = await import("@stripe/stripe-js");
      stripe = await loadStripe(pk);
      if (!stripe) throw new Error("We couldn't load the payment form. Please reload and try again.");

      elements = stripe.elements({
        clientSecret: data.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#4f46e5",
            colorText: "#1c1917",
            colorDanger: "#b91c1c",
            fontFamily: "Inter Variable, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
        },
      });
      const paymentElement = elements.create("payment", { layout: "tabs" });
      paymentElement.mount("#payment-element");

      paymentSection!.hidden = false;
      clearStatus();
      phase = "pay";
      setButton(payLabel());
      paymentElement.on("ready", () => paymentElement.focus());
    } catch (err) {
      clearStatus();
      showError("Couldn't start checkout", err instanceof Error ? err.message : "Please try again.");
      phase = "select";
      setButton("Continue to payment");
    }
  }

  async function confirm() {
    if (!stripe || !elements) return;
    clearError();
    setButton(payLabel(), { busy: true, disabled: true });
    showStatus("submitting", STATE_COPY.submitting.title, STATE_COPY.submitting.message);

    // No `redirect: 'if_required'`: let Stripe drive 3DS and redirect to the
    // return_url on success. The success page reads the final status. On a
    // decline/validation error, the promise resolves here with `error` set.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
    });

    // We only get here on an immediate error (no redirect happened).
    const mapped = mapStripeError(error);
    clearStatus();
    showError(mapped.title, mapped.message);
    setButton(payLabel(), { disabled: false });
  }

  primary.addEventListener("click", () => {
    if (phase === "select") void startPayment();
    else void confirm();
  });

  // Initialize button markup (adds the spinner span).
  setButton("Continue to payment");
}

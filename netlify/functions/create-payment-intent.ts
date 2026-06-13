import type { Context } from "@netlify/functions";
import { getStripe } from "./_shared/stripe";
import { json, errorResponse, methodNotAllowed, readJson, correlationId } from "./_shared/http";
import { getPlan } from "../../src/lib/catalog";
import { createLogger } from "../../src/lib/log";

/**
 * Creates a one-time PaymentIntent. The client sends only a plan key; the
 * amount is resolved server-side from the catalog (ADR-0004). An idempotency
 * key makes retries of the same checkout attempt safe (STANDARDS → Domain).
 */
export default async function handler(req: Request, _context: Context): Promise<Response> {
  if (req.method !== "POST") return methodNotAllowed();

  const cid = correlationId();
  const log = createLogger({ fn: "create-payment-intent", cid });

  const body = await readJson(req);
  if (typeof body !== "object" || body === null) {
    return errorResponse(400, "invalid_body", "Request body must be JSON.");
  }
  const { plan: planKey, idempotencyKey } = body as Record<string, unknown>;

  let plan;
  try {
    plan = getPlan(planKey);
  } catch {
    log.warn("unknown plan key", { planKey });
    return errorResponse(400, "unknown_plan", "Unknown plan.");
  }

  if (plan.mode !== "payment") {
    // Subscriptions go through create-subscription, not here.
    return errorResponse(400, "wrong_endpoint", "Use the subscription endpoint for recurring plans.");
  }

  // Idempotency: trust a client-supplied token for retry-dedupe, else mint one.
  const idemKey =
    typeof idempotencyKey === "string" && idempotencyKey.length >= 8
      ? idempotencyKey
      : crypto.randomUUID();

  try {
    const stripe = getStripe();
    log.info("creating payment intent", { plan: plan.key, amount: plan.amount, currency: plan.currency });

    const intent = await stripe.paymentIntents.create(
      {
        amount: plan.amount,
        currency: plan.currency,
        automatic_payment_methods: { enabled: true },
        metadata: { plan: plan.key, product: "pro_ui_kit", cid },
      },
      { idempotencyKey: idemKey },
    );

    log.info("payment intent created", { id: intent.id, status: intent.status });

    return json({
      clientSecret: intent.client_secret,
      amount: plan.amount,
      currency: plan.currency,
      plan: plan.key,
    });
  } catch (err) {
    log.error("payment intent failed", { message: err instanceof Error ? err.message : String(err) });
    return errorResponse(502, "stripe_error", "We couldn't start the payment. Please try again.");
  }
}

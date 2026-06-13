/**
 * Server-authoritative catalog. The client sends only a plan *key*; the server
 * resolves the real amount and Stripe Price ID. The client never sends a price.
 * See docs/decisions/ADR-0004-server-side-catalog.md.
 *
 * This module is pure (no env, no secrets) so it's safe to import on the client
 * for display. Secret Price IDs are resolved separately, server-side only —
 * see `priceIdFor()`.
 */
import { assertMinorUnits } from "./money";

export const PLAN_KEYS = ["one_time", "subscription"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

/** Stripe "mode": a one-off PaymentIntent vs a Subscription. */
export type PlanMode = "payment" | "subscription";

export interface Plan {
  key: PlanKey;
  mode: PlanMode;
  /** Short label for the toggle, e.g. "One-time". */
  label: string;
  /** Full name, e.g. "One-time purchase". */
  name: string;
  /** Authoritative price in integer minor units. */
  amount: number;
  currency: string;
  /** Billing interval for subscriptions; undefined for one-time. */
  interval?: "month" | "year";
  /** Microcopy describing what the buyer gets. */
  blurb: string;
}

export const PRODUCT_NAME = "Pro UI Kit";

export const PLANS: Record<PlanKey, Plan> = {
  one_time: {
    key: "one_time",
    mode: "payment",
    label: "One-time",
    name: "One-time purchase",
    amount: 4900, // $49.00
    currency: "usd",
    blurb: "Pay once. Yours forever, including this version's updates.",
  },
  subscription: {
    key: "subscription",
    mode: "subscription",
    label: "Subscribe",
    name: "All-access subscription",
    amount: 900, // $9.00 / month
    currency: "usd",
    interval: "month",
    blurb: "Every kit, every update, billed monthly. Cancel anytime.",
  },
};

// Validate amounts at module load — fail fast on a bad catalog edit.
for (const plan of Object.values(PLANS)) {
  assertMinorUnits(plan.amount, `${plan.key} amount`);
}

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && (PLAN_KEYS as readonly string[]).includes(value);
}

/**
 * Resolve a plan from an untrusted client-supplied key.
 * Throws on an unknown key — the client cannot smuggle in a custom plan.
 */
export function getPlan(key: unknown): Plan {
  if (!isPlanKey(key)) {
    throw new Error(`Unknown plan key: ${JSON.stringify(key)}`);
  }
  return PLANS[key];
}

/**
 * Resolve the Stripe Price ID for a plan from the environment. Server-only —
 * Price IDs live in env, never in client-shipped code.
 */
export function priceIdFor(key: PlanKey, env: Record<string, string | undefined> = process.env): string {
  const name = key === "one_time" ? "PRICE_ONE_TIME" : "PRICE_SUBSCRIPTION";
  const value = env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment`);
  }
  return value;
}

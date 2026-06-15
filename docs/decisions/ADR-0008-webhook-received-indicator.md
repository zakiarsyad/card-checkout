# ADR-0008: A webhook-received indicator on the success page

**Status:** Accepted
**Date:** 2026-06-15
**Deciders:** Dev (solo)

## Context

Fulfillment happens on the Stripe webhook, not the success page (ADR-0002) —
correct, but *invisible*: the visitor sees a success screen while the real work
happens server-side where no one can see it. We want to make that visible
without confusing the visitor or building a separate destination.

(An earlier attempt — a full `/activity` dashboard — was over-built and read as
a confusing second page. Reverted in favour of this.)

## Decision

Show a **small live indicator on the success page itself**: a badge that starts
"Waiting for Stripe's webhook…" and flips to **"Stripe webhook received —
fulfillment confirmed"** the moment the webhook for *this* payment reaches the
server.

Mechanism, kept minimal:
- The webhook writes a tiny **receipt marker** keyed by PaymentIntent id
  (`pi/<id>`) to **Netlify Blobs** on `payment_intent.succeeded`. This fires for
  both one-time payments **and** a subscription's first charge, so one marker
  covers both flows.
- The success page (which has that PaymentIntent id from Stripe's redirect)
  polls a read-only **`webhook-status`** endpoint until the marker exists.

## Consequences

- The "webhook is the source of truth" claim becomes *demonstrable, in place* —
  the visitor watches it confirm, right where they already are.
- Best-effort: the marker write never fails the webhook (which would trigger
  Stripe retries); the indicator degrades to a neutral "completes in the
  background" message if no webhook arrives (e.g. `stripe listen` not running
  locally).
- It's **observability**, not entitlement state — real fulfillment would still
  write a ledger/entitlement row.

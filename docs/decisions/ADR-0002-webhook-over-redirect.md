# ADR-0002: Fulfill on webhooks, not on the redirect

**Status:** Accepted
**Date:** 2026-06-13
**Deciders:** Dev (solo)

## Context

After a payment, we need a reliable signal that it actually succeeded before treating the order
as fulfilled. There are two candidate signals: the client returning to a success URL, and
Stripe's server-to-server webhook.

## Decision

Treat **webhooks as the source of truth** for fulfillment (`payment_intent.succeeded`,
`invoice.paid`). The success page only *reads* status for display; it never fulfills.

## Options considered

- **Redirect / success URL** — convenient, but unreliable: the customer can close the tab or
  drop their connection before the redirect fires, so the event is silently lost.
- **Webhooks** — delivered server-to-server and retried, independent of the customer's browser. *(chosen)*

## Trade-off analysis

Fulfilling on the redirect is the most common payments bug and produces exactly the failure that
loses money: a charged customer who never gets fulfilled. The webhook is the only signal that
survives a closed tab.

## Consequences

- Easier: correct, reliable fulfillment; naturally replay-safe once handling is idempotent.
- Harder: requires a public webhook endpoint, signature verification, and local forwarding via
  the Stripe CLI during development.
- Revisit if: nothing foreseeable — this is the standard for a reason.

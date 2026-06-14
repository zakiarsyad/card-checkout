# ADR-0007: Card-only payment methods for the demo

**Status:** Accepted
**Date:** 2026-06-14
**Deciders:** Dev (solo)

## Context

By default the Payment Element shows every method enabled on the Stripe account
(Link, pay-by-bank, Klarna, wallets, …). For a focused demo whose point is the
*card* payment lifecycle (3-D Secure, declines, the state machine), the extra
methods add noise and confusion — and some of them can't be exercised with the
documented test cards.

## Decision

Restrict the demo to **card only**, enforced in two places:

1. **Per intent (server):** `payment_method_types: ['card']` on the PaymentIntent
   (`create-payment-intent`) and `payment_settings.payment_method_types: ['card']`
   on the subscription. This guarantees the intent only *accepts* card.
2. **Element display (account):** the Stripe **payment-method configuration** for
   the sandbox is set to card-only.

## The non-obvious finding

The Payment Element decides *which methods to display* from the account's
**payment-method configuration**, **not** from the PaymentIntent's
`payment_method_types`. So setting `payment_method_types: ['card']` alone is not
enough — the Element will still render Link/Klarna/bank tabs (which would then
fail at confirm, since the intent only allows card). Both layers are required:
the intent restriction for correctness, the account configuration for display.
Verified end-to-end in a real browser.

## Consequences

- Easier: a clean, unambiguous demo; every visible method actually works.
- Account-level: the configuration change applies to the whole sandbox, so it
  affects both local and the deployed site (which share the account).
- Revisit if: the demo should showcase wallets/Link — re-enable them in the
  payment-method configuration and drop the `payment_method_types` restriction.

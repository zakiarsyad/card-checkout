# ADR-0001: Use the Payment Element, not a hand-built card form

**Status:** Accepted
**Date:** 2026-06-13
**Deciders:** Dev (solo)

## Context

The checkout needs to collect card details and handle authentication (3DS). The choice of
integration determines both how much UI control we have and how much PCI scope we take on.

## Decision

Use Stripe's **Payment Element** backed by the **PaymentIntents** flow.

## Options considered

- **Hosted Checkout** — fastest, but Stripe owns the whole page, so there's little design or
  engineering to show.
- **Payment Element** — embeddable, Stripe-hosted card fields inside our own page. We own layout
  and styling; Stripe handles secure input, 3DS, and multiple payment methods. *(chosen)*
- **Raw card handling / low-level fields** — maximum control, but raw PAN handling pulls us into
  serious PCI scope for no portfolio benefit.

## Trade-off analysis

The Payment Element is the only option that lets us own the design (engineering + design signal)
without owning the card data (PCI risk). Hand-building the card input would *look* like more
work but reads as a judgment red flag to anyone who knows payments — taking on PCI scope you
don't need is the opposite of senior.

## Consequences

- Easier: PCI surface stays minimal; 3DS, accessibility, and extra payment methods come for free.
- Harder: slightly less pixel-level control than a fully custom field (CSS-level theming is enough here).
- Revisit if: we ever need a payment method the Payment Element doesn't support.

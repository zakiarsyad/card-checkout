# ADR-0003: One product, two ways, with a shared confirm path

**Status:** Accepted
**Date:** 2026-06-13
**Deciders:** Dev (solo)

## Context

The piece should demonstrate both core payment models — one-time and recurring — without turning
into two disconnected demos bolted together.

## Decision

Sell **one product two ways** (one-time or subscription). Architect both so they converge on a
single client step: confirming a PaymentIntent with the Payment Element. The difference lives
entirely on the server in how the intent is created.

## Options considered

- **Two separate demos** — clear but redundant, and it hides the relationship between the models.
- **One product, shared confirm path** — one coherent UI; a subscription's first charge is itself
  a PaymentIntent, so it reuses the exact one-time confirm flow. *(chosen)*

## Trade-off analysis

The shared path is the insight worth showing: a one-time charge and a subscription's first
payment are the same client operation. Demonstrating that you see the line between PaymentIntents
and Subscriptions — and can collapse it on the frontend — is a stronger signal than two parallel
implementations.

## Consequences

- Easier: one frontend confirm path; a single, coherent product story.
- Harder: subscriptions add a second webhook set and a lifecycle (renewals, failed renewals).
- Revisit if: we add trials, proration, or plan changes.

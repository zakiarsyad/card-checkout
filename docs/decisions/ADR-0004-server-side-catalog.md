# ADR-0004: Server-authoritative catalog and pricing

**Status:** Accepted
**Date:** 2026-06-13
**Deciders:** Dev (solo)

## Context

The client must tell the server what's being bought. The naive approach is to send the amount
from the client — which is also a classic way to get overcharged or undercharged through tampering.

## Decision

Keep a **server-side catalog** mapping product keys → Stripe Price IDs and amounts. The client
sends only a product/price **key**; the server resolves the real amount.

## Options considered

- **Client sends amount** — simple, and unsafe: trivially tampered.
- **Server-side catalog, client sends a key** — single source of truth for price; the client
  can't influence what it's charged. *(chosen)*

## Trade-off analysis

Never trusting client-supplied amounts is table stakes in payments. A reviewer will look for
exactly this, and its absence is disqualifying. The cost of doing it right here is negligible.

## Consequences

- Easier: secure by construction; a thin, dumb client.
- Harder: nothing meaningful at this scope.
- Revisit if: the catalog grows enough to warrant a database or treating Stripe as the catalog
  source of record.

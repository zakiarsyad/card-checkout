# ADR-0005: Astro frontend + Netlify Functions backend

**Status:** Accepted
**Date:** 2026-06-13
**Deciders:** Dev (solo)

## Context

Stripe's secret-key calls and the webhook handler must run on a server, but the frontend is
mostly static and should stay lean. There's also an existing deployment setup on Netlify worth
reusing rather than introducing new infrastructure.

## Decision

Use **Astro (SSR)** for the frontend and **Netlify Functions** for the server endpoints
(`create-payment-intent`, `create-subscription`) and the Stripe webhook.

## Options considered

- **Dedicated Node/Express server** — full control, but more to operate and deploy for three endpoints.
- **Next.js API routes** — perfectly capable, but introduces a second framework when Astro is
  already the chosen stack.
- **Astro + Netlify Functions** — one deploy target, serverless endpoints, no server to manage. *(chosen)*

## Trade-off analysis

For three small endpoints, serverless functions on the platform we already deploy to is the
lowest-overhead option that still keeps secret-key logic off the client. Astro keeps the
frontend payload small.

## Consequences

- Easier: a single deploy target; no long-running server to manage.
- Harder: function cold starts and function-shaped constraints (stateless, short-lived).
- Revisit if: requirements outgrow what serverless functions handle comfortably.

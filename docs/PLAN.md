# Build Plan

Milestones are sequential. Each has an exit criterion. Run them through the `agent-skills`
lifecycle: `/plan` to atomize the tasks, then `/build` → `/test` → `/review` → `/code-simplify`
per slice, and `/ship` at the end. Commit per milestone (e.g. `feat(m1): …`) and keep `TASKS.md`
in sync as you go.

**Definition of done (every milestone):** the exit criterion is met, critical-path tests pass
(test-first, per `STANDARDS.md`), and the relevant pillar of `STANDARDS.md` is satisfied. A
milestone with passing behavior but no tests is not done.

## M0 — Setup

Repo, dependencies, tooling, and Stripe test products.

**Exit:** `npm run dev` serves a blank Astro page; `.env` is populated; two test Prices
(one-time + recurring) exist in your Stripe dashboard.

## M1 — Catalog + one-time intent

Server-side catalog; `create-payment-intent` function with an idempotency key and a
server-computed amount.

**Exit:** calling the function returns a valid `client_secret` for the one-time price.

## M2 — Payment Element + confirm

Product page with a plan toggle; Payment Element wired to the `client_secret`; a shared confirm
handler; handling for `requires_action` (3DS), `processing`, `succeeded`, and `failed`.

**Exit:** a one-time purchase completes end to end with the success test card, and the 3DS and
decline cards each produce correct UX.

## M3 — Subscription flow

`create-subscription` function: create a Customer + Subscription and return the first invoice's
PaymentIntent `client_secret`. **Verify the current Stripe API first** (see `CLAUDE.md`).

**Exit:** a subscription completes through the same Payment Element confirm path.

## M4 — Webhooks

`stripe-webhook` function: signature verification and idempotent handling of
`payment_intent.succeeded` / `payment_intent.payment_failed`, `invoice.paid` /
`invoice.payment_failed`, and `customer.subscription.*`. Fulfillment is the webhook's job.

**Exit:** completing either flow triggers the correct webhook path; a replayed event is a no-op.

## M5 — Polish + ship

Error-taxonomy UX, loading and trust states, an accessibility pass (keyboard, focus, reduced
motion, AA contrast), and a performance pass against the `STANDARDS.md` budgets (Lighthouse ≥ 95,
LCP/CLS, JS budget). Run `/review` and `/code-simplify` over the codebase, write the README's
production-notes section, deploy to Netlify, and register the production webhook endpoint.

**Exit:** deployed; both flows work on the live test-mode URL; Lighthouse and the JS budget are
met; README (including production notes) is complete.

# Tasks

Living checklist. Check boxes as you complete them; keep in sync with `PLAN.md`.

Run `/plan` first to break these into atomic tasks with acceptance criteria. Each task is
implemented test-first and committed individually (per `STANDARDS.md`).

## M0 — Setup

- [ ] Init Astro + TypeScript project; add Tailwind CSS v4
- [ ] Add Netlify config + functions directory; confirm `netlify dev` runs
- [ ] Install `stripe` and `@stripe/stripe-js`
- [ ] Create a test Product + two Prices in Stripe; record the Price IDs
- [ ] Create `.env.example`; create `.env`; add `.env` to `.gitignore`

## M1 — Catalog + one-time intent

- [ ] Server-side catalog mapping product keys → Price IDs + amounts
- [ ] `create-payment-intent` function: amount from catalog, idempotency key
- [ ] Return `client_secret`; handle and shape errors

## M2 — Payment Element + confirm

- [ ] Product page UI with a one-time / subscribe toggle
- [ ] Mount the Payment Element with the `client_secret`
- [ ] Shared confirm handler
- [ ] State handling: `requires_action` (3DS), `processing`, `succeeded`, `failed`
- [ ] Error taxonomy: declined vs network vs validation
- [ ] Success page that reads status (does not fulfill)

## M3 — Subscription flow

- [ ] Verify the current Stripe subscription API in the docs
- [ ] `create-subscription`: Customer + Subscription with an incomplete first payment
- [ ] Return the first invoice's PaymentIntent `client_secret`
- [ ] Reuse the same confirm path

## M4 — Webhooks

- [ ] `stripe-webhook` with signature verification
- [ ] Handle `payment_intent.succeeded` / `payment_intent.payment_failed`
- [ ] Handle `invoice.paid` / `invoice.payment_failed` / `customer.subscription.*`
- [ ] Idempotent processing (replay-safe)
- [ ] Log / stub fulfillment

## M5 — Polish + ship

- [ ] Loading + trust states; error-taxonomy UX
- [ ] Accessibility pass: keyboard, visible focus, reduced motion, AA contrast
- [ ] Performance pass: Lighthouse ≥ 95, LCP < 1.5s, CLS < 0.05, JS budget met
- [ ] Defer Stripe.js to point-of-pay; `preconnect` to Stripe
- [ ] `/review` and `/code-simplify` over the codebase
- [ ] Finalize README + diagram + production-notes section
- [ ] Deploy to Netlify; set env vars in the dashboard
- [ ] Register the production webhook; set `STRIPE_WEBHOOK_SECRET`
- [ ] Verify both flows on the deployed test-mode URL

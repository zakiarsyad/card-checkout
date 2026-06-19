/**
 * Brand identity — single source of truth. Used for page titles, Open Graph,
 * the canonical URL, and footer/links so the name and URLs live in one place.
 */
export const BRAND = {
  /** Display name. (Repo is card-checkout; domain is checkout.zakiarsyad.com.) */
  name: "Checkout",
  /** Production domain. */
  url: "https://checkout.zakiarsyad.com",
  /** Source repository. */
  repo: "https://github.com/zakiarsyad/card-checkout",
  /** Author — used for SEO structured data + the on-page attribution link. */
  author: "Zaki Arsyad",
  /** Author's site — where the attribution byline links. */
  authorUrl: "https://zakiarsyad.com",
  description:
    "A minimal, production-minded Stripe checkout. One product, sold two ways (one-time or subscription), with the Payment Element, webhook-driven fulfillment, and a complete payment state machine.",
} as const;

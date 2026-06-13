import { describe, it, expect } from "vitest";
import { _redact } from "./log";

describe("log redaction", () => {
  it("redacts secret-bearing keys at any depth", () => {
    const out = _redact({
      plan: "one_time",
      client_secret: "pi_123_secret_abc",
      nested: { card: { number: "4242424242424242" } },
    }) as any;
    expect(out.plan).toBe("one_time");
    expect(out.client_secret).toBe("[redacted]");
    expect(out.nested.card).toBe("[redacted]");
  });

  it("leaves non-secret data intact", () => {
    const out = _redact({ amount: 4900, currency: "usd", id: "pi_1" }) as any;
    expect(out).toEqual({ amount: 4900, currency: "usd", id: "pi_1" });
  });
});

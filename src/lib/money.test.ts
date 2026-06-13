import { describe, it, expect } from "vitest";
import { isZeroDecimalCurrency, assertMinorUnits, formatAmount } from "./money";

describe("isZeroDecimalCurrency", () => {
  it("recognizes zero-decimal currencies case-insensitively", () => {
    expect(isZeroDecimalCurrency("jpy")).toBe(true);
    expect(isZeroDecimalCurrency("JPY")).toBe(true);
    expect(isZeroDecimalCurrency("krw")).toBe(true);
  });

  it("treats normal currencies as two-decimal", () => {
    expect(isZeroDecimalCurrency("usd")).toBe(false);
    expect(isZeroDecimalCurrency("EUR")).toBe(false);
  });
});

describe("assertMinorUnits", () => {
  it("accepts non-negative integers", () => {
    expect(assertMinorUnits(0)).toBe(0);
    expect(assertMinorUnits(4900)).toBe(4900);
  });

  it("rejects floats and negatives (no silent coercion)", () => {
    expect(() => assertMinorUnits(49.0001)).toThrow();
    expect(() => assertMinorUnits(-1)).toThrow();
    expect(() => assertMinorUnits(Number.NaN)).toThrow();
  });
});

describe("formatAmount", () => {
  it("formats two-decimal currencies from minor units", () => {
    expect(formatAmount(4900, "usd")).toBe("$49.00");
    expect(formatAmount(900, "usd")).toBe("$9.00");
  });

  it("formats zero-decimal currencies without dividing", () => {
    // ¥4900 should be 4900 yen, not 49.
    expect(formatAmount(4900, "jpy")).toBe("¥4,900");
  });

  it("rejects invalid amounts", () => {
    expect(() => formatAmount(12.5, "usd")).toThrow();
  });
});

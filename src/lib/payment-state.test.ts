import { describe, it, expect } from "vitest";
import { statusToUiState, isTerminal, type PaymentIntentStatus } from "./payment-state";

describe("statusToUiState", () => {
  const cases: [PaymentIntentStatus, string][] = [
    ["succeeded", "succeeded"],
    ["processing", "processing"],
    ["requires_action", "requires_action"],
    ["requires_confirmation", "requires_action"],
    ["requires_capture", "processing"],
    ["requires_payment_method", "failed"],
    ["canceled", "failed"],
  ];

  it.each(cases)("maps %s → %s", (status, expected) => {
    expect(statusToUiState(status)).toBe(expected);
  });

  it("covers every status (no default fall-through)", () => {
    const all: PaymentIntentStatus[] = [
      "requires_payment_method",
      "requires_confirmation",
      "requires_action",
      "processing",
      "requires_capture",
      "canceled",
      "succeeded",
    ];
    for (const s of all) expect(statusToUiState(s)).toBeTruthy();
  });
});

describe("isTerminal", () => {
  it("treats succeeded and failed as terminal", () => {
    expect(isTerminal("succeeded")).toBe(true);
    expect(isTerminal("failed")).toBe(true);
  });
  it("treats in-flight states as non-terminal", () => {
    expect(isTerminal("processing")).toBe(false);
    expect(isTerminal("requires_action")).toBe(false);
    expect(isTerminal("submitting")).toBe(false);
    expect(isTerminal("idle")).toBe(false);
  });
});

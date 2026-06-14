/**
 * Click-to-copy for the test-card chips. We copy rather than autofill on
 * purpose: the card form is a cross-origin Stripe iframe, so page JS can't type
 * into it (the PCI boundary). The visitor pastes the number into the field.
 */
export function initTestCards(): void {
  document.querySelectorAll<HTMLButtonElement>(".chip[data-card]").forEach((chip) => {
    const numEl = chip.querySelector<HTMLElement>(".chip__num");
    chip.addEventListener("click", async () => {
      const card = chip.dataset.card;
      if (!card || !numEl) return;
      try {
        await navigator.clipboard.writeText(card);
      } catch {
        return; // clipboard blocked (rare); leave the chip unchanged
      }
      const original = numEl.textContent;
      numEl.textContent = "Copied ✓";
      chip.dataset.copied = "true";
      window.setTimeout(() => {
        numEl.textContent = original;
        chip.dataset.copied = "false";
      }, 1300);
    });
  });
}

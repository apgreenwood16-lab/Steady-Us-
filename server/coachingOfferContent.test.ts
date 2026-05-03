import { describe, expect, it } from "vitest";
import {
  coachingDisclaimer,
  coachingTestimonials,
  couplesBudgetReset,
  faqContent,
  supportEmail,
} from "../client/src/lib/coachingOfferContent";

describe("SteadyUs coaching offer content", () => {
  it("uses the approved public Gmail support email instead of the old personal contact path", () => {
    expect(supportEmail).toBe("andy.steadyus@gmail.com");
    expect(supportEmail).not.toBe("apgreenwood16@gmail.com");
  });

  it("keeps the pilot pricing and manual booking journey aligned across pages", () => {
    expect(couplesBudgetReset.pilotPrice).toBe(99);
    expect(couplesBudgetReset.futurePriceRange).toBe("£129–£149");
    expect(couplesBudgetReset.includes).toHaveLength(4);
    expect(couplesBudgetReset.nextSteps).toHaveLength(4);
    expect(couplesBudgetReset.nextSteps[0]).toContain("short intake form");
    expect(couplesBudgetReset.nextSteps[2]).toContain("payment instructions");
  });

  it("states clear non-regulated-advice boundaries on the public site", () => {
    expect(coachingDisclaimer).toContain("I do not provide regulated financial");
    expect(coachingDisclaimer).toContain("tax");
    expect(coachingDisclaimer).toContain("legal advice");
  });

  it("uses customer-facing trust copy while real testimonials are still being collected", () => {
    expect(coachingTestimonials.eyebrow).toContain("calm, practical, and supportive");
    expect(coachingTestimonials.heading).toContain("experience");
    expect(coachingTestimonials.quotes).toHaveLength(3);
    coachingTestimonials.quotes.forEach(item => {
      expect(item.attribution.length).toBeGreaterThan(0);
    });
  });

  it("includes a customer-facing FAQ that explains the intake and payment process", () => {
    expect(faqContent).toHaveLength(4);
    expect(faqContent[0].answer).toContain("confirm availability");
    expect(faqContent[1].answer).toContain("Payment is requested only after");
  });
});

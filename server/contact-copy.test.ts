import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("SteadyUs contact-path copy", () => {
  it("shows the branded SteadyUs support email across the new public conversion flow", () => {
    const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const bookingSource = readFileSync(resolve(process.cwd(), "client/src/pages/BookingPage.tsx"), "utf8");
    const checkoutSource = readFileSync(resolve(process.cwd(), "client/src/pages/CheckoutPage.tsx"), "utf8");

    expect(homeSource).toContain("supportEmail");
    expect(bookingSource).toContain("supportEmail");
    expect(checkoutSource).toContain("supportEmail");
    expect(homeSource).not.toContain("apgreenwood16@gmail.com");
    expect(bookingSource).not.toContain("apgreenwood16@gmail.com");
    expect(checkoutSource).not.toContain("apgreenwood16@gmail.com");
  });

  it("keeps the public experience focused on financial coaching and sends booking CTAs to the real form", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const bookingSource = readFileSync(resolve(process.cwd(), "client/src/pages/BookingPage.tsx"), "utf8");

    expect(homeSource).toContain('/couples-budget-reset#booking-form');
    expect(homeSource).not.toContain('/planner');
    expect(homeSource).not.toContain('Open planner demo');
    expect(bookingSource).toContain('id="booking-form"');
    expect(bookingSource).toContain('submitEnquiry');
    expect(appSource).not.toContain('path="/planner"');
  });

  it("keeps the admin workflow separate from public booking language", () => {
    const adminSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminLeads.tsx"), "utf8");

    expect(adminSource).toContain("DashboardLayout");
    expect(adminSource).toContain("LeadStatus");
    expect(adminSource).not.toContain("Couples Budget Reset booking");
  });
});


import { describe, expect, it } from "vitest";
import { createSeed } from "@/data/seed";
import {
  acceptOffer,
  advanceStage,
  chooseOutcome,
  login,
  markUnrepairable,
  recordOutcome,
  rejectOffer,
  reviewEligibility,
  submitOffer,
  submitReview,
  moderateReport,
  addCategory,
  setUserStatus,
  relevantRequests,
} from "@/lib/sallihha";

describe("Sallihha Business Logic", () => {
  it("detects roles and blocks suspended or inactive accounts", () => {
    const s = createSeed();

    expect(login(s, "omar@example.com", "Freelancer123").role)
      .toBe("freelancer");

    expect(() => login(s, "khalid@example.com", "Customer123"))
      .toThrow(/suspended/);

    expect(() => login(s, "reem@example.com", "Customer123"))
      .toThrow(/not activated/);
  });

  it("accepts one offer and marks competing offers Not Selected", () => {
    const s = acceptOffer(createSeed(), "U-2", "OF-3011");
    const r = s.requests.find((x) => x.id === "REQ-2042");

    expect(r.status).toBe("In Progress");
    expect(r.assignedFreelancerId).toBe("U-6");
    expect(r.stage).toBe("Diagnosis Confirmed");

    expect(s.offers.find((o) => o.id === "OF-3011").status)
      .toBe("Accepted");

    expect(s.offers.find((o) => o.id === "OF-3012").status)
      .toBe("Not Selected");
  });

  it("prevents accepting another offer on an assigned request", () => {
    const s = acceptOffer(createSeed(), "U-2", "OF-3011");

    expect(() => acceptOffer(s, "U-2", "OF-3012"))
      .toThrow();
  });

  it("rejects a pending offer without closing the request", () => {
    const s = rejectOffer(createSeed(), "U-2", "OF-3011");

    expect(s.offers.find((o) => o.id === "OF-3011").status)
      .toBe("Rejected");

    expect(s.requests.find((r) => r.id === "REQ-2042").status)
      .toBe("Awaiting Offers");
  });

  it("allows resubmission after a rejected offer", () => {
    const s = rejectOffer(createSeed(), "U-2", "OF-3011");

    const next = submitOffer(
      s,
      "U-6",
      "REQ-2042",
      250,
      "Updated battery replacement estimate",
    );

    expect(
      next.offers.filter(
        (o) =>
          o.requestId === "REQ-2042" &&
          o.freelancerId === "U-6" &&
          o.status === "Pending",
      ),
    ).toHaveLength(1);
  });

  it("prevents duplicate pending offers", () => {
    expect(() =>
      submitOffer(
        createSeed(),
        "U-6",
        "REQ-2042",
        250,
        "Another offer",
      ),
    ).toThrow(/active offer/);
  });

  it("shows freelancers only matching available requests", () => {
    const list = relevantRequests(createSeed(), "U-6");

    expect(list.length).toBeGreaterThan(0);

    expect(
      list.every(
        (r) =>
          r.status === "Awaiting Offers" &&
          ["cat-phones", "cat-tablets"].includes(r.categoryId),
      ),
    ).toBe(true);
  });

  it("enforces sequential repair stages", () => {
    const s = createSeed();

    expect(() =>
      advanceStage(
        s,
        "U-6",
        "REQ-2036",
        "Ready for Pickup",
      ),
    ).toThrow(/sequence/);

    const next = advanceStage(
      s,
      "U-6",
      "REQ-2036",
      "In Repair",
    );

    expect(
      next.requests.find((r) => r.id === "REQ-2036").stage,
    ).toBe("In Repair");
  });

  it("requires Ready for Pickup before completing repair", () => {
    expect(() =>
      recordOutcome(
        createSeed(),
        "U-6",
        "REQ-2036",
        "Completed",
      ),
    ).toThrow(/Ready for Pickup/);
  });

  it("requires customer decision for unrepairable devices", () => {
    const s = markUnrepairable(
      createSeed(),
      "U-6",
      "REQ-2036",
    );

    const pending = s.requests.find(
      (r) => r.id === "REQ-2036",
    );

    expect(pending.status).toBe("Awaiting Customer Decision");

    const next = chooseOutcome(
      s,
      "U-3",
      "REQ-2036",
      "Recycled",
    );

    const closed = next.requests.find(
      (r) => r.id === "REQ-2036",
    );

    expect(closed.status).toBe("Closed");
    expect(closed.outcome).toBe("Recycled");
  });

  it("allows reviews only for completed repairs", () => {
    const s = createSeed();

    expect(reviewEligibility(s, "U-2", "REQ-2027"))
      .toBeNull();

    expect(reviewEligibility(s, "U-2", "REQ-2015"))
      .toMatch(/completed/);

    expect(reviewEligibility(s, "U-2", "REQ-2021"))
      .toMatch(/already reviewed/);
  });

  it("creates a review for an eligible completed repair", () => {
    const s = submitReview(
      createSeed(),
      "U-2",
      "REQ-2027",
      5,
      "Excellent screen replacement.",
    );

    const review = s.reviews.find(
      (r) => r.requestId === "REQ-2027",
    );

    expect(review.rating).toBe(5);
    expect(review.freelancerId).toBe("U-8");
  });

  it("rejects invalid review ratings", () => {
    expect(() =>
      submitReview(
        createSeed(),
        "U-2",
        "REQ-2027",
        6,
        "Invalid rating",
      ),
    ).toThrow(/rating/);
  });

  it("allows admin to suspend a user and records audit", () => {
    const s = setUserStatus(
      createSeed(),
      "U-1",
      "U-9",
      "Suspended",
    );

    expect(s.users.find((u) => u.id === "U-9").status)
      .toBe("Suspended");

    expect(s.auditLog).toHaveLength(1);
  });

  it("records category creation in audit log", () => {
    const s = addCategory(
      createSeed(),
      "U-1",
      "Test Devices",
    );

    expect(
      s.categories.some((c) => c.name === "Test Devices"),
    ).toBe(true);

    expect(s.auditLog[0].action)
      .toMatch(/Added category/);
  });

  it("allows admin to dismiss a report", () => {
    const s = moderateReport(
      createSeed(),
      "U-1",
      "RP-204",
      "dismiss",
      "",
    );

    expect(
      s.reports.find((r) => r.id === "RP-204").status,
    ).toBe("Resolved");

    expect(s.auditLog).toHaveLength(1);
  });

  it("rejects unknown moderation actions", () => {
    expect(() =>
      moderateReport(
        createSeed(),
        "U-1",
        "RP-204",
        "invalid-action",
        "Testing invalid action",
      ),
    ).toThrow(/valid moderation action/);
  });

  it("prevents non-admin users from moderating reports", () => {
    expect(() =>
      moderateReport(
        createSeed(),
        "U-2",
        "RP-204",
        "dismiss",
        "",
      ),
    ).toThrow(/not allowed/);
  });
});

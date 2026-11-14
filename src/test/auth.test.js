
import { describe, expect, it } from "vitest";
import { demoHash, login, RuleError } from "../lib/sallihha.js";

// Create independent test users
function createTestState() {
  const user = (id, role, status) => ({
    id,
    role,
    status,
    email: `${id}@example.com`,
    passwordHash: demoHash("Test12345"),
  });

  return {
    users: [
      user("customer", "customer", "Active"),
      user("freelancer", "freelancer", "Active"),
      user("admin", "admin", "Active"),
      user("suspended", "customer", "Suspended"),
      user("inactive", "freelancer", "Pending Activation"),
    ],
  };
}

describe("Sallihha Authentication", () => {
  it.each(["customer", "freelancer", "admin"])(
    "detects the %s role",
    (role) => {
      const user = login(
        createTestState(),
        `${role}@example.com`,
        "Test12345"
      );

      expect(user.role).toBe(role);
    }
  );

  it("rejects incorrect credentials", () => {
    expect(() =>
      login(createTestState(), "customer@example.com", "Wrong123")
    ).toThrow("Incorrect email or password.");
  });

  it("requires email and password", () => {
    expect(() => login(createTestState(), "", "")).toThrow(
      "Email and password are required."
    );
  });

  it("blocks suspended accounts", () => {
    expect(() =>
      login(createTestState(), "suspended@example.com", "Test12345")
    ).toThrow(/suspended/i);
  });

  it("blocks accounts pending activation", () => {
    expect(() =>
      login(createTestState(), "inactive@example.com", "Test12345")
    ).toThrow(/not activated/i);
  });

  it("provides the inactive error field", () => {
    try {
      login(createTestState(), "inactive@example.com", "Test12345");
      expect.fail("Expected login to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(RuleError);
      expect(error.field).toBe("inactive");
    }
  });

  it("accepts case-insensitive email addresses", () => {
    const user = login(
      createTestState(),
      "CUSTOMER@EXAMPLE.COM",
      "Test12345"
    );

    expect(user.role).toBe("customer");
  });
});

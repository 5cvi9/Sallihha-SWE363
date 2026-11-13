
/**
 * Authentication business logic.
 * Demo authentication only.
 */

export class RuleError extends Error {
    constructor(message, field) {
      super(message);
      this.name = "RuleError";
      this.field = field;
    }
  }
  
  // Demo password hash
  export function demoHash(value) {
    let h = 5381;
  
    for (let i = 0; i < value.length; i++) {
      h = ((h << 5) + h + value.charCodeAt(i)) | 0;
    }
  
    return "demo$" + (h >>> 0).toString(16);
  }
  
  // Login and role detection
  export function login(state, email, password) {
    if (!email.trim() || !password) {
      throw new RuleError("Email and password are required.");
    }
  
    const user = state.users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase()
    );
  
    if (!user || user.passwordHash !== demoHash(password)) {
      throw new RuleError("Incorrect email or password.");
    }
  
    // Block inactive accounts
    if (user.status === "Pending Activation") {
      throw new RuleError(
        "Your account is not activated yet. Please use the activation link first.",
        "inactive"
      );
    }
  
    // Block suspended accounts
    if (user.status === "Suspended") {
      throw new RuleError(
        "This account has been suspended. Please contact Sallihha support.",
        "suspended"
      );
    }
  
    return user;
  }
  
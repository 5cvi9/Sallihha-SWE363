
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
  

// ============================================
// Request Validation & Freelancer Business Logic
// ============================================


export const MIN_DESCRIPTION = 20;

export function validateRequest(state, input) {
  const errors = {};

  const cat = state.categories.find(
    (c) => c.id === input.categoryId
  );

  if (!cat || !cat.active) {
    errors["categoryId"] = "Select a device category.";
  }

  if (!input.title.trim()) {
    errors["title"] = "Give your request a short title.";
  }

  if (input.description.trim().length < MIN_DESCRIPTION) {
    errors["description"] =
      `Describe the problem in at least ${MIN_DESCRIPTION} characters.`;
  }

  if (input.photos.length === 0) {
    errors["photos"] = "Upload at least one photo of the device.";
  }

  return errors;
}


export const now = () => new Date().toISOString();

function getUser(state, id) {
  const user = state.users.find((u) => u.id === id);

  if (!user) {
    throw new RuleError("Account not found.");
  }

  return user;
}

function requireRole(state, id, role) {
  const user = getUser(state, id);

  if (user.role !== role) {
    throw new RuleError("You are not allowed to perform this action.");
  }

  if (user.status !== "Active") {
    throw new RuleError("Your account is not active.");
  }

  return user;
}


export function createRequest(state, customerId, input) {
  requireRole(state, customerId, "customer");

  const errors = validateRequest(state, input);
  const first = Object.entries(errors)[0];

  if (first) {
    throw new RuleError(first[1], first[0]);
  }

  const n = state.counters.request + 1;

  const req = {
    id: `REQ-${n}`,
    customerId,
    categoryId: input.categoryId,
    title: input.title.trim(),
    deviceModel: input.deviceModel.trim(),
    description: input.description.trim(),
    photos: input.photos,
    createdAt: now(),
    status: "Awaiting Offers",
    history: [
      { label: "Request posted", at: now() }
    ],
  };

  return {
    state: {
      ...state,
      requests: [req, ...state.requests],
      counters: {
        ...state.counters,
        request: n,
      },
    },
    requestId: req.id,
  };
}

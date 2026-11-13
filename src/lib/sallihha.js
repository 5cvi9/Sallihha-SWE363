
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


export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordProblem(pw) {
  if (pw.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[0-9]/.test(pw)) {
    return "Password must include at least one number.";
  }

  if (!/[A-Za-z]/.test(pw)) {
    return "Password must include at least one letter.";
  }

  return null;
}


export function validateRegistration(state, input) {
  const errors = {};

  if (!input.name.trim()) {
    errors["name"] = "Full name is required.";
  }

  if (!input.email.trim()) {
    errors["email"] = "Email is required.";
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors["email"] = "Enter a valid email address.";
  } else if (
    state.users.some(
      (u) =>
        u.email.toLowerCase() ===
        input.email.trim().toLowerCase()
    )
  ) {
    errors["email"] = "An account with this email already exists.";
  }

  if (!input.phone.trim()) {
    errors["phone"] = "Phone number is required.";
  } else if (!/^\+?[0-9\s-]{8,15}$/.test(input.phone.trim())) {
    errors["phone"] = "Enter a valid phone number (8–15 digits).";
  }

  const pw = passwordProblem(input.password);

  if (pw) {
    errors["password"] = pw;
  }

  if (input.confirmPassword !== input.password) {
    errors["confirmPassword"] = "Passwords do not match.";
  }

  if (
    input.role === "freelancer" &&
    input.categoryIds.length === 0
  ) {
    errors["categoryIds"] =
      "Select at least one repair category.";
  }

  return errors;
}


export function register(state, input) {
  const errors = validateRegistration(state, input);
  const first = Object.entries(errors)[0];

  if (first) {
    throw new RuleError(first[1], first[0]);
  }

  const n = state.counters.user + 1;

  const user = {
    id: `U-${n}`,
    role: input.role,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: demoHash(input.password),
    status: "Pending Activation",
    joinedAt: now(),
    ...(input.role === "freelancer"
      ? {
          categoryIds: input.categoryIds,
          bio: "",
          city: "",
        }
      : {}),
  };

  return {
    state: {
      ...state,
      users: [...state.users, user],
      counters: {
        ...state.counters,
        user: n,
      },
    },
    userId: user.id,
  };
}


export function activate(state, userId) {
  const user = state.users.find((u) => u.id === userId);

  if (!user) {
    throw new RuleError(
      "This activation link is invalid or has expired."
    );
  }

  if (user.status === "Suspended") {
    throw new RuleError("This account is suspended.");
  }

  return {
    ...state,
    users: state.users.map((u) =>
      u.id === userId
        ? { ...u, status: "Active" }
        : u
    ),
  };
}

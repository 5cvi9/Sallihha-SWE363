
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


export function relevantRequests(state, freelancerId) {
  const freelancer = getUser(state, freelancerId);
  const categories = freelancer.categoryIds ?? [];

  return state.requests.filter(
    (request) =>
      request.status === "Awaiting Offers" &&
      !request.removed &&
      categories.includes(request.categoryId)
  );
}


export function submitOffer(state, freelancerId, requestId, price, note) {
  const freelancer = requireRole(state, freelancerId, "freelancer");

  const request = state.requests.find((r) => r.id === requestId);

  if (!request || request.removed) {
    throw new RuleError("Repair request not found.");
  }

  if (request.status !== "Awaiting Offers") {
    throw new RuleError("This request is no longer accepting offers.");
  }

  if (!(freelancer.categoryIds ?? []).includes(request.categoryId)) {
    throw new RuleError("This request does not match your repair categories.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new RuleError("Enter a price greater than 0.", "price");
  }

  if (price > 100000) {
    throw new RuleError("Enter a realistic price estimate.", "price");
  }

  if (note.length > 500) {
    throw new RuleError("Note must be 500 characters or fewer.", "note");
  }

  if (
    state.offers.some(
      (o) =>
        o.requestId === requestId &&
        o.freelancerId === freelancerId &&
        o.status === "Pending"
    )
  ) {
    throw new RuleError("You already have an active offer on this request.");
  }

  const n = state.counters.offer + 1;

  const offer = {
    id: `OF-${n}`,
    requestId,
    freelancerId,
    price: Math.round(price * 100) / 100,
    note: note.trim(),
    createdAt: now(),
    status: "Pending",
  };

  return {
    ...state,
    offers: [offer, ...state.offers],
    counters: {
      ...state.counters,
      offer: n,
    },
  };
}


export function withdrawOffer(state, freelancerId, offerId) {
  const offer = state.offers.find((o) => o.id === offerId);

  if (!offer || offer.freelancerId !== freelancerId) {
    throw new RuleError("Offer not found.");
  }

  if (offer.status !== "Pending") {
    throw new RuleError("Only pending offers can be withdrawn.");
  }

  return {
    ...state,
    offers: state.offers.map((o) =>
      o.id === offerId
        ? { ...o, status: "Withdrawn" }
        : o
    ),
  };
}


export const STAGES = [
  "Diagnosis Confirmed",
  "In Repair",
  "Ready for Pickup",
];

export const CUSTOMER_OUTCOMES = [
  "Returned to Customer",
  "Donated",
  "Reused for Parts",
  "Recycled",
];

function assignedRepair(state, freelancerId, requestId) {
  requireRole(state, freelancerId, "freelancer");

  const request = state.requests.find((r) => r.id === requestId);

  if (!request || request.assignedFreelancerId !== freelancerId) {
    throw new RuleError("This repair is not assigned to you.");
  }

  return request;
}

export function nextStage(stage) {
  const index = stage ? STAGES.indexOf(stage) : -1;
  return STAGES[index + 1] ?? null;
}

export function advanceStage(
  state,
  freelancerId,
  requestId,
  target,
  note = ""
) {
  const request = assignedRepair(state, freelancerId, requestId);

  if (request.status !== "In Progress") {
    throw new RuleError(
      "Progress can only be updated on in-progress repairs."
    );
  }

  const expected = nextStage(request.stage);

  if (target !== expected) {
    throw new RuleError(
      expected
        ? `Stages must follow the sequence. The next stage is "${expected}".`
        : "This repair is already at the final stage."
    );
  }

  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            stage: target,
            history: [
              ...r.history,
              {
                label: target,
                at: now(),
                note: note.trim() || undefined,
              },
            ],
          }
        : r
    ),
  };
}

export function recordOutcome(
  state,
  freelancerId,
  requestId,
  outcome
) {
  const request = assignedRepair(state, freelancerId, requestId);

  if (request.outcome || request.status === "Closed") {
    throw new RuleError(
      "An outcome has already been recorded for this repair."
    );
  }

  if (outcome !== "Completed") {
    throw new RuleError(
      "Unrepairable devices must be marked unrepairable so the customer decides."
    );
  }

  if (request.status !== "In Progress") {
    throw new RuleError("Only in-progress repairs can be closed.");
  }

  if (request.stage !== "Ready for Pickup") {
    throw new RuleError(
      'Move the repair to "Ready for Pickup" before marking it completed.'
    );
  }

  const t = now();

  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "Closed",
            outcome,
            closedAt: t,
            history: [
              ...r.history,
              { label: "Repair completed", at: t },
            ],
          }
        : r
    ),
  };
}

export function markUnrepairable(
  state,
  freelancerId,
  requestId
) {
  const request = assignedRepair(state, freelancerId, requestId);

  if (request.outcome || request.status === "Closed") {
    throw new RuleError(
      "An outcome has already been recorded for this repair."
    );
  }

  if (request.status === "Awaiting Customer Decision") {
    throw new RuleError(
      "This repair is already waiting for the customer's decision."
    );
  }

  if (request.status !== "In Progress") {
    throw new RuleError(
      "Only in-progress repairs can be marked unrepairable."
    );
  }

  const t = now();

  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "Awaiting Customer Decision",
            history: [
              ...r.history,
              {
                label: "Marked unrepairable — awaiting customer decision",
                at: t,
              },
            ],
          }
        : r
    ),
  };
}

export function chooseOutcome(
  state,
  customerId,
  requestId,
  outcome
) {
  requireRole(state, customerId, "customer");

  const request = state.requests.find(
    (r) => r.id === requestId && r.customerId === customerId
  );

  if (!request) {
    throw new RuleError("Repair request not found.");
  }

  if (request.status === "Closed" || request.outcome) {
    throw new RuleError(
      "A final decision has already been recorded for this repair."
    );
  }

  if (request.status !== "Awaiting Customer Decision") {
    throw new RuleError(
      "This request is not waiting for a customer decision."
    );
  }

  if (!CUSTOMER_OUTCOMES.includes(outcome)) {
    throw new RuleError(
      "Choose one of the available options.",
      "outcome"
    );
  }

  const t = now();

  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "Closed",
            outcome,
            closedAt: t,
            history: [
              ...r.history,
              {
                label: `Customer decision — ${outcome}`,
                at: t,
              },
            ],
          }
        : r
    ),
  };
}

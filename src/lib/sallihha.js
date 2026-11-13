export const STAGES = ["Diagnosis Confirmed", "In Repair", "Ready for Pickup"];

export const CUSTOMER_OUTCOMES = [
  "Returned to Customer",
  "Donated",
  "Reused for Parts",
  "Recycled",
];
export const REPORT_REASONS = [
  "Inappropriate behavior",
  "Misleading or fake content",
  "Suspected fraud or scam",
  "Spam",
  "Harassment",
  "Other",
];

export class RuleError extends Error {
  field;
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}


export const now = () => new Date().toISOString();

export function demoHash(value) {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return "demo$" + (h >>> 0).toString(16);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordProblem(pw) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
  if (!/[A-Za-z]/.test(pw)) return "Password must include at least one letter.";
  return null;
}

export function freelancerRating(state, freelancerId) {
  const list = state.reviews.filter((r) => r.freelancerId === freelancerId);
  if (!list.length) return { average: 0, count: 0 };
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { average: Math.round(avg * 10) / 10, count: list.length };
}

export function categoryName(state, id) {
  return state.categories.find((c) => c.id === id)?.name ?? "Unknown";
}

function audit(state, actorId, action) {
  return [{ id: `AU-${state.audit.length + 1}`, at: now(), actorId, action }, ...state.audit];
}

function getUser(state, id) {
  const u = state.users.find((x) => x.id === id);
  if (!u) throw new RuleError("Account not found.");
  return u;
}

function requireRole(state, id, role) {
  const u = getUser(state, id);
  if (u.role !== role) throw new RuleError("You are not allowed to perform this action.");
  if (u.status !== "Active") throw new RuleError("Your account is not active.");
  return u;
}

export function validateRegistration(state, input) {
  const errors = {};
  if (!input.name.trim()) errors["name"] = "Full name is required.";
  if (!input.email.trim()) errors["email"] = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors["email"] = "Enter a valid email address.";
  else if (state.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase()))
    errors["email"] = "An account with this email already exists.";
  if (!input.phone.trim()) errors["phone"] = "Phone number is required.";
  else if (!/^\+?[0-9\s-]{8,15}$/.test(input.phone.trim()))
    errors["phone"] = "Enter a valid phone number (8–15 digits).";
  const pw = passwordProblem(input.password);
  if (pw) errors["password"] = pw;
  if (input.confirmPassword !== input.password)
    errors["confirmPassword"] = "Passwords do not match.";
  if (input.role === "freelancer" && input.categoryIds.length === 0)
    errors["categoryIds"] = "Select at least one repair category.";
  return errors;
}

export function register(state, input) {
  const errors = validateRegistration(state, input);
  const first = Object.entries(errors)[0];
  if (first) throw new RuleError(first[1], first[0]);
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
    ...(input.role === "freelancer" ? { categoryIds: input.categoryIds, bio: "", city: "" } : {}),
  };
  return {
    state: { ...state, users: [...state.users, user], counters: { ...state.counters, user: n } },
    userId: user.id,
  };
}

export function activate(state, userId) {
  const u = state.users.find((x) => x.id === userId);
  if (!u) throw new RuleError("This activation link is invalid or has expired.");
  if (u.status === "Suspended") throw new RuleError("This account is suspended.");
  return {
    ...state,
    users: state.users.map((x) => (x.id === userId ? { ...x, status: "Active" } : x)),
  };
}

export function login(state, email, password) {
  if (!email.trim() || !password) throw new RuleError("Email and password are required.");
  const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.passwordHash !== demoHash(password))
    throw new RuleError("Incorrect email or password.");
  if (u.status === "Pending Activation")
    throw new RuleError(
      "Your account is not activated yet. Please use the activation link first.",
      "inactive",
    );
  if (u.status === "Suspended")
    throw new RuleError(
      "This account has been suspended. Please contact Sallihha support.",
      "suspended",
    );
  return u;
}

export const MIN_DESCRIPTION = 20;

export function validateRequest(state, input) {
  const errors = {};
  const cat = state.categories.find((c) => c.id === input.categoryId);
  if (!cat || !cat.active) errors["categoryId"] = "Select a device category.";
  if (!input.title.trim()) errors["title"] = "Give your request a short title.";
  if (input.description.trim().length < MIN_DESCRIPTION)
    errors["description"] = `Describe the problem in at least ${MIN_DESCRIPTION} characters.`;
  if (input.photos.length === 0) errors["photos"] = "Upload at least one photo of the device.";
  return errors;
}

export function createRequest(state, customerId, input) {
  requireRole(state, customerId, "customer");
  const errors = validateRequest(state, input);
  const first = Object.entries(errors)[0];
  if (first) throw new RuleError(first[1], first[0]);
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
    history: [{ label: "Request posted", at: now() }],
  };
  return {
    state: {
      ...state,
      requests: [req, ...state.requests],
      counters: { ...state.counters, request: n },
    },
    requestId: req.id,
  };
}

function ownRequest(state, customerId, requestId) {
  const r = state.requests.find((x) => x.id === requestId);
  if (!r || r.customerId !== customerId) throw new RuleError("Repair request not found.");
  return r;
}

export function acceptOffer(state, customerId, offerId) {
  requireRole(state, customerId, "customer");
  const offer = state.offers.find((o) => o.id === offerId);
  if (!offer) throw new RuleError("Offer not found.");
  const req = ownRequest(state, customerId, offer.requestId);
  if (req.status !== "Awaiting Offers" || req.assignedFreelancerId)
    throw new RuleError("This request already has an accepted offer.");
  if (offer.status !== "Pending")
    throw new RuleError(`This offer is ${offer.status.toLowerCase()} and cannot be accepted.`);
  const t = now();
  return {
    ...state,
    offers: state.offers.map((o) => {
      if (o.id === offerId) return { ...o, status: "Accepted" };
      if (o.requestId === req.id && o.status === "Pending") return { ...o, status: "Not Selected" };
      return o;
    }),
    requests: state.requests.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: "In Progress",
            assignedFreelancerId: offer.freelancerId,
            acceptedOfferId: offer.id,
            stage: "Diagnosis Confirmed",
            history: [
              ...r.history,
              { label: "Offer accepted", at: t, note: `SAR ${offer.price}` },
              { label: "Diagnosis Confirmed", at: t },
            ],
          }
        : r,
    ),
  };
}

export function rejectOffer(state, customerId, offerId) {
  requireRole(state, customerId, "customer");
  const offer = state.offers.find((o) => o.id === offerId);
  if (!offer) throw new RuleError("Offer not found.");
  ownRequest(state, customerId, offer.requestId);
  if (offer.status !== "Pending")
    throw new RuleError(`This offer is already ${offer.status.toLowerCase()}.`);
  return {
    ...state,
    offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: "Rejected" } : o)),
  };
}

export function reviewEligibility(state, customerId, requestId) {
  const r = state.requests.find((x) => x.id === requestId);
  if (!r || r.customerId !== customerId) return "Only the owner of this repair can review it.";
  if (r.status !== "Closed" || r.outcome !== "Completed")
    return "Only completed repairs can be reviewed.";
  if (state.reviews.some((v) => v.requestId === requestId))
    return "You have already reviewed this repair.";
  return null;
}

export function submitReview(state, customerId, requestId, rating, text) {
  requireRole(state, customerId, "customer");
  const problem = reviewEligibility(state, customerId, requestId);
  if (problem) throw new RuleError(problem);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new RuleError("Choose a rating from 1 to 5.", "rating");
  if (text.trim().length > 500)
    throw new RuleError("Review must be 500 characters or fewer.", "text");
  const r = state.requests.find((x) => x.id === requestId);
  const n = state.counters.review + 1;
  const review = {
    id: `RV-${n}`,
    requestId,
    customerId,
    freelancerId: r.assignedFreelancerId,
    rating,
    text: text.trim(),
    createdAt: now(),
  };
  return {
    ...state,
    reviews: [review, ...state.reviews],
    counters: { ...state.counters, review: n },
  };
}

export function submitReport(state, reporterId, input) {
  const u = getUser(state, reporterId);
  if (u.role === "admin" || u.status !== "Active")
    throw new RuleError("You cannot submit reports.");
  if (!input.reason) throw new RuleError("Choose a reason for the report.", "reason");
  if (input.description.trim().length < 10)
    throw new RuleError("Describe the issue in at least 10 characters.", "description");
  const n = state.counters.report + 1;
  const report = {
    id: `RP-${n}`,
    reporterId,
    ...input,
    description: input.description.trim(),
    createdAt: now(),
    status: "Open",
  };
  return {
    state: {
      ...state,
      reports: [report, ...state.reports],
      counters: { ...state.counters, report: n },
    },
    reportId: report.id,
  };
}


export function relevantRequests(state, freelancerId) {
  const f = getUser(state, freelancerId);
  const cats = f.categoryIds ?? [];
  return state.requests.filter(
    (r) => r.status === "Awaiting Offers" && !r.removed && cats.includes(r.categoryId),
  );
}

export function submitOffer(state, freelancerId, requestId, price, note) {
  const f = requireRole(state, freelancerId, "freelancer");
  const req = state.requests.find((r) => r.id === requestId);
  if (!req || req.removed) throw new RuleError("Repair request not found.");
  if (req.status !== "Awaiting Offers")
    throw new RuleError("This request is no longer accepting offers.");
  if (!(f.categoryIds ?? []).includes(req.categoryId))
    throw new RuleError("This request does not match your repair categories.");
  if (!Number.isFinite(price) || price <= 0)
    throw new RuleError("Enter a price greater than 0.", "price");
  if (price > 100000) throw new RuleError("Enter a realistic price estimate.", "price");
  if (note.length > 500) throw new RuleError("Note must be 500 characters or fewer.", "note");
  if (
    state.offers.some(
      (o) => o.requestId === requestId && o.freelancerId === freelancerId && o.status === "Pending",
    )
  )
    throw new RuleError("You already have an active offer on this request.");
  if (
    state.offers.some(
      (o) =>
        o.requestId === requestId && o.freelancerId === freelancerId && o.status === "Rejected",
    )
  ) {
    
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
  return { ...state, offers: [offer, ...state.offers], counters: { ...state.counters, offer: n } };
}

export function withdrawOffer(state, freelancerId, offerId) {
  const o = state.offers.find((x) => x.id === offerId);
  if (!o || o.freelancerId !== freelancerId) throw new RuleError("Offer not found.");
  if (o.status !== "Pending") throw new RuleError("Only pending offers can be withdrawn.");
  return {
    ...state,
    offers: state.offers.map((x) => (x.id === offerId ? { ...x, status: "Withdrawn" } : x)),
  };
}

function assignedRepair(state, freelancerId, requestId) {
  requireRole(state, freelancerId, "freelancer");
  const r = state.requests.find((x) => x.id === requestId);
  if (!r || r.assignedFreelancerId !== freelancerId)
    throw new RuleError("This repair is not assigned to you.");
  return r;
}

export function nextStage(stage) {
  const i = stage ? STAGES.indexOf(stage) : -1;
  return STAGES[i + 1] ?? null;
}

export function advanceStage(state, freelancerId, requestId, target, note = "") {
  const r = assignedRepair(state, freelancerId, requestId);
  if (r.status !== "In Progress")
    throw new RuleError("Progress can only be updated on in-progress repairs.");
  const expected = nextStage(r.stage);
  if (target !== expected)
    throw new RuleError(
      expected
        ? `Stages must follow the sequence. The next stage is "${expected}".`
        : "This repair is already at the final stage.",
    );
  return {
    ...state,
    requests: state.requests.map((x) =>
      x.id === requestId
        ? {
            ...x,
            stage: target,
            history: [...x.history, { label: target, at: now(), note: note.trim() || undefined }],
          }
        : x,
    ),
  };
}


export function recordOutcome(state, freelancerId, requestId, outcome) {
  const r = assignedRepair(state, freelancerId, requestId);
  if (r.outcome || r.status === "Closed")
    throw new RuleError("An outcome has already been recorded for this repair.");
  if (outcome !== "Completed")
    throw new RuleError(
      "Unrepairable devices must be marked unrepairable so the customer decides.",
    );
  if (r.status !== "In Progress") throw new RuleError("Only in-progress repairs can be closed.");
  if (r.stage !== "Ready for Pickup")
    throw new RuleError('Move the repair to "Ready for Pickup" before marking it completed.');
  const t = now();
  return {
    ...state,
    requests: state.requests.map((x) =>
      x.id === requestId
        ? {
            ...x,
            status: "Closed",
            outcome,
            closedAt: t,
            history: [...x.history, { label: "Repair completed", at: t }],
          }
        : x,
    ),
  };
}


export function markUnrepairable(state, freelancerId, requestId) {
  const r = assignedRepair(state, freelancerId, requestId);
  if (r.outcome || r.status === "Closed")
    throw new RuleError("An outcome has already been recorded for this repair.");
  if (r.status === "Awaiting Customer Decision")
    throw new RuleError("This repair is already waiting for the customer's decision.");
  if (r.status !== "In Progress")
    throw new RuleError("Only in-progress repairs can be marked unrepairable.");
  const t = now();
  return {
    ...state,
    requests: state.requests.map((x) =>
      x.id === requestId
        ? {
            ...x,
            status: "Awaiting Customer Decision",
            history: [
              ...x.history,
              { label: "Marked unrepairable — awaiting customer decision", at: t },
            ],
          }
        : x,
    ),
  };
}

export function chooseOutcome(state, customerId, requestId, outcome) {
  requireRole(state, customerId, "customer");
  const r = ownRequest(state, customerId, requestId);
  if (r.status === "Closed" || r.outcome)
    throw new RuleError("A final decision has already been recorded for this repair.");
  if (r.status !== "Awaiting Customer Decision")
    throw new RuleError("This request is not waiting for a customer decision.");
  if (!CUSTOMER_OUTCOMES.includes(outcome))
    throw new RuleError("Choose one of the available options.", "outcome");
  const t = now();
  return {
    ...state,
    requests: state.requests.map((x) =>
      x.id === requestId
        ? {
            ...x,
            status: "Closed",
            outcome,
            closedAt: t,
            history: [...x.history, { label: `Customer decision — ${outcome}`, at: t }],
          }
        : x,
    ),
  };
}

export function updateProfile(state, freelancerId, input) {
  requireRole(state, freelancerId, "freelancer");
  if (!input.name.trim()) throw new RuleError("Full name is required.", "name");
  if (!input.phone.trim()) throw new RuleError("Phone number is required.", "phone");
  if (input.categoryIds.length === 0)
    throw new RuleError("At least one repair category must remain selected.", "categoryIds");
  if (input.bio.length > 400) throw new RuleError("Bio must be 400 characters or fewer.", "bio");
  return {
    ...state,
    users: state.users.map((u) =>
      u.id === freelancerId
        ? {
            ...u,
            name: input.name.trim(),
            phone: input.phone.trim(),
            city: input.city.trim(),
            bio: input.bio.trim(),
            categoryIds: input.categoryIds,
          }
        : u,
    ),
  };
}


export function setUserStatus(state, adminId, userId, status) {
  requireRole(state, adminId, "admin");
  const u = getUser(state, userId);
  if (u.role === "admin") throw new RuleError("Admin accounts cannot be changed here.");
  if (u.status === status) throw new RuleError(`Account is already ${status.toLowerCase()}.`);
  return {
    ...state,
    users: state.users.map((x) => (x.id === userId ? { ...x, status } : x)),
    audit: audit(
      state,
      adminId,
      `${status === "Suspended" ? "Suspended" : "Reactivated"} ${u.name} (${u.id})`,
    ),
  };
}

function validateCategoryName(state, name, exceptId) {
  const n = name.trim();
  if (!n) throw new RuleError("Category name cannot be empty.", "name");
  if (n.length > 40) throw new RuleError("Category name must be 40 characters or fewer.", "name");
  if (state.categories.some((c) => c.id !== exceptId && c.name.toLowerCase() === n.toLowerCase()))
    throw new RuleError("A category with this name already exists.", "name");
  return n;
}

export function addCategory(state, adminId, name) {
  requireRole(state, adminId, "admin");
  const n = validateCategoryName(state, name);
  const id =
    "cat-" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + (state.categories.length + 1);
  return {
    ...state,
    categories: [...state.categories, { id, name: n, active: true }],
    audit: audit(state, adminId, `Added category ${n}`),
  };
}

export function renameCategory(state, adminId, id, name) {
  requireRole(state, adminId, "admin");
  const n = validateCategoryName(state, name, id);
  return {
    ...state,
    categories: state.categories.map((c) => (c.id === id ? { ...c, name: n } : c)),
  };
}

export function categoryUsage(state, id) {
  const activeRequests = state.requests.filter(
    (r) => r.categoryId === id && r.status !== "Closed",
  ).length;
  const anyRequests = state.requests.filter((r) => r.categoryId === id).length;
  const providers = state.users.filter((u) => u.categoryIds?.includes(id)).length;
  return { activeRequests, anyRequests, providers };
}

export function removeCategory(state, adminId, id) {
  requireRole(state, adminId, "admin");
  const usage = categoryUsage(state, id);
  if (usage.activeRequests > 0)
    throw new RuleError("This category is used by active requests. Deactivate it instead.");
  if (usage.anyRequests > 0)
    throw new RuleError("This category appears in repair history. Deactivate it instead.");
  return {
    ...state,
    categories: state.categories.filter((c) => c.id !== id),
    users: state.users.map((u) =>
      u.categoryIds ? { ...u, categoryIds: u.categoryIds.filter((c) => c !== id) } : u,
    ),
  };
}

export function setCategoryActive(state, adminId, id, active) {
  requireRole(state, adminId, "admin");
  return {
    ...state,
    categories: state.categories.map((c) => (c.id === id ? { ...c, active } : c)),
  };
}

export function markReportReviewed(state, adminId, reportId) {
  requireRole(state, adminId, "admin");
  const r = state.reports.find((x) => x.id === reportId);
  if (!r) throw new RuleError("Report not found.");
  if (r.status !== "Open") throw new RuleError("This report has already been reviewed.");
  return {
    ...state,
    reports: state.reports.map((x) => (x.id === reportId ? { ...x, status: "Reviewed" } : x)),
  };
}

/** The account responsible for the reported item. */
export function reportedAccountId(state, report) {
  if (report.targetType === "user") return report.targetId;
  if (report.targetType === "request")
    return state.requests.find((r) => r.id === report.targetId)?.customerId;
  return state.offers.find((o) => o.id === report.targetId)?.freelancerId;
}

export function moderateReport(state, adminId, reportId, action, note) {
  requireRole(state, adminId, "admin");
  const report = state.reports.find((x) => x.id === reportId);
  if (!report) throw new RuleError("Report not found.");
  if (report.status === "Resolved") throw new RuleError("This report is already resolved.");
  if (action !== "dismiss" && note.trim().length < 5)
    throw new RuleError("Add a short note explaining the decision.", "note");
  let next = { ...state };
  let decision = "Dismissed — no violation found";
  if (action === "remove-content") {
    if (report.targetType === "request") {
      next.requests = next.requests.map((r) =>
        r.id === report.targetId ? { ...r, removed: true } : r,
      );
      next.offers = next.offers.map((o) =>
        o.requestId === report.targetId && o.status === "Pending"
          ? { ...o, status: "Withdrawn" }
          : o,
      );
      decision = "Request listing removed";
    } else if (report.targetType === "offer") {
      next.offers = next.offers.map((o) =>
        o.id === report.targetId && o.status === "Pending" ? { ...o, status: "Withdrawn" } : o,
      );
      decision = "Offer withdrawn by moderator";
    } else {
      throw new RuleError("A user profile cannot be removed. Suspend the account instead.");
    }
  }
  if (action === "suspend-account") {
    const uid = reportedAccountId(state, report);
    if (!uid) throw new RuleError("No account is linked to this report.");
    const u = getUser(state, uid);
    if (u.status !== "Suspended") next = setUserStatus(next, adminId, uid, "Suspended");
    decision = `Account suspended: ${u.name}`;
  }
  return {
    ...next,
    reports: next.reports.map((x) =>
      x.id === reportId
        ? { ...x, status: "Resolved", decision, decisionNote: note.trim(), decidedAt: now() }
        : x,
    ),
    audit: audit(next, adminId, `Resolved ${reportId}: ${decision}`),
  };
}

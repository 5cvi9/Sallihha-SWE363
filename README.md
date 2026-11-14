
# Sallihha — Electronic Device Repair Marketplace

**SWE 363 — Web Engineering**  
**Phase 4: Front-End Development**  
**Team 17 | Section F11**

## 1. Project Overview

Sallihha (صلّحها) is a web-based electronic device repair marketplace that connects customers seeking repair services with independent freelance technicians.

The platform provides a structured repair process, allowing customers to submit repair requests, compare offers from freelancers, monitor repair progress, and manage repair outcomes. Freelancers can browse available repair opportunities, submit offers, and manage accepted repairs. Administrators can oversee platform activity, manage users and repair categories, and moderate reports.

Sallihha aims to make electronic device repair more accessible, transparent, and organized while encouraging responsible decisions about devices that cannot be repaired.

The Phase 4 implementation is a functional front-end prototype developed using React and TanStack technologies. It includes role-specific interfaces, shared application state, centralized business logic, demonstration data, and automated tests.

The current implementation uses browser-based state persistence rather than a production database or backend authentication service.

---

## 2. Project Objectives

The main objectives of Sallihha are to:

- Simplify the process of requesting electronic device repairs.
- Connect customers with independent freelance repair technicians.
- Allow customers to review and compare repair offers.
- Provide visibility into repair progress and status changes.
- Support structured handling of successfully repaired and unrepairable devices.
- Allow customers to submit reviews for eligible completed repairs.
- Provide administrators with tools for managing platform users, freelancers, categories, and reports.
- Encourage responsible device repair and waste reduction.
- Provide a consistent user experience across customer, freelancer, and administrator workspaces.

---

## 3. User Roles and Features

Sallihha supports three primary user roles: Customer, Freelancer, and Administrator.

### 3.1 Customer

Customers can manage repair requests and interact with freelancers throughout the repair process.

**Customer Dashboard**

The customer dashboard provides an overview of the customer's repair activity, including:

- Requests awaiting offers.
- Newly received offers.
- Repairs in progress.
- Closed requests.
- Active repair requests.

**Create Repair Request**

Customers can submit repair requests by entering relevant device and repair information.

**My Repair Requests**

Customers can view their submitted requests and access the details of individual requests.

**Request Details and Offer Comparison**

Customers can review repair request information, inspect submitted offers, compare available freelancers, and select a repair offer.

**Freelancer Public Profiles**

Customers can view public freelancer information to support their selection of a repair provider.

**Repair Tracking**

Customers can monitor the status and progress of accepted repairs.

**Repair History**

Customers can access their previous repair requests and their outcomes.

**Repair Outcomes**

The application supports customer decisions concerning devices that cannot be repaired.

**Reviews and Reports**

Customers can submit reviews for eligible completed repairs and report issues through the supported application workflows.

### 3.2 Freelancer

Freelancers can discover repair opportunities, submit offers, and manage assigned repair work.

**Freelancer Dashboard**

Provides an overview of relevant repair activity.

**Available Repair Requests**

Displays repair requests available to the freelancer according to the application's eligibility rules.

**Repair Request Details**

Allows freelancers to inspect individual requests before submitting an offer.

**Offer Submission**

Supports submitting repair offers with business-rule validation.

**My Offers**

Displays submitted offers and their current statuses.

**Active Repairs**

Provides access to accepted repair assignments.

**Repair Progress Tracking**

Supports updating repair stages according to the defined workflow.

**Repair Outcomes**

Allows freelancers to record repair outcomes, including situations where a device cannot be repaired.

**Freelancer Profile**

Provides an interface for freelancer profile and service information.

### 3.3 Administrator

Administrators can oversee platform activity and manage important platform records.

**Admin Dashboard**

Displays platform activity and administrative information.

**User Management**

Provides interfaces for viewing and managing user accounts.

**Freelancer Management**

Displays freelancer profiles and service information.

**Category Management**

Supports repair category management and validation.

**Report Management**

Allows administrators to review, filter, and moderate reports.

**Audit Logging**

Relevant administrative operations can be recorded in the application's audit log.

---

## 4. Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface development |
| JavaScript / JSX | Application logic and React components |
| TanStack Start | Application framework |
| TanStack Router | File-based routing and navigation |
| TanStack Query | Query-client integration |
| Vite | Development environment and production builds |
| Tailwind CSS | Utility-based interface styling |
| Lucide React | Interface icons |
| Vitest | Automated testing |
| Node.js | JavaScript runtime for development tools |
| npm | Dependency and script management |
| Git | Version control |
| GitHub | Repository hosting and pull requests |
| Browser localStorage | Prototype data and session persistence |

### Application Architecture

The application separates responsibilities into reusable components, routes, shared state, business logic, and tests.

- **Routes:** Define public and role-specific application pages.
- **Components:** Provide reusable interface elements and layouts.
- **AppStore:** Manages shared application state and demo sessions.
- **Business Logic:** Applies validation and state-transition rules.
- **Seed Data:** Provides initial mock records for demonstration and testing.
- **Tests:** Verify selected authentication, business-rule, and routing behavior.

This structure allows multiple pages to reuse the same application state and business rules.

---

## 5. Prerequisites

Before running Sallihha locally, install:

- Node.js compatible with the project's dependencies.
- npm.
- Git.
- A modern web browser, such as Google Chrome.

Visual Studio Code is recommended for viewing and editing the project files.

The project's dependencies are defined in `package.json` and `package-lock.json`.

---

## 6. Installation and Setup

### Step 1 — Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/5cvi9/Sallihha-SWE363.git
```

### Step 2 — Open the Project Directory

```bash
cd Sallihha-SWE363
```

### Step 3 — Switch to the Development Branch

The integrated Phase 4 application was maintained on the `develop` branch during development.

```bash
git switch develop
```

This allows the evaluator or developer to access the integrated front-end implementation on that branch.

### Step 4 — Install Dependencies

```bash
npm install
```

npm installs the required dependencies using the project's package configuration.

The installed dependencies are stored in `node_modules`, which is excluded from Git.

### Step 5 — Start the Development Server

```bash
npm run dev
```

The development server prints the local application URL.

Example:

```text
Local: http://localhost:5173/
```

Open the displayed URL in a web browser.

If port 5173 is occupied, Vite may automatically select another available port, such as 5174 or 5175.

Always use the URL displayed in the terminal.

### Step 6 — Stop the Server

Press `Ctrl + C` in the terminal running the development server.

---

## 7. Production Build

To build the application, run:

```bash
npm run build
```

This executes the configured Vite production build.

During Phase 4 integration, the team successfully completed production builds for the application, including client and server-side rendering output.

Generated build files are excluded from source control through `.gitignore`.

A successful build confirms that the tested application compiles, but it does not independently verify every browser interaction.

---

## 8. Automated Testing

Sallihha uses Vitest for automated tests.

To run the complete available test suite:

```bash
npx vitest run
```

### Test Files

| Test file | Purpose | Recorded passing tests |
|---|---|---:|
| `src/test/auth.test.js` | Authentication and account-status validation | 9 |
| `src/test/sallihha.test.js` | Business rules and repair workflows | 18 |
| `src/test/app-routing.test.jsx` | Application routing | 1 |
| **Total** | **Automated tests** | **28** |

### Authentication Tests

The authentication tests cover:

- Customer role detection.
- Freelancer role detection.
- Administrator role detection.
- Incorrect credentials.
- Missing email or password.
- Suspended accounts.
- Accounts pending activation.
- Authentication error information.
- Case-insensitive email addresses.

### Business Logic Tests

The business-logic tests cover selected behavior related to:

- Offer submission and management.
- Offer acceptance and rejection.
- Freelancer eligibility.
- Repair-stage transitions.
- Unrepairable-device handling.
- Customer outcome selection.
- Review eligibility.
- Administrative operations.
- Report moderation.
- Audit logging.

### Routing Test

The routing test verifies a selected aspect of the application's routing integration.

### Recorded Results

The final integration test run reported:

```text
Test Files  3 passed (3)
Tests       28 passed (28)
```

These results reflect the recorded development state. Tests should be rerun after subsequent code changes.

Automated tests do not replace full browser-based functional testing.

---

## 9. Getting Started with the Application

Sallihha provides a public landing page and separate workspaces for customers, freelancers, and administrators.

### 9.1 Landing Page

Open the application at:

```text
/
```

The landing page introduces Sallihha and provides navigation to Login and Sign Up.

It also explains the main repair process:

1. Post a repair request.
2. Compare offers.
3. Track the repair.
4. Choose a responsible outcome for an unrepairable device.

### 9.2 Login

Navigate to:

```text
/login
```

Enter the email address and password of an existing demo account.

The application identifies the account's role and redirects the user to the corresponding workspace.

Invalid credentials, suspended accounts, and accounts pending activation are handled by the application's authentication rules.

### 9.3 Signup and Activation

The registration page is available at:

```text
/signup
```

The account activation page is available at:

```text
/activate
```

These routes provide the interfaces for registration and account activation in the prototype.

### 9.4 Demo Accounts and Evaluator Testing

Sallihha includes a dedicated development-only testing page for exploring the prototype using predefined accounts.

**Demo route:** `/demo`

**Source file:** `src/routes/demo.jsx`

The page displays accounts from the `DEMO_ACCOUNTS` collection defined in `src/data/seed.js`.

Each account entry contains:

- User role.
- Email address.
- Password.
- Notes describing the testing scenario.
- A Sign in button.

#### Quick Login

The demo page allows evaluators to access role-specific workspaces without manually typing credentials.

To use quick login:

1. Open `/demo` in the browser.
2. Find the desired Customer, Freelancer, or Administrator account.
3. Click **Sign in** beside the account.
4. The application validates the credentials against the current demo state.
5. On successful authentication, a demo session is created.
6. The user is redirected to the corresponding role-specific workspace.

The same credentials can also be entered manually on the normal `/login` page.

The application detects the user's role automatically.

#### Reset Demo Data

The demo page includes a **Reset demo data** function.

This restores the initial mock dataset and clears the current demo session.

To reset the data:

1. Navigate to `/demo`.
2. Click **Reset demo data**.
3. Confirm the action in the confirmation dialog.
4. The application restores the original demo data and signs out the current user.

The reset restores the initial mock accounts, requests, offers, reports, and related application records.

**Important:** Resetting demo data removes changes saved in the current browser. It does not modify the source files or GitHub repository.

#### Demo Page Security

The `/demo` route is intended for SWE 363 development and evaluation.

Authentication is simulated in the browser using predefined mock accounts.

It is not production-level authentication or security.

The route is separate from the normal user-facing navigation and includes a `noindex` metadata directive to discourage search-engine indexing.

The demo credentials are testing fixtures and must not be used as real production credentials.

---

## 10. Customer Usage Guide

### 10.1 Access the Customer Workspace

Sign in using an active customer demo account.

The customer dashboard is available at:

```text
/customer
```

The dashboard displays repair activity summaries and active requests.

### 10.2 Create a Repair Request

Navigate to:

```text
/customer/requests/new
```

Enter the required device and repair information.

The form uses the application's repair request validation rules.

After a successful submission, the request is added to the customer's repair records.

### 10.3 View Repair Requests

Navigate to:

```text
/customer/requests
```

This page displays the customer's repair requests.

Select a request to open its details.

Individual request pages use:

```text
/customer/requests/:id
```

The `:id` segment represents the selected request identifier.

### 10.4 Compare Offers

Open a repair request that has received freelancer offers.

Review the offer information and available freelancer details.

The customer can use the supported offer-selection workflow to choose a repair provider.

### 10.5 Track Repair Progress

After an offer is accepted, the repair proceeds through the stages defined by the business logic.

The request details page provides relevant repair status information.

### 10.6 View Repair History

Navigate to:

```text
/customer/history
```

This page provides access to previous repair requests and their outcomes.

### 10.7 Submit Reviews

The application supports customer reviews subject to eligibility rules.

Review submission is associated with the relevant completed repair workflow.

---

## 11. Freelancer Usage Guide

### 11.1 Access the Freelancer Workspace

Sign in using an active freelancer demo account.

The freelancer dashboard is available at:

```text
/freelancer
```

### 11.2 Browse Available Requests

Navigate to:

```text
/freelancer/requests
```

The page displays repair requests available to the freelancer according to the application's eligibility rules.

### 11.3 View Request Details

Select a repair request.

Individual request details use:

```text
/freelancer/requests/:id
```

The page provides the relevant request information and offer submission interface.

### 11.4 Submit an Offer

Use the request details interface to submit an offer.

The application validates the submitted information according to its business rules.

Relevant validation includes freelancer eligibility and prevention of duplicate pending offers.

### 11.5 Manage Submitted Offers

Navigate to:

```text
/freelancer/offers
```

This page displays submitted offers and their current statuses.

### 11.6 Manage Active Repairs

Navigate to:

```text
/freelancer/repairs
```

The page displays the freelancer's active repair assignments.

Individual repair details use:

```text
/freelancer/repairs/:id
```

### 11.7 Update Repair Progress

The repair details interface supports updating repair stages.

Stage transitions are validated by the application's business logic.

### 11.8 Record Repair Outcomes

The freelancer can record supported repair outcomes, including cases where a device cannot be repaired.

Certain outcomes require a subsequent customer decision before the request can be closed.

### 11.9 Freelancer Profile

Navigate to:

```text
/freelancer/profile
```

The page provides access to freelancer profile information and supported services.

---

## 12. Administrator Usage Guide

### 12.1 Access the Administrator Workspace

Sign in using an active administrator demo account.

The administrator dashboard is available at:

```text
/admin
```

### 12.2 View Platform Activity

The dashboard provides an overview of platform activity and administrative information.

### 12.3 Manage Users

Navigate to:

```text
/admin/users
```

This page provides user account management functionality.

Administrative actions follow the application's business rules.

### 12.4 Manage Freelancers

Navigate to:

```text
/admin/freelancers
```

The page displays freelancer profiles and service information.

### 12.5 Manage Repair Categories

Navigate to:

```text
/admin/categories
```

Administrators can manage supported repair categories.

Category operations use the application's validation rules.

### 12.6 Review and Moderate Reports

Navigate to:

```text
/admin/reports
```

The reports page supports report inspection, filtering, and moderation actions.

Relevant administrative changes may be recorded in the audit log.

---

## 13. Application State and Data Persistence

Sallihha uses a shared React context implementation to maintain application state.

The main state provider is located at:

```text
src/context/AppStore.jsx
```

### 13.1 State Initialization

The application initializes demo data using:

```text
src/data/seed.js
```

The seed provides initial records for demonstration and automated testing.

### 13.2 Shared State

The application makes shared state available to components through the store.

This allows pages to access and update relevant application records without maintaining completely independent data copies.

### 13.3 Browser Persistence

The prototype uses browser `localStorage` to retain demo data and session information.

The application uses:

```text
sallihha.data.v1
sallihha.session.v1
```

The stored data can persist across page refreshes within the same browser.

### 13.4 Resetting Demo Data

Previously saved browser data may differ from the current seed after development changes.

The application provides a `resetDemo` operation through the shared store.

The `/demo` page exposes this operation through a confirmation dialog.

Resetting restores the current initial seed and clears the demo session.

### 13.5 Security Limitations

The state and session mechanism is designed for an academic front-end prototype.

Browser localStorage is not a secure replacement for production authentication or a backend database.

Role-based navigation and client-side redirects do not replace server-enforced authorization.

---

## 14. Project Structure

The main project structure is:

```text
Sallihha-SWE363/
├── .gitignore
├── AI_USAGE.md
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.js
└── src/
    ├── assets/
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.jsx
    │   │   ├── AuthLayout.jsx
    │   │   └── SiteFooter.jsx
    │   ├── ui/
    │   ├── ConfirmDialog.jsx
    │   ├── ProgressTracker.jsx
    │   ├── ReportDialog.jsx
    │   └── shared.jsx
    ├── context/
    │   └── AppStore.jsx
    ├── data/
    │   └── seed.js
    ├── lib/
    │   ├── head.js
    │   ├── sallihha.js
    │   └── utils.js
    ├── routes/
    │   ├── __root.jsx
    │   ├── index.jsx
    │   ├── login.jsx
    │   ├── signup.jsx
    │   ├── activate.jsx
    │   ├── demo.jsx
    │   ├── customer.jsx
    │   ├── customer.index.jsx
    │   ├── customer.history.jsx
    │   ├── customer.requests.index.jsx
    │   ├── customer.requests.new.jsx
    │   ├── customer.requests.$id.jsx
    │   ├── customer.freelancers.$id.jsx
    │   ├── freelancer.jsx
    │   ├── freelancer.index.jsx
    │   ├── freelancer.profile.jsx
    │   ├── freelancer.offers.jsx
    │   ├── freelancer.requests.index.jsx
    │   ├── freelancer.requests.$id.jsx
    │   ├── freelancer.repairs.index.jsx
    │   ├── freelancer.repairs.$id.jsx
    │   ├── admin.jsx
    │   ├── admin.index.jsx
    │   ├── admin.users.jsx
    │   ├── admin.freelancers.jsx
    │   ├── admin.categories.jsx
    │   └── admin.reports.jsx
    └── test/
        ├── auth.test.js
        ├── sallihha.test.js
        └── app-routing.test.jsx
```

### Directory Responsibilities

| Directory | Responsibility |
|---|---|
| `src/assets/` | Static application assets and branding |
| `src/components/` | Reusable React components |
| `src/components/layout/` | Shared application and authentication layouts |
| `src/components/ui/` | Reusable interface controls |
| `src/context/` | Shared application state |
| `src/data/` | Demo seed data |
| `src/lib/` | Business logic and utility functions |
| `src/routes/` | Public and role-specific application pages |
| `src/test/` | Automated tests |

---

## 15. Routing and Navigation

Sallihha uses file-based routing through TanStack Router.

The application separates public pages from authenticated role-specific workspaces.

### 15.1 Public Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Registration |
| `/activate` | Account activation |
| `/demo` | Evaluator testing page |

### 15.2 Customer Routes

| Route | Purpose |
|---|---|
| `/customer` | Customer dashboard |
| `/customer/requests` | Repair requests |
| `/customer/requests/new` | Create a repair request |
| `/customer/requests/:id` | Request details |
| `/customer/history` | Repair history |
| `/customer/freelancers/:id` | Freelancer public profile |

### 15.3 Freelancer Routes

| Route | Purpose |
|---|---|
| `/freelancer` | Freelancer dashboard |
| `/freelancer/requests` | Available repair requests |
| `/freelancer/requests/:id` | Request details and offer submission |
| `/freelancer/offers` | Submitted offers |
| `/freelancer/repairs` | Active repairs |
| `/freelancer/repairs/:id` | Repair details |
| `/freelancer/profile` | Freelancer profile |

### 15.4 Administrator Routes

| Route | Purpose |
|---|---|
| `/admin` | Administrator dashboard |
| `/admin/users` | User management |
| `/admin/freelancers` | Freelancer management |
| `/admin/categories` | Category management |
| `/admin/reports` | Report moderation |

### 15.5 Role-Specific Layouts

The shared application shell provides role-specific navigation, a top bar, and account controls.

The customer and freelancer layout routes connect their pages to the shared application shell.

The administrator route provides the administrative workspace layout.

The current implementation uses prototype client-side role checks.

---

## 16. Business Logic and Validation

The application's shared business-logic module is:

```text
src/lib/sallihha.js
```

It centralizes rules used by different application pages.

### Authentication

Validates credentials, account status, and role detection.

### Repair Requests

Validates request information and supported request operations.

### Offers

Handles offer submission, acceptance, rejection, and relevant eligibility restrictions.

### Repair Progress

Validates repair-stage transitions.

### Repair Outcomes

Supports repair completion and unrepairable-device workflows.

### Reviews

Applies eligibility rules to customer reviews.

### Administration

Supports validated user-management, category-management, and moderation operations.

### Audit Logging

Records relevant administrative activity in the application's audit log.

Centralizing these rules helps maintain consistent behavior across the application's interfaces.

---

## 17. Development Workflow and Version Control

The team used Git and GitHub for collaborative development.

### Branches

**`main`**

Reserved for the stable release version.

**`develop`**

Used to integrate completed features and fixes.

**Feature branches**

Used for implementing individual features.

**Fix branches**

Used to resolve application defects and integration issues.

### Pull Request Workflow

The development workflow included:

1. Creating a feature or fix branch.
2. Implementing the assigned changes.
3. Reviewing changed files.
4. Running relevant tests and builds.
5. Committing the changes.
6. Pushing the branch to GitHub.
7. Opening a pull request targeting `develop`.
8. Reviewing changes and resolving conflicts.
9. Merging the approved pull request.
10. Updating the local development branch.

The project was developed collaboratively across shared components and role-specific features.

---

## 18. Team Contributions

The Phase 4 implementation was developed collaboratively by three team members.

### Lama

Contribution areas included:

- Project setup and foundation.
- Authentication and authentication tests.
- Customer dashboard.
- Customer request details and offer comparison.
- Freelancer available requests.
- Freelancer offer management.
- Admin dashboard.
- Admin report moderation.
- Business-logic integration.
- Demo seed data.
- Business-logic tests.
- Landing page.
- Final routing integration.
- Missing route integration.
- Routing tests.
- Git configuration cleanup.

### Norah

Contribution areas included:

- Signup and account activation.
- Customer repair request creation.
- Freelancer public profile.
- Freelancer offer submission.
- Freelancer active repairs.
- Repair outcome interfaces.
- Admin freelancer management.
- Admin category management.
- Supporting reusable UI components.
- Intermediate business-logic development.

### Joud

Contribution areas included:

- Shared application shell.
- Authentication layout.
- Site footer.
- Reusable UI components.
- Customer request listing.
- Confirmation and report dialogs.
- Freelancer dashboard.
- Repair progress tracker.
- Admin layout.
- Admin user management.

The Git history and pull requests provide the detailed record of individual contributions.

Merge operations do not imply authorship of another contributor's original implementation.

---

## 19. Testing and Quality Assurance

The project combines automated testing, production builds, and browser-based inspection.

### Automated Testing

Vitest verifies selected authentication, business-logic, and routing behavior.

The recorded integrated test suite passed 28 tests across three files.

### Build Verification

The team successfully executed Vite production builds during development.

### Browser Inspection

Browser-based checks during integration included:

- Login page rendering.
- Customer dashboard rendering.
- Customer repair data display.
- Shared layout integration.
- Sidebar and top-bar visibility.
- Landing-page integration.

### Integration Issues Addressed

**Outdated Demo Data**

Previously stored localStorage data interfered with the updated demo accounts.

**Missing Role Layout Routes**

Some role-specific pages initially rendered without the shared navigation shell.

**Foundation Placeholder**

The root route initially displayed the project foundation placeholder.

**Missing Navigation Destinations**

Customer Repair History and Freelancer Profile routes were added during final integration.

**Generated Files**

The `.gitignore` configuration was updated to exclude generated TanStack files and macOS metadata.

### Functional Testing Scope

Complete end-to-end testing across Customer, Freelancer, and Administrator workflows is separate from the recorded automated tests.

The passing automated test suite does not establish that every page and interaction has been tested.

---

## 20. Troubleshooting

### `vite: command not found`

Install the project dependencies:

```bash
npm install
```

Then run:

```bash
npm run dev
```

### Localhost Refuses to Connect

Ensure the development server is running:

```bash
npm run dev
```

Open the exact URL displayed in the terminal.

### Port 5173 Is Already in Use

Vite may automatically select another available port.

Use the new URL printed in the terminal.

### Demo Login Fails Unexpectedly

Confirm that the account credentials and account status match the current demo data.

If the application was previously run with an older seed, localStorage may contain outdated records.

Use the reset feature on `/demo` to restore the current seed data.

Resetting removes locally saved prototype changes.

### A Page Displays 404

Check the requested URL and confirm that the corresponding route exists.

Ensure the project is running from the intended Git branch.

### Changes Are Missing After Cloning

Check the current branch:

```bash
git branch --show-current
```

Fetch remote changes:

```bash
git fetch origin
```

Switch to the integration branch:

```bash
git switch develop
```

Update it:

```bash
git pull --ff-only origin develop
```

Preserve any uncommitted local changes before switching branches or pulling updates.

### Automated Tests Fail

Run:

```bash
npx vitest run
```

Inspect the failing test and reported error.

Confirm that the required dependencies are installed.

---

## 21. Prototype Limitations

The current Phase 4 implementation is an academic front-end prototype.

Its limitations include:

- Demo data is stored locally in the browser.
- Changes are not automatically synchronized between browsers or devices.
- The prototype does not use a production database.
- Authentication and sessions are simulated for demonstration.
- Client-side role checks do not replace server-side authorization.
- Browser localStorage is not suitable for production credential storage.
- The recorded automated tests do not cover every browser interaction.
- The project is not presented as a production-deployed service.

These limitations distinguish the prototype from a production-ready marketplace.

---

## 22. AI Usage Disclosure

The team used **ChatGPT (GPT-6)** during Phase 4 development for implementation assistance, debugging, testing support, Git integration, and documentation.

The repository includes a separate file:

`AI_USAGE.md`

It documents the shared AI conversation, artifact groups, affected source files, and relevant development evidence.

The shared conversation is identified as `C01`, and the associated artifact groups are identified as `A01–A16`.

The signed AI Usage Declaration and complete AI Evidence ZIP are submitted separately through Blackboard.

All team members remain responsible for understanding and explaining the work they contributed.

---

## 23. Repository Information

**Repository:** https://github.com/5cvi9/Sallihha-SWE363

**Course:** SWE 363 — Web Engineering

**Project:** Sallihha — Electronic Device Repair Marketplace

**Team:** 17

**Section:** F11

**Phase:** Phase 4 — Front-End

---

## 24. Conclusion

Sallihha provides a structured front-end prototype for an electronic device repair marketplace.

The application combines customer repair requests, freelancer offers, repair tracking, repair outcomes, reviews, and administrative management within a shared web interface.

Its architecture separates reusable components, role-specific routes, shared state, business rules, and automated tests.

The Phase 4 implementation demonstrates the integration of independently developed features into a unified React application and provides a foundation for further development.

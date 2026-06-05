# MDU UI - Frontend Implementation Plan

## 1. Purpose

This document defines how to implement the mock MDU UI frontend from the completed design documents.

It is the bridge between design planning and code generation.

Source design documents:

```text
docs/
  mdu-ui-spec.md
  workflows.md
  figma-navigation-model.md
  screen-inventory.md
  screen-definitions.md
  layout-system.md
  wireframe-plan.md
```

This document answers:

```text
How should the MDU UI be built in code?
Which stack should be used?
How should folders, routes, stores, mock APIs, RBAC, and components be organized?
How should an LLM generate code safely module by module?
```

Use this document as the main guide for frontend code generation.

---

## 2. Target Stack

Use the following frontend stack:

```text
Next.js latest 
TypeScript
Tailwind CSS
shadcn/ui
React Flow
TanStack Query
Zustand
```

## 2.1 Stack responsibilities

| Tool | Responsibility |
|---|---|
| Next.js latest | App Router, routing, layouts, pages, frontend app structure. |
| TypeScript | Strict typing for hierarchy, RBAC, devices, billing, users, configs, and states. |
| Tailwind CSS | Utility-first styling and responsive layout. |
| shadcn/ui | Base UI components: buttons, cards, dialogs, tables, tabs, inputs, badges, sheets. |
| React Flow | Topology canvas and device connectivity graph. |
| TanStack Query | Mock API data fetching, loading states, errors, cache, refetch. |
| Zustand | Client state for auth, selected scope, UI shell state, and mock runtime flags. |

---

## 3. Implementation Goal

The first implementation target is a browser-based mock UI prototype.

The mock UI should:

```text
Run without backend APIs
Use realistic mock data
Support selected hierarchy scope
Support mock RBAC behavior
Show loading, empty, error, no-permission, and backend-unavailable states
Show first-phase modules only
Be easy to later connect to real backend APIs
```

The mock UI should not attempt to implement full production backend behavior.

---

## 4. Phase Scope

## 4.1 In-scope modules

Implement these first-phase modules:

```text
Global Shell
Authentication
Dashboard
Hierarchy
Topology
Devices
Configuration
Customers / Sub-Operators
Billing
Users
Administration
```

## 4.2 Deferred modules

Do not implement these modules in this phase:

```text
Clients
Rollouts
Maps
Metrics
AI Agent
```

They may appear only as disabled/future labels in docs or comments if needed.

---

## 5. Core Product Rules

## 5.1 Navigation model

The application must follow this model:

```text
Top App Header = GLOBAL product controls
Sidebar = WHAT the user wants to do
Scope Breadcrumb Bar = WHERE the user is working
Workspace Tabs = HOW the user works inside the selected scope
```

## 5.2 Top App Header

The Top App Header contains:

```text
Logo
Global search
Notifications
Help
User profile
```

It must not control hierarchy scope.

## 5.3 Scope Breadcrumb Bar

The Scope Breadcrumb Bar controls selected hierarchy scope:

```text
Operator > Customer > Sub-Operator > Site > Building > Floor > Venue
```

Changing selected scope must refresh scoped module data.

## 5.4 Sidebar

Sidebar contains first-phase operational modules:

```text
Dashboard
Customers
Hierarchy
Devices
Configuration
Billing
Users
Administration
```

Important:

```text
Topology must NOT be a root sidebar module.
```

Correct topology paths:

```text
Hierarchy -> Selected Node -> Topology Tab
Devices -> Connectivity View
```

## 5.5 RBAC

Frontend RBAC behavior:

```text
Unauthorized module = hidden
Unauthorized action = hidden
Read-only permission = visible but non-editable
Backend 403 = no-permission state
```

Backend authorization is still required later. Mock frontend RBAC is only for prototype behavior.

## 5.6 System states

Every important screen must support:

```text
Loading
Empty
Error
No Permission
Backend Unavailable
Partial Data
Success
Confirmation Required
Read-only
```

---

## 6. Project Setup

## 6.1 Create project

Preferred package manager:

```text
npm
```

Create the app:

```bash
npm create next-app@latest mdu-ui --yes
cd mdu-ui
```

Important version rule:

```text
The project target is Next.js latest.
If create-next-app installs a newer major version, pin Next.js to 15.x in package.json before continuing.
```

## 6.2 Install dependencies

```bash
npm add zustand @tanstack/react-query @xyflow/react lucide-react
```

Initialize shadcn/ui:

```bash
npm dlx shadcn@latest init
```

Add first shadcn/ui components:

```bash
npm dlx shadcn@latest add button card badge input dropdown-menu sheet dialog tabs table separator breadcrumb skeleton alert select textarea tooltip scroll-area command
```

## 6.3 Required package expectations

The project should support:

```text
App Router
TypeScript
Tailwind CSS
ESLint
@/* import alias
```

## 6.4 Development command

```bash
npm dev
```

---

## 7. Folder Structure

Use this structure:

```text
src/
  app/
    layout.tsx
    page.tsx
    providers.tsx

    (auth)/
      login/
        page.tsx

    (app)/
      layout.tsx
      dashboard/
        page.tsx
      hierarchy/
        page.tsx
      devices/
        page.tsx
        [deviceId]/
          page.tsx
      configurations/
        page.tsx
        [configId]/
          page.tsx
      customers/
        page.tsx
        [customerId]/
          page.tsx
      billing/
        page.tsx
      users/
        page.tsx
        [userId]/
          page.tsx
      administration/
        page.tsx

  components/
    shell/
      app-shell.tsx
      top-app-header.tsx
      sidebar.tsx
      scope-breadcrumb-bar.tsx
      global-search-overlay.tsx
      user-profile-menu.tsx

    states/
      loading-state.tsx
      empty-state.tsx
      error-state.tsx
      no-permission-state.tsx
      backend-unavailable-state.tsx
      partial-data-state.tsx
      confirmation-dialog.tsx

    dashboard/
    hierarchy/
    topology/
    devices/
    configurations/
    customers/
    billing/
    users/
    administration/
    common/

    ui/
      shadcn generated components

  lib/
    mock-api/
      client.ts
      dashboard.ts
      hierarchy.ts
      devices.ts
      configurations.ts
      customers.ts
      billing.ts
      users.ts
      administration.ts

    mock-data/
      hierarchy.ts
      devices.ts
      configurations.ts
      customers.ts
      billing.ts
      users.ts
      alerts.ts

    rbac/
      permissions.ts
      can.ts
      module-access.ts

    constants/
      modules.ts
      routes.ts
      roles.ts

    utils.ts

  stores/
    auth-store.ts
    scope-store.ts
    ui-store.ts
    mock-runtime-store.ts

  types/
    common.ts
    hierarchy.ts
    rbac.ts
    device.ts
    billing.ts
    user.ts
    config.ts
    customer.ts
    dashboard.ts
    system.ts
```

---

## 8. Routing Plan

Use Next.js App Router.

## 8.1 Public routes

```text
/login
```

## 8.2 Authenticated routes

```text
/dashboard
/hierarchy
/devices
/devices/[deviceId]
/configurations
/configurations/[configId]
/customers
/customers/[customerId]
/billing
/users
/users/[userId]
/administration
```

## 8.3 Redirect behavior

Root route:

```text
/
```

should redirect to:

```text
/dashboard
```

if authenticated, otherwise:

```text
/login
```

For mock phase, authentication may default to a mock logged-in user.

---

## 9. Rendering Strategy

## 9.1 Server vs client components

Use this rule:

```text
Route pages may be thin server components.
Interactive feature components should be client components.
```

Client components are required for:

```text
Zustand stores
TanStack Query hooks
Scope switching
Sidebar state
Dialogs
Tabs
React Flow topology
Mock runtime toggles
```

## 9.2 Recommended pattern

Page file:

```text
src/app/(app)/dashboard/page.tsx
```

should render:

```text
<DashboardPage />
```

The actual logic lives in:

```text
src/components/dashboard/dashboard-page.tsx
```

---

## 10. State Management

## 10.1 Zustand stores

Use Zustand for browser/client state.

### auth-store.ts

Responsible for:

```text
current user
current role
mock login
mock logout
role switching for testing
```

### scope-store.ts

Responsible for:

```text
selected scope ID
selected scope path
selected node
scope switching
recent scopes
```

### ui-store.ts

Responsible for:

```text
sidebar collapsed
mobile drawer open
global search open
active module
active workspace tab
```

### mock-runtime-store.ts

Responsible for testing system states:

```text
force backend unavailable
force empty state
force no permission
force partial data
force error state
```

This store helps simulate UX states without backend APIs.

---

## 11. Data Fetching Strategy

Use TanStack Query for all mock API reads.

## 11.1 Query key rules

Use stable query keys:

```text
['dashboard', scopeId]
['hierarchy', role, rootScopeId]
['devices', scopeId, filters]
['device', deviceId]
['billing', scopeId]
['customers', scopeId]
['users', scopeId]
['configurations', scopeId]
```

## 11.2 Mock API behavior

Mock API functions should:

```text
Return Promises
Use artificial delay
Accept selected scope ID
Respect mock RBAC where useful
Support empty/error/backend-unavailable simulation
Never call real backend
```

Example mock API shape:

```text
getDashboardSummary(scopeId)
getHierarchyTree(userId, role)
getDevices(scopeId)
getDeviceById(deviceId)
getBillingOverview(scopeId)
getUsers(scopeId)
```

## 11.3 Mutation behavior

For mock phase, mutations may:

```text
Update local mock data in memory
Show success toast
Invalidate relevant TanStack Query keys
Do not persist after page refresh unless localStorage is intentionally used
```

---

## 12. Type System Plan

Create reusable TypeScript types before UI components.

Required type files:

```text
src/types/common.ts
src/types/hierarchy.ts
src/types/rbac.ts
src/types/device.ts
src/types/billing.ts
src/types/user.ts
src/types/config.ts
src/types/customer.ts
src/types/dashboard.ts
src/types/system.ts
```

## 12.1 Core types

Define:

```text
HierarchyNode
HierarchyNodeType
ScopePathItem
SelectedScope
UserRole
PermissionAction
ModuleKey
RbacDecision
Device
DeviceType
DeviceStatus
BillingPlan
Subscription
ConfigurationSet
Customer
SystemState
```

## 12.2 Role model

Use these roles:

```text
Root Operator
Operator Admin
Customer Admin
NOC/Support
Installer
Billing/Admin
Read-only
```

Use stable code values, for example:

```text
root_operator
operator_admin
customer_admin
noc_support
installer
billing_admin
read_only
```

---

## 13. Mock Data Plan

Create mock data for:

```text
hierarchy
users
customers
devices
billing plans
subscriptions
configurations
alerts
activity events
```

## 13.1 Mock hierarchy

Must support variable depth:

```text
Operator
-> Customer
   -> Sub-Operator
      -> Site
         -> Building
            -> Tower
               -> Floor
                  -> Venue
```

Also include shorter paths:

```text
Customer -> Venue
Customer -> Site -> Venue
Customer -> Site -> Building -> Floor
```

## 13.2 Mock devices

Include infrastructure devices only:

```text
Gateways
Switches
Access Points
```

Do not include clients as Devices.

## 13.3 Mock billing

Include:

```text
fixed_device plans
connection_based plans
active subscription
no active subscription state
billing conflict state
no available plans state
```

## 13.4 Mock users

Include users for each role:

```text
Operator Admin
Customer Admin
NOC/Support
Installer
Billing/Admin
Read-only
```

---

## 14. RBAC Implementation Plan

## 14.1 Permission helpers

Create:

```text
src/lib/rbac/permissions.ts
src/lib/rbac/can.ts
src/lib/rbac/module-access.ts
```

## 14.2 can helper

Required helper:

```text
can(user, action, resource, scope): RbacDecision
```

Return shape:

```text
{
  allowed: boolean
  reason?: string
  mode?: 'hidden' | 'disabled' | 'read-only' | 'visible'
}
```

## 14.3 Module access

Create helper:

```text
getVisibleModules(user, selectedScope)
```

It should hide unauthorized modules from sidebar.

## 14.4 Action behavior

Use these rules:

```text
Unauthorized action = hidden
State-unavailable action = disabled
Read-only action = hidden or visible disabled, depending on context
No-permission backend result = no-permission state
```

## 14.5 RBAC test cases

The mock app should make it easy to switch role and validate:

```text
Operator Admin sees customer, billing, users, hierarchy, devices
Customer Admin sees own subtree and available billing plans
NOC/Support sees operational health and diagnostics, not billing management
Installer sees deployment/device assignment actions only if permitted
Billing/Admin sees billing workflows
Read-only sees data but no write actions
```

---

## 15. Scope Context Plan

## 15.1 Scope source of truth

The selected scope lives in:

```text
scope-store.ts
```

## 15.2 Scope changes

When selected scope changes:

```text
Scope Breadcrumb Bar updates
Hierarchy tree selection updates
Current route remains unless invalid
TanStack Query refetches scoped data
Unauthorized screen/action state recalculates
```

## 15.3 Scope Breadcrumb Bar behavior

It must show:

```text
Operator > Customer > Sub-Operator > Site > Building > Floor > Venue
```

Each segment can open a dropdown for allowed alternatives at that level.

Only permitted nodes should appear.

---

## 16. Component Architecture

## 16.1 Shell components

```text
AppShell
TopAppHeader
Sidebar
ScopeBreadcrumbBar
GlobalSearchOverlay
UserProfileMenu
```

## 16.2 State components

```text
LoadingState
EmptyState
ErrorState
NoPermissionState
BackendUnavailableState
PartialDataState
ConfirmationDialog
```

## 16.3 Common components

```text
PageHeader
KpiCard
StatusBadge
MetadataList
ActivityList
DataTable
FilterBar
RowActions
SectionCard
```

## 16.4 Feature components

Each module should keep feature-specific components inside its own folder:

```text
components/dashboard/
components/hierarchy/
components/topology/
components/devices/
components/billing/
```

Do not place feature logic inside generic components.

---

## 17. shadcn/ui Component Plan

Use shadcn/ui for base components.

Initial components:

```text
button
card
badge
input
dropdown-menu
sheet
dialog
tabs
table
separator
breadcrumb
skeleton
alert
select
textarea
tooltip
scroll-area
command
```

Usage rules:

```text
Use shadcn/ui as base building blocks.
Do not over-customize early.
Keep low-fidelity but clean.
Wrap common patterns into MDU-specific components.
```

---

## 18. Module Implementation Plan

Use this order.

## 18.1 Foundation

Generate first:

```text
providers
routes
constants
types
mock data
RBAC
stores
mock API client
system states
```

Do not start feature screens until this foundation compiles.

## 18.2 Shell

Generate:

```text
AppShell
TopAppHeader
Sidebar
ScopeBreadcrumbBar
GlobalSearchOverlay
UserProfileMenu
```

Acceptance:

```text
Authenticated pages share shell.
Sidebar respects visible modules.
Scope Breadcrumb Bar reads/writes selected scope.
Role switcher can be available in user menu for mock testing.
```

## 18.3 Dashboard

Generate:

```text
DashboardPage
KpiCard
HealthSummaryPanel
RecentAlertsPanel
BillingSummaryPanel
QuickActionsPanel
```

Acceptance:

```text
Uses selected scope.
Uses TanStack Query.
Handles loading, partial data, no permission, backend unavailable.
Hides billing summary if role lacks billing access.
```

## 18.4 Hierarchy

Generate:

```text
HierarchyPage
HierarchyTree
NodeWorkspace
NodeOverviewTab
NodeDevicesTab
NodeConfigurationsTab
CreateNodeDialog
MoveNodeDialog
DeleteNodeConfirmation
```

Acceptance:

```text
Recursive tree works.
Selecting node updates selected scope.
Workspace tabs are Overview, Topology, Devices, Configurations.
Deferred tabs are not active.
RBAC hides node actions.
```

## 18.5 Topology

Generate with React Flow:

```text
TopologyTab
TopologyCanvas
TopologyNode
TopologyOverlayControls
TopologyDeviceDrawer
ConnectivityView
```

Acceptance:

```text
Topology appears under Hierarchy workspace.
Connectivity View appears under Devices.
React Flow renders nodes and links.
Unauthorized devices/links hidden.
No topology / partial data / backend unavailable states exist.
```

## 18.6 Devices

Generate:

```text
DeviceInventoryPage
DeviceList
DeviceDetailPage
DeviceDiagnostics
DeviceActionConfirmation
AddDeviceDialog
AssignDeviceDialog
ConnectivityView entry
```

Acceptance:

```text
Devices include only gateways, switches, APs.
Device list is scoped.
Device detail supports diagnostics and role-aware actions.
Read-only has no write actions.
```

## 18.7 Configuration

Generate:

```text
ConfigurationListPage
ConfigurationDetail
CreateConfigurationForm
AssignConfigurationDialog
EffectiveConfigurationPreview
ConfigurationValidationErrors
```

Acceptance:

```text
Configurations are scoped.
Assignments target permitted nodes/devices only.
Effective configuration shows inherited/assigned/overridden values.
```

## 18.8 Customers

Generate:

```text
CustomerListPage
CreateCustomerWizard
CustomerDetail
CustomerWorkspace
CustomerBillingTab
CustomerUsersTab
SuspendCustomerDialog
DeleteCustomerDialog
```

Acceptance:

```text
Customers are tenant/sub-operator management.
Create customer includes first admin user.
Billing assignment is optional.
Delete/suspend require confirmation.
```

## 18.9 Billing

Generate:

```text
BillingOverview
BillingPlanList
CreateBillingPlanWizard
BillingPlanDetail
AssignPlanToCustomer
AvailablePlans
SelectPlanConfirmation
CurrentSubscriptionDetail
BillingConflictState
NoAvailablePlansState
NoActiveSubscriptionState
```

Acceptance:

```text
Parent operator manages plans.
Customer sees eligible active parent-offered plans.
Customer cannot edit parent-created plans.
Only one active subscription is allowed.
Sibling subscriptions are never visible.
```

## 18.10 Users

Generate:

```text
UserListPage
CreateUserForm
UserDetail
AssignRoleProfileDialog
ResetPasswordConfirmation
SuspendUserConfirmation
UserScopeAssignmentSummary
```

Acceptance:

```text
Users are scoped.
Assignable roles are limited by actor authority.
Read-only cannot create/edit/suspend.
```

## 18.11 Administration

Generate:

```text
AdministrationOverview
RolesAndPolicies
EditRolePolicy
AuditLogs
AuditEventDetail
PermissionChangeImpactWarning
NoAdminPermissionState
```

Acceptance:

```text
Administration hidden without permission.
Roles and policies are business-friendly.
Raw OWPROV internals are not exposed.
Permission changes show impact warning.
```

---

## 19. React Flow Plan

Use React Flow only for topology and connectivity.

Package:

```text
@xyflow/react
```

Required usage:

```text
import '@xyflow/react/dist/style.css'
```

React Flow screens:

```text
Hierarchy -> Node Workspace -> Topology Tab
Devices -> Connectivity View
```

Required graph features:

```text
nodes
edges
controls
mini map optional
background grid optional
custom device nodes
detail drawer on node click
overlay controls
```

Topology data should be generated from mock hierarchy and devices.

---

## 20. System State Plan

Create reusable state components before feature modules.

Required states:

```text
LoadingState
EmptyState
ErrorState
NoPermissionState
BackendUnavailableState
PartialDataState
ConfirmationDialog
```

Rules:

```text
Keep App Shell visible where possible.
Do not flash unauthorized actions before RBAC resolves.
Empty-state CTAs appear only if permitted.
No-permission state must not reveal hidden resource names.
Backend-unavailable state includes retry.
```

---

## 21. Mock Runtime Controls

For development and demos, include a hidden or admin-only mock control panel.

It should allow switching:

```text
current role
selected scope
backend unavailable on/off
empty data on/off
partial data on/off
error state on/off
```

Recommended location:

```text
User Profile Menu -> Mock Runtime Controls
```

This is for development only and should be easy to remove later.

---

## 22. LLM Code Generation Rules

Use LLM code generation one layer at a time.

Never prompt:

```text
Generate the full MDU UI app.
```

Instead, use:

```text
Generate only [specific layer/module].
Do not generate unrelated modules.
Use existing files and types.
Keep code compiling.
```

## 22.1 Source docs rule

Put all docs in:

```text
/docs
```

For the first coding prompt, tell the LLM:

```text
Read /docs/frontend-implementation-plan.md first.
Use the other /docs files as source of truth.
```

For later prompts, reference only the relevant docs:

| Task | Main docs |
|---|---|
| Foundation | frontend-implementation-plan.md |
| Routes | frontend-implementation-plan.md, screen-inventory.md |
| Shell | frontend-implementation-plan.md, figma-navigation-model.md, layout-system.md |
| Dashboard | screen-definitions.md, wireframe-plan.md |
| Hierarchy | workflows.md, screen-definitions.md, layout-system.md |
| Topology | mdu-ui-spec.md, screen-definitions.md, wireframe-plan.md |
| Billing | workflows.md, screen-definitions.md, wireframe-plan.md |
| RBAC | workflows.md, screen-definitions.md, frontend-implementation-plan.md |
| System states | screen-definitions.md, layout-system.md, wireframe-plan.md |

## 22.2 Prompt format

Use this prompt structure:

```text
Read /docs/frontend-implementation-plan.md.
Also use:
- [relevant doc 1]
- [relevant doc 2]

Task:
Generate only [specific module/layer].

Requirements:
- [specific requirements]
- Use Next.js latest App Router.
- Use TypeScript.
- Use Tailwind and shadcn/ui.
- Use Zustand where client state is needed.
- Use TanStack Query for data loading.
- Use React Flow only for topology/connectivity.
- Keep RBAC and selected-scope behavior consistent.

Output:
- file paths
- complete code for changed files
- no unrelated modules
```

---

## 23. Recommended LLM Generation Sequence

Use this sequence exactly.

## Prompt 1 - Foundation

```text
Generate project foundation:
- src/app/layout.tsx
- src/app/page.tsx
- src/app/providers.tsx
- src/lib/utils.ts
- src/lib/constants/routes.ts
- src/lib/constants/modules.ts

Do not generate feature screens yet.
```

## Prompt 2 - Types

```text
Generate all TypeScript types in src/types.
Do not generate UI components.
```

## Prompt 3 - Mock hierarchy and RBAC

```text
Generate mock hierarchy data and RBAC helpers.
Do not generate screens.
```

## Prompt 4 - Stores

```text
Generate Zustand stores:
- auth-store
- scope-store
- ui-store
- mock-runtime-store
```

## Prompt 5 - Mock APIs

```text
Generate mock API functions using Promises and artificial delay.
Support scope, RBAC, loading/error/empty/backend-unavailable simulation.
```

## Prompt 6 - System states

```text
Generate reusable state components.
Use shadcn/ui.
```

## Prompt 7 - App shell

```text
Generate AppShell, TopAppHeader, Sidebar, ScopeBreadcrumbBar, GlobalSearchOverlay, UserProfileMenu.
```

## Prompt 8 - Dashboard

```text
Generate dashboard page and dashboard components.
```

## Prompt 9 - Hierarchy

```text
Generate hierarchy workspace and recursive tree.
```

## Prompt 10 - Topology

```text
Generate React Flow topology tab and device connectivity view.
```

## Prompt 11 - Devices

```text
Generate devices list, detail, diagnostics, and actions.
```

## Prompt 12 - Configuration

```text
Generate configuration list, detail, assignment, effective preview.
```

## Prompt 13 - Customers

```text
Generate customers list, create wizard, detail, workspace.
```

## Prompt 14 - Billing

```text
Generate billing plan management, available plans, subscription detail, conflict states.
```

## Prompt 15 - Users

```text
Generate users list, create user, role assignment, user detail.
```

## Prompt 16 - Administration

```text
Generate administration overview, roles/policies, audit logs, impact warning.
```

## Prompt 17 - Responsive polish

```text
Improve responsive behavior for shell, dashboard, hierarchy, tables, details, billing.
```

## Prompt 18 - QA pass

```text
Run through all routes, fix TypeScript errors, fix import issues, verify RBAC and system states.
```

---

## 24. Quality Rules

## 24.1 Code quality

Generated code must be:

```text
typed
modular
readable
consistent
easy to replace with real APIs later
```

Avoid:

```text
large single files
hardcoded UI logic inside route pages
duplicated RBAC logic
duplicated mock data inside components
feature code inside generic components
```

## 24.2 Component rules

Components should be:

```text
small
typed
composable
role-aware when needed
scope-aware when needed
```

## 24.3 Mock API rules

Mock APIs should be:

```text
centralized in src/lib/mock-api
called through TanStack Query
easy to replace with real fetch clients later
```

## 24.4 RBAC rules

RBAC should be:

```text
centralized in src/lib/rbac
used by sidebar, actions, tabs, and screens
not duplicated per component
```

## 24.5 Scope rules

Scope should be:

```text
centralized in scope-store
visible in Scope Breadcrumb Bar
passed to query keys
used by mock API filters
```

---

## 25. Testing and Validation

## 25.1 Manual validation routes

Check these routes:

```text
/login
/dashboard
/hierarchy
/devices
/devices/[deviceId]
/configurations
/customers
/billing
/users
/administration
```

## 25.2 Manual validation workflows

Validate:

```text
Login -> Dashboard
Change scope -> Dashboard refreshes
Hierarchy tree -> Node workspace
Node workspace -> Topology tab
Topology -> Device drawer
Devices -> Device detail -> Diagnostics
Billing -> Available plans -> Select plan
Customers -> Create customer
Users -> Create user
Administration -> Role impact warning
```

## 25.3 State validation

Use mock runtime controls to validate:

```text
Loading
Empty
No Permission
Backend Unavailable
Partial Data
Error
Read-only
Confirmation
```

## 25.4 RBAC validation

Switch roles and verify:

```text
Sidebar modules change
Actions hide or show
Read-only cannot mutate
Billing hidden for non-billing users
Administration hidden for unauthorized users
Topology hides unauthorized overlays
```

---

## 26. Backend Integration Later

This mock UI should be structured so real APIs can replace mock APIs later.

Future backend integration steps:

```text
Replace src/lib/mock-api with real API clients
Keep TanStack Query hooks and query keys
Keep TypeScript DTOs aligned with backend
Keep RBAC backend-enforced
Replace mock auth with OWSEC/session integration
Replace mock hierarchy with real hierarchy APIs
```

Do not tightly couple UI components to mock data.

---

## 27. Acceptance Checklist

The frontend implementation plan is complete when:

```text
Tech stack is defined.
Folder structure is defined.
Routes are defined.
State strategy is defined.
Mock API strategy is defined.
RBAC strategy is defined.
Scope strategy is defined.
Component architecture is defined.
Module implementation order is defined.
LLM prompt rules are defined.
Quality rules are defined.
Testing and validation rules are defined.
Backend integration path is defined.
```

---

## 28. Final Summary

Use this document as the primary coding guide for the mock MDU UI.

Recommended execution:

```text
1. Create Next.js latest project
2. Add dependencies
3. Add shadcn/ui components
4. Add all docs into /docs
5. Generate foundation
6. Generate types
7. Generate mock data, RBAC, stores, mock APIs
8. Generate shell
9. Generate modules one by one
10. Validate workflows and states
11. Later replace mock APIs with real APIs
```

Important rule:

```text
One LLM prompt = one layer or one module.
Never generate the whole app in one prompt.
```


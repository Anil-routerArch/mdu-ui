# MDU UI - Wireframe Plan

## 1. Purpose

This document defines the low-fidelity wireframe plan for the first-phase MDU UI.

It is the Phase 6 design document after:

```text
1. workflows.md
2. figma-navigation-model.md
3. screen-inventory.md
4. screen-definitions.md
5. layout-system.md
6. wireframe-plan.md
```

The goal of this document is to define:

```text
Which Figma wireframes to create
Which workflow flows to wireframe
Which prototype paths to connect
Which RBAC states to show
Which loading / empty / error / no-permission states to include
```

This document should be used before building the actual Figma low-fidelity wireframes and clickable prototype.

---

## 2. Source Documents

This wireframe plan is based on:

```text
mdu-ui-spec.md
workflows.md
figma-navigation-model.md
screen-inventory.md
screen-definitions.md
layout-system.md
```

The source of truth is:

```text
mdu-ui-spec.md = product direction
workflows.md = operational workflow behavior
figma-navigation-model.md = navigation and prototype rules
screen-inventory.md = required screens
screen-definitions.md = screen purpose, RBAC, and states
layout-system.md = reusable layout patterns
wireframe-plan.md = Figma execution plan
```

---

## 3. Phase Scope

## 3.1 In-scope modules

This wireframe plan covers only the first-phase modules:

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

## 3.2 Deferred modules

These modules are intentionally deferred:

```text
Clients
Rollouts
Maps
Metrics
AI Agent
```

Deferred modules should not be wireframed in this phase, except where placeholders are needed to show future tab/module behavior.

---

## 4. Wireframing Principles

## 4.1 Start low-fidelity

Wireframes should focus on:

```text
layout
navigation
hierarchy context
workflow flow
RBAC visibility
system states
information priority
```

Avoid detailed visual styling at this phase:

```text
colors
branding polish
icons finalization
visual effects
pixel-perfect spacing
production UI details
```

---

## 4.2 Use reusable layouts

All wireframes must use the layouts defined in `layout-system.md`:

```text
App Shell
Auth
Dashboard
Hierarchy Workspace
List + Detail
Form + Confirmation
Topology Canvas
System State
```

Do not create one-off page structures unless a screen cannot fit a reusable layout.

---

## 4.3 Use updated shell model

All authenticated wireframes must use:

```text
Top App Header = GLOBAL product controls
Sidebar = WHAT the user wants to do
Scope Breadcrumb Bar = WHERE the user is working
Workspace Tabs = HOW the user works inside selected scope
```

Top App Header contains:

```text
Logo
Global search
Notifications
Help
User profile
```

Scope Breadcrumb Bar shows:

```text
Operator > Customer > Sub-Operator > Site > Building > Floor > Venue
```

---

## 4.4 Wireframe by workflow

Do not wireframe only isolated pages.

Each major flow should show:

```text
Entry point
Scope context
Primary screen
User action
Result screen
Error / empty / permission state where important
```

---

## 4.5 Scope and RBAC must be visible

Every scoped wireframe should clearly show:

```text
selected hierarchy scope
current role / role behavior where useful
hidden or disabled actions
read-only behavior
no-permission state
```

---

## 5. Figma Page Structure

Create these Figma pages:

```text
00 - Cover and Notes
01 - App Shell and Components
02 - Authentication
03 - Dashboard
04 - Hierarchy Workspace
05 - Topology
06 - Devices
07 - Configuration
08 - Customers
09 - Billing
10 - Users
11 - Administration
12 - System States
13 - Prototype Flows
14 - Mobile Wireframes
```

---

## 6. Figma Frame Naming Convention

Use this format:

```text
[Screen ID] - [Screen Name] - [Role] - [State] - [Viewport]
```

Examples:

```text
SCR-DASHBOARD-002 - Scoped Dashboard - Customer Admin - Default - Desktop
SCR-HIERARCHY-005 - Node Topology Tab - NOC - Loading - Desktop
SCR-BILLING-008 - Available Plans - Customer Admin - Empty - Desktop
SCR-DEVICE-005 - Device Detail - Read Only - Default - Desktop
SCR-SHELL-002 - Scope Breadcrumb Bar - Operator Admin - Open - Desktop
```

For prototype flow frames, use:

```text
FLOW-[NUMBER] - [Flow Name] - [Step Number] - [Screen Name]
```

Example:

```text
FLOW-003 - Hierarchy Topology - 01 - Dashboard
FLOW-003 - Hierarchy Topology - 02 - Select Scope
FLOW-003 - Hierarchy Topology - 03 - Floor Workspace
FLOW-003 - Hierarchy Topology - 04 - Topology Tab
```

---

## 7. Wireframe Creation Order

Use this order to reduce UX risk:

```text
1. App Shell
2. Top App Header
3. Scope Breadcrumb Bar
4. Sidebar Navigation
5. System States
6. Authentication
7. Dashboard
8. Hierarchy Workspace
9. Topology Tab
10. Devices
11. Configuration
12. Customers
13. Billing
14. Users
15. Administration
16. Mobile / Responsive Variants
17. Prototype Flow Wiring
```

Reason:

```text
Hierarchy context and scope switching are the highest UX risks.
```

The shell, scope selector, and hierarchy workspace should be validated before detailed module wireframes.

---

## 8. Required Core Wireframes

## 8.1 Global Shell

| Frame | Purpose |
|---|---|
| SCR-SHELL-001 - Main App Shell - Default - Desktop | Base authenticated layout. |
| SCR-SHELL-001 - Main App Shell - Sidebar Collapsed - Desktop | Collapsed sidebar behavior. |
| SCR-SHELL-002 - Scope Breadcrumb Bar - Default - Desktop | Shows selected scope path. |
| SCR-SHELL-002 - Scope Breadcrumb Bar - Open - Desktop | Shows breadcrumb dropdown/scope selector. |
| SCR-SHELL-003 - Top App Header - Default - Desktop | Logo, search, notifications, help, user. |
| SCR-SHELL-004 - Global Search - Open - Desktop | Search permitted resources. |
| SCR-SHELL-005 - User Profile Menu - Open - Desktop | Profile, role, change password, logout. |

---

## 8.2 Authentication

| Frame | Purpose |
|---|---|
| SCR-AUTH-001 - Login - Default | OWSEC login. |
| SCR-AUTH-001 - Login - Invalid Credentials | Error state. |
| SCR-AUTH-002 - Forgot Password | Password recovery start. |
| SCR-AUTH-003 - Reset Password | Password reset completion. |
| SCR-AUTH-005 - Session Expired | Expired session state. |
| SCR-AUTH-007 - Backend Bootstrap Failed | Auth succeeded but MDU backend failed. |

---

## 8.3 Dashboard

| Frame | Purpose |
|---|---|
| SCR-DASHBOARD-001 - Global Dashboard - Operator Admin - Desktop | Operator/global overview. |
| SCR-DASHBOARD-002 - Scoped Dashboard - Customer Admin - Desktop | Selected customer/site/node dashboard. |
| SCR-DASHBOARD-002 - Scoped Dashboard - Loading | Loading state. |
| SCR-DASHBOARD-002 - Scoped Dashboard - Partial Data | Some panels failed. |
| SCR-DASHBOARD-005 - Billing Summary Panel - Hidden | Billing hidden for unauthorized roles. |

Dashboard must show:

```text
selected scope
KPI cards
health summary
recent alerts
device summary
billing summary if permitted
quick actions if permitted
```

---

## 8.4 Hierarchy

| Frame | Purpose |
|---|---|
| SCR-HIERARCHY-001 - Hierarchy Module - Default | Entry to hierarchy module. |
| SCR-HIERARCHY-002 - Hierarchy Tree - Expanded | Recursive tree. |
| SCR-HIERARCHY-003 - Node Workspace Shell - Overview | Selected node workspace. |
| SCR-HIERARCHY-004 - Node Overview Tab | Node summary. |
| SCR-HIERARCHY-006 - Node Devices Tab | Devices in node scope. |
| SCR-HIERARCHY-007 - Node Configurations Tab | Assigned/effective configs. |
| SCR-HIERARCHY-008 - Create Node Modal | Create hierarchy node. |
| SCR-HIERARCHY-010 - Move Node Modal | Move node workflow. |
| SCR-HIERARCHY-011 - Delete Node Confirmation | Destructive confirmation. |
| SCR-HIERARCHY-012 - Empty Hierarchy State | No child nodes. |

Hierarchy workspace tabs for this phase:

```text
Overview
Topology
Devices
Configurations
```

Deferred tabs should not be active:

```text
Clients
Maps
Metrics
AI Insights
```

---

## 8.5 Topology

| Frame | Purpose |
|---|---|
| SCR-HIERARCHY-005 - Node Topology Tab - Floor - Default | Floor topology view. |
| SCR-TOPOLOGY-002 - Site-Level Topology | Site aggregate topology. |
| SCR-TOPOLOGY-003 - Building-Level Topology | Building/floor summary. |
| SCR-TOPOLOGY-005 - Floor-Level Topology | AP placement and overlays. |
| SCR-TOPOLOGY-007 - Overlay Controls - Open | Toggle overlays. |
| SCR-TOPOLOGY-008 - Device Detail Drawer - Open | Selected device detail. |
| SCR-TOPOLOGY-001 - No Topology Data | Empty topology state. |
| SCR-TOPOLOGY-001 - Backend Unavailable | Backend-down state. |

Topology rules:

```text
Topology is not a root sidebar module.
Topology appears inside hierarchy workspace.
Device connectivity topology appears under Devices.
Unauthorized devices and overlays are hidden.
```

---

## 8.6 Devices

| Frame | Purpose |
|---|---|
| SCR-DEVICE-001 - Device Inventory - Default | List devices in selected scope. |
| SCR-DEVICE-001 - Device Inventory - Empty | No devices in scope. |
| SCR-DEVICE-005 - Device Detail - Default | Device identity/status/assignment. |
| SCR-DEVICE-006 - Device Diagnostics | Logs/status/uplink/errors. |
| SCR-DEVICE-007 - Device Action Confirmation | Reboot/upgrade/blink/factory reset. |
| SCR-DEVICE-008 - Add Device Modal | Add device by serial/type. |
| SCR-DEVICE-009 - Assign Device Modal | Assign device to node/venue/floor. |
| SCR-DEVICE-013 - Connectivity View | Engineering topology for device links. |
| SCR-DEVICE-013 - Connectivity View - Partial Data | Some link data missing. |

---

## 8.7 Configuration

| Frame | Purpose |
|---|---|
| SCR-CONFIG-001 - Configuration List - Default | List scoped configs. |
| SCR-CONFIG-002 - Create Configuration | Create config set. |
| SCR-CONFIG-004 - Configuration Detail | Config summary and assignments. |
| SCR-CONFIG-006 - Assign Configuration | Assign config to nodes/devices. |
| SCR-CONFIG-007 - Effective Configuration Preview | Show inherited/assigned/overridden values. |
| SCR-CONFIG-008 - Validation Errors | Invalid configuration state. |

---

## 8.8 Customers

| Frame | Purpose |
|---|---|
| SCR-CUSTOMER-001 - Customer List - Default | List permitted customers/sub-operators. |
| SCR-CUSTOMER-002 - Create Customer Wizard - Step 1 | Customer details. |
| SCR-CUSTOMER-002 - Create Customer Wizard - Step 2 | First admin user. |
| SCR-CUSTOMER-002 - Create Customer Wizard - Step 3 | Optional billing assignment. |
| SCR-CUSTOMER-002 - Create Customer Wizard - Review | Review and create. |
| SCR-CUSTOMER-003 - Customer Detail | Customer profile/status/scope. |
| SCR-CUSTOMER-007 - Customer Workspace | Customer contextual workspace. |
| SCR-CUSTOMER-008 - Customer Billing Tab | Customer billing summary/assignment. |
| SCR-CUSTOMER-005 - Suspend Confirmation | Suspend customer. |
| SCR-CUSTOMER-006 - Delete Confirmation | Delete customer. |

---

## 8.9 Billing

| Frame | Purpose |
|---|---|
| SCR-BILLING-001 - Billing Overview - Operator Admin | Billing management overview. |
| SCR-BILLING-002 - Billing Plan List | List plans. |
| SCR-BILLING-003 - Create Billing Plan - Step 1 | Select plan type. |
| SCR-BILLING-003 - Create Billing Plan - Step 2 | Plan details. |
| SCR-BILLING-003 - Create Billing Plan - Step 3 | Pricing and limits. |
| SCR-BILLING-007 - Assign Plan to Customer | Assign to direct child. |
| SCR-BILLING-008 - Available Plans - Customer Admin | Customer views eligible plans. |
| SCR-BILLING-009 - Select Plan Confirmation | Confirm selection. |
| SCR-BILLING-010 - Replace Existing Plan Confirmation | Existing subscription conflict. |
| SCR-BILLING-011 - Current Subscription Detail | Current plan/subscription. |
| SCR-BILLING-015 - No Available Plans | Empty state. |
| SCR-BILLING-017 - Billing Conflict State | 409/single-active-plan conflict. |

Billing rules:

```text
Parent operator manages plans.
Customer views eligible parent-offered active plans.
Customer cannot edit parent-created plans.
Only one active subscription is allowed.
Sibling subscriptions are never visible.
```

---

## 8.10 Users

| Frame | Purpose |
|---|---|
| SCR-USER-001 - User List - Default | List scoped users. |
| SCR-USER-002 - Create User | Create user and assign role/profile/scope. |
| SCR-USER-003 - User Detail | User profile/status/roles/scope. |
| SCR-USER-005 - Assign Role Profile | Role/profile assignment. |
| SCR-USER-006 - Reset Password Confirmation | Trigger password reset. |
| SCR-USER-007 - Suspend User Confirmation | Suspend user. |
| SCR-USER-009 - User Scope Assignment Summary | Show assigned scope. |

---

## 8.11 Administration

| Frame | Purpose |
|---|---|
| SCR-ADMIN-001 - Administration Overview | Entry admin screen. |
| SCR-ADMIN-004 - Roles and Policies | Role/policy profiles. |
| SCR-ADMIN-005 - Edit Role Policy | Edit permitted role/policy. |
| SCR-ADMIN-006 - Audit Logs | Scoped audit logs. |
| SCR-ADMIN-007 - Audit Event Detail | Selected audit event. |
| SCR-ADMIN-009 - Permission Change Impact Warning | RBAC change confirmation. |
| SCR-ADMIN-001 - No Permission | No admin access state. |

---

## 9. Required Workflow Wireframes

## 9.1 FLOW-001 - Login and Dashboard

```text
Login
-> Submit credentials
-> Backend bootstrap
-> Global / scoped dashboard
-> User menu
-> Logout
-> Login
```

Required frames:

```text
SCR-AUTH-001
SCR-AUTH-007
SCR-DASHBOARD-001
SCR-DASHBOARD-002
SCR-SHELL-005
SCR-AUTH-006
```

---

## 9.2 FLOW-002 - Scope Switching

```text
Dashboard
-> Open Scope Breadcrumb Bar
-> Select Customer/Site/Floor
-> Scope updates
-> Dashboard refreshes
```

Required frames:

```text
SCR-DASHBOARD-002
SCR-SHELL-002
SCR-HIERARCHY-002
SCR-HIERARCHY-003
```

Show these states:

```text
Scope loading
Scope changed
No permission for selected scope
Backend unavailable
```

---

## 9.3 FLOW-003 - Hierarchy to Topology

```text
Dashboard
-> Hierarchy
-> Expand tree
-> Select Floor
-> Node Workspace
-> Topology Tab
-> Toggle overlays
-> Select device
-> Device Detail Drawer
```

Required frames:

```text
SCR-HIERARCHY-001
SCR-HIERARCHY-002
SCR-HIERARCHY-003
SCR-HIERARCHY-005
SCR-TOPOLOGY-007
SCR-TOPOLOGY-008
```

---

## 9.4 FLOW-004 - Device Diagnostics

```text
Devices
-> Device Inventory
-> Select AP
-> Device Detail
-> Diagnostics
-> Device action confirmation
```

Required frames:

```text
SCR-DEVICE-001
SCR-DEVICE-005
SCR-DEVICE-006
SCR-DEVICE-007
```

Show role variants:

```text
NOC/Support
Customer Admin
Read-only
Installer
```

---

## 9.5 FLOW-005 - Create Customer

```text
Customers
-> Customer List
-> Create Customer
-> Customer details
-> First admin user
-> Optional billing assignment
-> Review
-> Success
-> Customer Workspace
```

Required frames:

```text
SCR-CUSTOMER-001
SCR-CUSTOMER-002
SCR-CUSTOMER-007
SCR-CUSTOMER-008
```

---

## 9.6 FLOW-006 - Billing Plan Selection

```text
Billing
-> Available Plans
-> Select Plan
-> Existing subscription check
-> Confirm selection
-> Current Subscription
```

Required frames:

```text
SCR-BILLING-008
SCR-BILLING-009
SCR-BILLING-010
SCR-BILLING-011
SCR-BILLING-017
```

---

## 9.7 FLOW-007 - Create Billing Plan

```text
Billing
-> Billing Plan List
-> Create Billing Plan
-> Select plan type
-> Enter details
-> Pricing and limits
-> Review
-> Save
-> Billing Plan Detail
```

Required frames:

```text
SCR-BILLING-002
SCR-BILLING-003
SCR-BILLING-005
```

---

## 9.8 FLOW-008 - Create User

```text
Users
-> User List
-> Create User
-> Assign role/profile
-> Assign scope
-> Save
-> User Detail
```

Required frames:

```text
SCR-USER-001
SCR-USER-002
SCR-USER-003
SCR-USER-005
SCR-USER-009
```

---

## 9.9 FLOW-009 - Administration Role Change

```text
Administration
-> Roles and Policies
-> Edit Role / Policy
-> Review impact warning
-> Save
-> Audit Logs
```

Required frames:

```text
SCR-ADMIN-004
SCR-ADMIN-005
SCR-ADMIN-009
SCR-ADMIN-006
```

---

## 9.10 FLOW-010 - Backend Unavailable

```text
Any scoped screen
-> Backend unavailable
-> Retry
-> Recovered or remains unavailable
```

Required frames:

```text
SCR-SHELL-007
SCR-AUTH-007
SCR-DASHBOARD-002 - Backend Unavailable
SCR-DEVICE-001 - Backend Unavailable
SCR-BILLING-001 - Backend Unavailable
```

---

## 10. RBAC Variants to Wireframe

Create RBAC variants for high-risk screens.

| Screen | Required role variants |
|---|---|
| Main App Shell | Operator Admin, Customer Admin, NOC/Support, Installer, Billing/Admin, Read-only |
| Dashboard | Operator Admin, Customer Admin, NOC/Support, Billing/Admin, Read-only |
| Hierarchy Workspace | Operator Admin, Customer Admin, Installer, Read-only |
| Node Topology Tab | NOC/Support, Customer Admin, Installer, Read-only |
| Device Detail | NOC/Support, Customer Admin, Installer, Read-only |
| Billing Available Plans | Customer Admin, Billing/Admin, Read-only |
| Create Billing Plan | Operator Admin, Billing/Admin, No Permission |
| User List | Operator Admin, Customer Admin, Read-only |
| Roles and Policies | Root/Operator Admin, No Permission |

---

## 11. System State Wireframes

Create reusable state frames first, then reuse them in modules.

## 11.1 Required global state frames

```text
State - Loading
State - Empty
State - Error
State - No Permission
State - Backend Unavailable
State - Partial Data
State - Not Found
State - Confirmation Required
State - Success
```

## 11.2 Module-specific states

| Module | Required states |
|---|---|
| Dashboard | Loading, partial data, backend unavailable. |
| Hierarchy | Empty hierarchy, node unavailable, no permission. |
| Topology | No topology data, no map available, partial data. |
| Devices | Empty inventory, device offline, action failed. |
| Configuration | Validation errors, no eligible targets. |
| Customers | Duplicate customer, delete blocked, permission denied. |
| Billing | No available plans, no active subscription, billing conflict. |
| Users | Duplicate email, invalid role, no permission. |
| Administration | No admin permission, impact warning, audit logs empty. |

---

## 12. Prototype Paths

The clickable prototype should include these minimum paths:

```text
1. Login -> Dashboard
2. Dashboard -> Scope Breadcrumb Bar -> Change Scope
3. Dashboard -> Hierarchy -> Select Floor -> Topology Tab
4. Topology Tab -> Overlay Controls -> Device Detail Drawer
5. Devices -> Device Detail -> Diagnostics
6. Customers -> Create Customer -> Customer Workspace
7. Billing -> Available Plans -> Select Plan -> Current Subscription
8. Billing -> Create Billing Plan -> Plan Detail
9. Users -> Create User -> User Detail
10. Administration -> Roles and Policies -> Impact Warning
11. Any screen -> No Permission
12. Any screen -> Backend Unavailable -> Retry
```

Prototype interactions should be documented in Figma using frame links and flow labels.

---

## 13. Mobile Wireframes

Create mobile variants only for the most important flows.

## 13.1 Required mobile frames

```text
Mobile - App Shell - Drawer Closed
Mobile - App Shell - Drawer Open
Mobile - Scope Selector
Mobile - Dashboard
Mobile - Hierarchy Tree Picker
Mobile - Hierarchy Workspace
Mobile - Device Inventory
Mobile - Device Detail
Mobile - Billing Available Plans
Mobile - No Permission
Mobile - Backend Unavailable
```

## 13.2 Mobile behavior

```text
Sidebar becomes drawer
Scope Breadcrumb Bar becomes compact selector
Tables become cards
Detail drawers become full-screen panels
Topology controls become bottom sheet
Workspace tabs scroll horizontally
```

---

## 14. Figma Component Priorities

Create these components before full screen wireframes.

## 14.1 Shell components

```text
Shell/TopAppHeader
Shell/Sidebar
Shell/SidebarItem
Shell/ScopeBreadcrumbBar
Shell/GlobalSearchOverlay
Shell/UserProfileMenu
```

## 14.2 Content components

```text
Content/PageHeader
Content/KPICard
Content/SummaryCard
Content/StatusBadge
Content/WorkspaceTabs
```

## 14.3 Table and form components

```text
Table/DataTable
Table/FilterBar
Table/RowActions
Form/TextInput
Form/Select
Form/ScopeSelector
Form/StepIndicator
Form/ValidationMessage
Modal/Confirmation
```

## 14.4 Topology components

```text
Topology/Canvas
Topology/OverlayControls
Topology/DeviceMarker
Topology/Link
Topology/DetailDrawer
```

## 14.5 State components

```text
State/Loading
State/Empty
State/NoPermission
State/BackendUnavailable
State/Error
State/PartialData
State/Confirmation
State/SuccessToast
```

---

## 15. Wireframe Acceptance Checklist

The wireframe plan is complete when:

- All first-phase modules have at least one required wireframe.
- The Top App Header and Scope Breadcrumb Bar are represented correctly.
- Scope switching is shown as a core prototype flow.
- Hierarchy workspace and topology flow are represented.
- Topology is not a root sidebar module.
- Device connectivity topology remains under Devices.
- Billing parent-child scope isolation is represented.
- High-risk RBAC variants are included.
- Loading, empty, error, no-permission, backend-unavailable, partial-data, and confirmation states are included.
- Mobile variants are defined for important flows.
- Prototype paths are listed and ready to build in Figma.
- Deferred modules are not expanded in this phase.

---

## 16. Final Output of This Phase

The output of this phase is:

```text
wireframe-plan.md
```

After this document is approved, create in Figma:

```text
Low-fidelity wireframe frames
Reusable components
Workflow wireframe sequences
Clickable prototype paths
RBAC and system-state variants
```

---

## 17. Next Step

After `wireframe-plan.md`, proceed to:

```text
Figma low-fidelity wireframes
Figma clickable prototype
```

Recommended prototype build order:

```text
1. App Shell
2. Dashboard
3. Scope switching
4. Hierarchy workspace
5. Topology tab
6. Device detail and diagnostics
7. Billing plan selection
8. Customer creation
9. User creation
10. Administration role change
11. System states
12. Mobile variants
```

---

## 18. Final Summary

This wireframe plan converts all previous MDU UI design documents into an execution-ready Figma plan.

It defines:

```text
required wireframes
workflow sequences
RBAC variants
system-state frames
prototype paths
mobile variants
component priorities
```

This is the final Markdown planning phase before creating the Figma low-fidelity prototype.


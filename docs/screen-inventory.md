# MDU UI - Screen Inventory

# 1. Purpose

This document defines the complete screen inventory for the first-phase MDU UI design scope.

It is the Phase 3 design document and is based on:

* `mdu-ui-spec.md`
* `workflows.md`
* `figma-navigation-model.md`
* MDU UI wireframing and UX design process

The goal is to identify every screen, workspace, modal, panel, and important system state required before creating detailed screen definitions and low-fidelity wireframes.

This document answers:

```text
Which screens are required to support the approved in-scope MDU UI workflows for this phase?
```

It does not define final layout details. Detailed purpose, RBAC states, loading states, empty states, and error states will be defined in:

```text
screen-definitions.md
```

---

# 2. Screen Inventory Principles

The screen inventory follows these product rules:

* `mdu-ui-spec.md` remains the source of truth.
* Top App Header represents global product controls: logo, global search, notifications, help, and user profile.
* Sidebar navigation represents what the user wants to do.
* Scope Breadcrumb Bar represents where the user is working.
* Every resource screen must resolve scope from the selected hierarchy context shown in the Scope Breadcrumb Bar.
* Topology is not a root sidebar screen.
* Topology is a contextual workspace view inside the selected hierarchy node.
* Billing screens must enforce parent-child scope isolation.


Navigation rule:

```text
Top App Header = GLOBAL product controls
Sidebar = WHAT the user wants to do
Scope Breadcrumb Bar = WHERE the user is working
```

---

# 3. Screen ID Naming Convention

Use the following naming convention:

```text
SCR-<MODULE>-<NUMBER>
```

Examples:

```text
SCR-AUTH-001
SCR-DASHBOARD-001
SCR-HIERARCHY-003
SCR-BILLING-004
```

Recommended Figma frame naming:

```text
[Screen ID] - [Screen Name]
```

Example:

```text
SCR-BILLING-003 - Create Billing Plan
```

---

# 4. Layout Type Reference

The following reusable layout types should be referenced from this inventory and finalized in `layout-system.md`.

| Layout Type | Description |
| ---------- | ----------- |
| App Shell Layout | Top App Header, sidebar, Scope Breadcrumb Bar, main workspace |
| Auth Layout | Login, password reset, session screens |
| Dashboard Layout | Cards, summaries, charts, alerts, insights |
| Table + Detail Layout | List/table with detail drawer or detail page |
| Form / Wizard Layout | Create/edit flows and multi-step workflows |
| Hierarchy Workspace Layout | Hierarchy tree with contextual workspace tabs |
| System State Layout | Loading, empty, no permission, backend unavailable, error |

---

# 5. Global Shell and Cross-Cutting Screens

These screens/components exist across the whole product.

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-SHELL-001 | Main App Shell | Shell | Provides Top App Header, sidebar, Scope Breadcrumb Bar, content area, and global shell structure | All workflows |
| SCR-SHELL-002 | Scope Breadcrumb Bar / Scope Selector | Component/Overlay | Shows and controls current hierarchy scope: Operator > Customer > Sub-Operator > Site > Building > Floor > Venue | WF-HIERARCHY-001 |
| SCR-SHELL-003 | Top App Header | Component | Shows global product controls: logo, global search, notifications, help, and user profile | Cross-cutting, WF-AUTH-003 |
| SCR-SHELL-004 | Global Search / Resource Search | Overlay | Search permitted customers, nodes, devices and users | Cross-cutting |
| SCR-SHELL-005 | User Profile Menu | Overlay | Access profile, change password, logout | WF-AUTH-003 |
| SCR-SHELL-006 | Permission Denied State | System State | Show 403 and no-permission UI without breaking navigation | Cross-cutting |
| SCR-SHELL-007 | Backend Unavailable State | System State | Show service unavailable and retry behavior | Cross-cutting |
| SCR-SHELL-008 | Empty State Template | System State | Standard empty state for scoped resources | Cross-cutting |
| SCR-SHELL-009 | Loading / Skeleton State | System State | Standard loading behavior for modules and tables | Cross-cutting |
| SCR-SHELL-010 | Not Found State | System State | Handles missing or deleted resources | Cross-cutting |
| SCR-SHELL-011 | Confirmation Dialog | Component/Modal | Used for destructive or sensitive actions | Customer, Device, Billing, User, Admin |

---

# 6. Authentication Screens

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-AUTH-001 | Login | Page | User login through OWSEC | WF-AUTH-001 |
| SCR-AUTH-002 | Forgot Password | Page/Form | Start password recovery | Auth support |
| SCR-AUTH-003 | Reset Password | Page/Form | Complete password reset | Auth support |
| SCR-AUTH-004 | Change Password | Page/Form | Change password after login or forced reset | Auth support |
| SCR-AUTH-005 | Session Expired | Page/State | Inform user session expired and redirect to login | WF-AUTH-002 |
| SCR-AUTH-006 | Logout Processing | State | Clear session and synchronize logout across tabs | WF-AUTH-003 |
| SCR-AUTH-007 | Backend Bootstrap Failed | State | Auth succeeded but backend bootstrap failed | WF-AUTH-001 |

---

# 7. Dashboard Screens

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-DASHBOARD-001 | Global Dashboard | Page | Root/operator-level platform overview | WF-AUTH-001 |
| SCR-DASHBOARD-002 | Scoped Dashboard | Page | Dashboard scoped to selected customer/site/node | WF-HIERARCHY-001 |
| SCR-DASHBOARD-003 | Health Summary Panel | Panel | Summarize device, and service health | Device|
| SCR-DASHBOARD-004 | Recent Alerts Panel | Panel | Show recent operational alerts inside selected scope |  Cross-cutting |
| SCR-DASHBOARD-005 | Billing Summary Panel | Panel | Show subscription or billing summary when permitted | WF-BILLING-004 |

---

# 8. Customers / Sub-Operators Screens

The Customers module is for tenant/customer/sub-operator management.

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-CUSTOMER-001 | Customer List | Page/Table | List permitted customers/sub-operators | WF-CUSTOMER-002 |
| SCR-CUSTOMER-002 | Create Customer | Form/Wizard | Create child customer/sub-operator and first admin user | WF-CUSTOMER-001 |
| SCR-CUSTOMER-003 | Customer Detail | Page/Detail | View customer profile, status, scope, and summary | WF-CUSTOMER-002 |
| SCR-CUSTOMER-004 | Edit Customer | Form | Edit customer/sub-operator metadata | Customer management |
| SCR-CUSTOMER-005 | Suspend Customer Confirmation | Modal | Confirm customer suspension with impact warning | WF-CUSTOMER-003 |
| SCR-CUSTOMER-006 | Delete Customer Confirmation | Modal | Confirm destructive customer deletion with dependency warning | WF-CUSTOMER-003 |
| SCR-CUSTOMER-007 | Customer Workspace | Workspace | Customer-level contextual workspace | WF-CUSTOMER-002 |
| SCR-CUSTOMER-008 | Customer Billing Tab | Tab | View/assign billing plan for customer when permitted | WF-BILLING-002, WF-BILLING-004 |
| SCR-CUSTOMER-009 | Customer Users Tab | Tab | View users inside customer scope | WF-USER-001, WF-USER-002, WF-USER-003 |
| SCR-CUSTOMER-010 | Customer Health Summary | Panel/Page | Show health and operational summary for customer | WF-CUSTOMER-002 |


---

# 9. Hierarchy Screens

The Hierarchy module is the primary operational subtree navigation workspace.

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-HIERARCHY-001 | Hierarchy Module | Page | Entry screen for subtree navigation | WF-HIERARCHY-002 |
| SCR-HIERARCHY-002 | Hierarchy Tree | Component | Expand and select customers, sites, buildings, towers, floors, venues | WF-HIERARCHY-001, WF-HIERARCHY-002 |
| SCR-HIERARCHY-003 | Node Workspace Shell | Workspace | Contextual workspace for selected hierarchy node | WF-HIERARCHY-003 |
| SCR-HIERARCHY-004 | Node Overview Tab | Tab | Summary of selected node health, counts, and status | WF-HIERARCHY-003 |
| SCR-HIERARCHY-005 | Node Topology Tab | Tab | Contextual topology for selected hierarchy node | WF-TOPOLOGY-001 |
| SCR-HIERARCHY-006 | Node Devices Tab | Tab/Table | Infrastructure devices inside selected node scope | WF-DEVICE-001 |
| SCR-HIERARCHY-007 | Node Configurations Tab | Tab | Configurations assigned/effective for selected node | WF-CONFIG-003, WF-CONFIG-004 |
| SCR-HIERARCHY-008 | Create Node | Form/Modal | Create site/building/tower/floor/venue under selected scope | WF-HIERARCHY-004 |
| SCR-HIERARCHY-009 | Edit Node | Form/Modal | Edit selected node details | WF-HIERARCHY-005 |
| SCR-HIERARCHY-010 | Move Node | Modal/Wizard | Move node to a new permitted parent scope | WF-HIERARCHY-006 |
| SCR-HIERARCHY-011 | Delete Node Confirmation | Modal | Confirm delete with impact/dependency warning | WF-HIERARCHY-007 |
| SCR-HIERARCHY-012 | Empty Hierarchy State | State | Show when selected scope has no child nodes | WF-HIERARCHY-002 |

---

# 10. Devices Screens

The Devices module is only for infrastructure devices: gateways, switches, and access points.

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-DEVICE-001 | Device Inventory | Page/Table | List infrastructure devices inside selected scope | WF-DEVICE-001 |
| SCR-DEVICE-002 | Gateways List | Page/Tab | Filtered gateway inventory | WF-DEVICE-001 |
| SCR-DEVICE-003 | Switches List | Page/Tab | Filtered switch inventory | WF-DEVICE-001 |
| SCR-DEVICE-004 | Access Points List | Page/Tab | Filtered AP inventory | WF-DEVICE-001 |
| SCR-DEVICE-005 | Device Detail | Page/Detail | View device identity, status, assignment | WF-DEVICE-001 |
| SCR-DEVICE-006 | Device Diagnostics | Page/Tab | View logs, status, uplink, errors | WF-DEVICE-002 |
| SCR-DEVICE-007 | Device Action Confirmation | Modal | Confirm reboot, upgrade, blink, factory reset | WF-DEVICE-003 |
| SCR-DEVICE-008 | Add Device | Form/Modal | Add infrastructure device by serial/type | WF-DEVICE-004 |
| SCR-DEVICE-009 | Assign Device | Form/Modal | Assign device to node/venue/floor | WF-DEVICE-005 |
| SCR-DEVICE-010 | Move Device | Form/Modal | Move device to another permitted node/venue | WF-DEVICE-006 |
| SCR-DEVICE-011 | Firmware Management | Page/Tab | View firmware state and upgrade eligibility | WF-DEVICE-003 |
| SCR-DEVICE-012 | Device Assignments | Page/Tab | Manage assignment history and current scope | WF-DEVICE-005, WF-DEVICE-006 |
| SCR-DEVICE-013 | Connectivity View | Page/Graph | Engineering topology for device uplinks and connectivity | WF-TOPOLOGY-002 |
| SCR-DEVICE-014 | Device Empty Inventory State | State | Show when no devices exist in selected scope | WF-DEVICE-001 |

---

# 11. Configuration Screens

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-CONFIG-001 | Configuration List | Page/Table | List configuration sets inside selected scope | WF-CONFIG-001, WF-CONFIG-002 |
| SCR-CONFIG-002 | Create Configuration | Form | Create configuration set after resolving current scope | WF-CONFIG-001 |
| SCR-CONFIG-003 | Edit Configuration | Form | Edit configuration settings | WF-CONFIG-002 |
| SCR-CONFIG-004 | Configuration Detail | Page/Detail | View configuration summary, status, assignments | WF-CONFIG-002, WF-CONFIG-003 |
| SCR-CONFIG-005 | Configuration Version History | Page/Tab | View previous versions and change history | WF-CONFIG-002 |
| SCR-CONFIG-006 | Assign Configuration | Form/Modal | Assign configuration to permitted nodes/devices | WF-CONFIG-003 |
| SCR-CONFIG-007 | Effective Configuration Preview | Page/Panel | Preview effective config for node/device and overrides | WF-CONFIG-004 |
| SCR-CONFIG-008 | Configuration Validation Errors | State/Panel | Show invalid settings or conflicts | WF-CONFIG-001, WF-CONFIG-002 |

---

# 12. Topology Screens

Topology screens are contextual and are not root sidebar screens.

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-TOPOLOGY-001 | Contextual Venue Topology | Tab/Canvas | Default topology view inside selected hierarchy workspace | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-002 | Site-Level Topology | Tab/Canvas | Building summaries and aggregate health | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-003 | Building-Level Topology | Tab/Canvas | Floor structure, AP density, distribution summary | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-004 | Tower-Level Topology | Tab/Canvas | Floor relationships and tower-level health | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-005 | Floor-Level Topology | Tab/Canvas |  AP placement, wireless overlays | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-006 | Venue-Level Topology | Tab/Canvas | Detailed overlays, AP behavior, coverage visualization | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-007 | Topology Overlay Controls | Panel | Toggle APs, switches, gateways, health, wireless quality | WF-TOPOLOGY-001 |
| SCR-TOPOLOGY-008 | Topology Device Detail Drawer | Drawer | Inspect selected device from topology | WF-TOPOLOGY-001, WF-DEVICE-001 |

---

# 13. Billing Screens

Billing screens must enforce direct parent-child plan ownership, eligible plan visibility, and single active subscription behavior.

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-BILLING-001 | Billing Overview | Page/Dashboard | Show billing status, plan summary, and actions for selected scope | WF-BILLING-004 |
| SCR-BILLING-002 | Billing Plan List | Page/Table | List plans user can manage or view | WF-BILLING-001 |
| SCR-BILLING-003 | Create Billing Plan | Form | Create connection-based or fixed-device plan | WF-BILLING-001 |
| SCR-BILLING-004 | Edit Billing Plan | Form | Edit allowed plan fields | WF-BILLING-001 |
| SCR-BILLING-005 | Billing Plan Detail | Page/Detail | View plan details, status, features, pricing, limits | WF-BILLING-001 |
| SCR-BILLING-006 | Activate / Deactivate Plan Confirmation | Modal | Confirm plan status change | WF-BILLING-001 |
| SCR-BILLING-007 | Assign Plan to Customer | Form/Modal | Assign eligible plan to direct child customer/sub-operator | WF-BILLING-002 |
| SCR-BILLING-008 | Available Plans | Page/Cards | Customer/sub-operator views parent-offered active plans | WF-BILLING-003 |
| SCR-BILLING-009 | Select Plan Confirmation | Modal | Confirm selected plan and check existing active subscription | WF-BILLING-003 |
| SCR-BILLING-010 | Replace Existing Plan Confirmation | Modal | Confirm replace-or-reject behavior for existing active subscription | WF-BILLING-003 |
| SCR-BILLING-011 | Current Subscription Detail | Page/Detail | View current subscription, state, plan type, limits, renewal | WF-BILLING-004 |
| SCR-BILLING-012 | Subscription Visibility Dashboard | Page/Table | Operator views permitted child subscriptions | WF-BILLING-004 |
| SCR-BILLING-013 | Connection-Based Billing Detail | Page/Panel | Show connected-device billing details | WF-BILLING-004 |
| SCR-BILLING-014 | Fixed-Device Billing Detail | Page/Panel | Show fixed device limits and usage | WF-BILLING-004 |
| SCR-BILLING-015 | No Available Plans State | State | Show when customer has no eligible plans | WF-BILLING-003 |
| SCR-BILLING-016 | No Active Subscription State | State | Show when no subscription exists | WF-BILLING-004 |
| SCR-BILLING-017 | Billing Conflict State | State | Show single-active-plan conflict or 409 error | WF-BILLING-003 |

---

# 14. Users Screens

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-USER-001 | User List | Page/Table | List users inside selected or permitted scope | WF-USER-001 |
| SCR-USER-002 | Create User | Form | Create user and assign role/profile/scope | WF-USER-001 |
| SCR-USER-003 | User Detail | Page/Detail | View user profile, status, roles, scope | WF-USER-001, WF-USER-002, WF-USER-003 |
| SCR-USER-004 | Edit User | Form | Edit user details where permitted | WF-USER-001 |
| SCR-USER-005 | Assign Role/Profile | Form/Modal | Assign permission profile within allowed authority | WF-USER-001 |
| SCR-USER-006 | Reset Password Confirmation | Modal | Trigger OWSEC password reset flow | WF-USER-002 |
| SCR-USER-007 | Suspend User Confirmation | Modal | Suspend user and optionally revoke active sessions | WF-USER-003 |
| SCR-USER-008 | User Sessions | Page/Tab | View and manage active sessions when permitted | WF-USER-003 |
| SCR-USER-009 | User Scope Assignment Summary | Panel | Show assigned customer/subtree/node scope | WF-USER-001 |

---

# 15. Administration Screens

| Screen ID | Screen Name | Type | Purpose | Linked Workflows |
| --------- | ----------- | ---- | ------- | ---------------- |
| SCR-ADMIN-001 | Administration Overview | Page | Entry point for platform/operator administration | WF-ADMIN-001 |
| SCR-ADMIN-002 | Platform Settings | Page/Form | Manage global settings when permitted | WF-ADMIN-001 |
| SCR-ADMIN-003 | Operator Administration | Page/Table | Manage operator-level settings and child operator context | WF-ADMIN-001 |
| SCR-ADMIN-004 | Roles and Policies | Page/Table | View and manage role/policy profiles | WF-ADMIN-001 |
| SCR-ADMIN-005 | Edit Role / Policy | Form | Edit permitted role or policy settings | WF-ADMIN-001 |
| SCR-ADMIN-006 | Audit Logs | Page/Table | View permitted audit events | WF-ADMIN-002 |
| SCR-ADMIN-007 | Audit Event Detail | Page/Drawer | Inspect selected audit event | WF-ADMIN-002 |
| SCR-ADMIN-008 | Advanced / Debug Views | Page | Internal troubleshooting views for permitted admins | Admin support |
| SCR-ADMIN-009 | Permission Change Impact Warning | Modal | Warn before sensitive RBAC changes | WF-ADMIN-001 |

---

# 16. Screen Coverage by Workflow

| Workflow Area | Required Screens |
| ------------ | ---------------- |
| Dashboard | SCR-DASHBOARD-001 to SCR-DASHBOARD-005 |
| Authentication | SCR-AUTH-001 to SCR-AUTH-007 |
| Customer/Sub-Operator | SCR-CUSTOMER-001 to SCR-CUSTOMER-010 |
| Billing | SCR-BILLING-001 to SCR-BILLING-017 |
| Hierarchy | SCR-HIERARCHY-001 to SCR-HIERARCHY-012 |
| Devices | SCR-DEVICE-001 to SCR-DEVICE-014 |
| Configurations | SCR-CONFIG-001 to SCR-CONFIG-008 |
| Topology | SCR-TOPOLOGY-001 to SCR-TOPOLOGY-008 |
| Users | SCR-USER-001 to SCR-USER-009 |
| Administration | SCR-ADMIN-001 to SCR-ADMIN-009 |
| Global Shell / States | SCR-SHELL-001 to SCR-SHELL-011 |

---

# 17. Recommended Figma Page Organization

Recommended Figma pages:

```text
00 - Cover and Notes
01 - App Shell and Navigation
02 - Authentication
03 - Dashboard
04 - Customers
05 - Hierarchy Workspace
06 - Devices
07 - Configurations
08 - Topology
09 - Billing
10 - Users
11 - Administration
12 - System States
13 - Prototype Flows
```

Recommended frame naming:

```text
SCR-HIERARCHY-005 - Node Topology Tab
SCR-BILLING-009 - Select Plan Confirmation
```

---

# 18. Recommended Wireframing Priority

Use this order for low-fidelity wireframes:

```text
1. Main App Shell and Navigation
2. Top App Header and Scope Breadcrumb Bar
3. Hierarchy Workspace Shell
4. Dashboard
5. Customers
6. Devices
7. Topology
8. Configurations
9. Billing
10. Users
11. Administration
12. System States
```

Reason:

```text
Hierarchy context is the highest UX risk.
```

The app shell, Top App Header, Scope Breadcrumb Bar, and hierarchy workspace should be validated before detailed module wireframes.

---

# 19. Screens Requiring Detailed RBAC and State Definitions

The following screens must receive detailed RBAC and system-state definitions in `screen-definitions.md`.

## High Priority

* SCR-SHELL-001 - Main App Shell
* SCR-SHELL-002 - Scope Breadcrumb Bar / Scope Selector
* SCR-SHELL-003 - Top App Header
* SCR-HIERARCHY-003 - Node Workspace Shell
* SCR-HIERARCHY-005 - Node Topology Tab
* SCR-DEVICE-005 - Device Detail
* SCR-DEVICE-013 - Connectivity View
* SCR-BILLING-003 - Create Billing Plan
* SCR-BILLING-008 - Available Plans
* SCR-BILLING-009 - Select Plan Confirmation
* SCR-BILLING-011 - Current Subscription Detail
* SCR-CONFIG-007 - Effective Configuration Preview
* SCR-ADMIN-004 - Roles and Policies

## Required State Coverage

Each important screen must define:

```text
Loading
Empty
No Permission
Backend Unavailable
Partial Data
Success
Error
Read-only
Hidden Action
Disabled Action
```

---

# 20. Inventory Acceptance Checklist

This inventory is complete when:

* Every in-scope workflow from `workflows.md` maps to at least one screen.
* Every in-scope sidebar module for this phase has at least one screen.
* Hierarchy workspace tabs are represented.
* Topology appears only as contextual hierarchy workspace or device connectivity view.
* Billing includes plan management, assignment, available plans, and subscription screens.
* User management and administration screens are included.
* Global error, permission, empty, and backend unavailable states are included.
* Screens are ready to be expanded in `screen-definitions.md`.

---
# 21. Design Scope for This Phase

This screen inventory intentionally covers only the first-phase design scope.

Included modules:

- Global Shell
- Authentication
- Dashboard
- Hierarchy
- Topology
- Devices
- Configuration
- Customers / Sub-Operators
- Billing
- Users
- Administration

Deferred modules:

- Clients
- Rollouts
- Maps
- Metrics
- AI Agent

These deferred modules are part of the full MDU UI specification, but they are intentionally excluded from this phase of screen inventory and will be handled in later design phases.

# 22. Final Summary

This screen inventory defines the required screens for the MDU UI design system.

It supports:

* Recursive hierarchy navigation
* Scope Breadcrumb Bar selected-scope behavior
* Operational sidebar modules
* Customer/sub-operator management
* Billing and subscription management
* Topology as contextual visualization
* Configuration workflows
* RBAC-aware navigation and screen visibility
* Backend outage and system-state handling

Next document:

```text
screen-definitions.md
```

The next phase should define each important screen's purpose, primary actions, KPIs, hierarchy dependency, RBAC visibility, loading states, empty states, no-permission states, backend-unavailable states, and error states.

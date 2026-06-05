# MDU UI - Layout System

## 1. Purpose

This document defines the reusable layout patterns for the first-phase MDU UI.

It follows:

```text
mdu-ui-spec.md
workflows.md
figma-navigation-model.md
screen-inventory.md
screen-definitions.md
```

Goal:

```text
Do not design every screen from scratch.
Use reusable layouts for repeated screen patterns.
```

This document feeds the next phase:

```text
wireframe-plan.md
```

---

## 2. Phase Scope

### Included modules

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

### Deferred modules

```text
Clients
Rollouts
Maps
Metrics
AI Agent
```

Deferred modules should not be expanded in this layout phase.

---

## 3. Core Rules

### 3.1 Navigation model

```text
Top App Header = GLOBAL product controls
Sidebar = WHAT the user wants to do
Scope Breadcrumb Bar = WHERE the user is working
Workspace Tabs = HOW the user works inside the selected scope
```

### 3.2 Top App Header

Contains:

```text
Logo
Global search
Notifications
Help
User profile
```

The Top App Header does not control hierarchy scope.

### 3.3 Scope Breadcrumb Bar

Shows and controls the selected working scope:

```text
Operator > Customer > Sub-Operator > Site > Building > Floor > Venue
```

Changing this scope refreshes all scoped module data.

### 3.4 Scope-first loading

Every scoped screen must follow:

```text
Open screen
-> Resolve selected scope from Scope Breadcrumb Bar
-> Load authorized data only
-> Show authorized actions only
```

### 3.5 RBAC behavior

Layouts must support:

```text
Visible
Hidden
Disabled
Read-only
No permission
```

Default rules:

```text
Unauthorized module = hidden
Unauthorized action = hidden
Read-only = visible but not editable
Backend 403 = no-permission state
```

### 3.6 System states

Every layout must support:

```text
Loading
Empty
Error
No Permission
Backend Unavailable
Partial Data
Success
Confirmation Required
```

---

## 4. Layout List

| ID | Layout | Purpose |
|---|---|---|
| LYT-001 | App Shell | Shared authenticated frame. |
| LYT-002 | Auth | Login and session screens. |
| LYT-003 | Dashboard | Summary cards, alerts, health, quick actions. |
| LYT-004 | Hierarchy Workspace | Hierarchy tree plus node workspace. |
| LYT-005 | List + Detail | Tables, filters, detail drawers/pages. |
| LYT-006 | Form + Confirmation | Create, edit, assign, move, delete, confirm flows. |
| LYT-007 | Topology Canvas | Hierarchy topology and device connectivity views. |
| LYT-008 | System State | Loading, empty, error, no-permission, backend-down states. |

These eight layouts are enough for the first-phase UI.

---

# 5. LYT-001 - App Shell

## Purpose

Provides the shared frame for authenticated screens.

## Used by

```text
Dashboard
Hierarchy
Devices
Configuration
Customers
Billing
Users
Administration
```

## Structure

```text
+-------------------------------------------------------------+
| Top App Header: Logo | Search | Notifications | Help | User |
+----------------------+--------------------------------------+
| Sidebar              | Scope Breadcrumb Bar                  |
|                      | Operator > Customer > Site > Floor    |
|                      +--------------------------------------+
|                      | Main Workspace                        |
+----------------------+--------------------------------------+
```

## Required regions

| Region | Purpose |
|---|---|
| Top App Header | Global product controls. |
| Sidebar | Operational modules. |
| Scope Breadcrumb Bar | Current working scope and scope switching. |
| Main Workspace | Page content. |
| Optional Drawer | Details, filters, confirmations, related context. |

## Rules

- Sidebar shows operational modules only.
- Topology is not a root sidebar module.
- Scope Breadcrumb Bar controls selected scope.
- Unauthorized sidebar modules are hidden.
- On mobile, sidebar becomes drawer and Scope Breadcrumb Bar becomes compact selector.

## Figma components

```text
Shell/TopAppHeader
Shell/Sidebar
Shell/SidebarItem
Shell/ScopeBreadcrumbBar
Shell/MainWorkspace
Shell/UserProfileMenu
Shell/GlobalSearchOverlay
```

---

# 6. LYT-002 - Auth

## Purpose

Supports unauthenticated and session-related screens.

## Used by

```text
Login
Forgot Password
Reset Password
Change Password
Session Expired
Logout Processing
Backend Bootstrap Failed
```

## Structure

```text
+-------------------------------------------------------------+
| Brand / Product Identity                                    |
+-------------------------------------------------------------+
| Auth Card                                                   |
| Title                                                       |
| Form Fields                                                 |
| Primary Action                                              |
| Secondary Links                                             |
+-------------------------------------------------------------+
```

## Rules

- No sidebar before authentication.
- No hierarchy scope before backend bootstrap.
- OWSEC authentication can work even when MDU backend is unavailable.
- Do not reveal whether an account exists during password reset.

## States

```text
Submitting
Invalid credentials
Account locked
OWSEC unavailable
Backend bootstrap failed
Session expired
Password reset success
```

---

# 7. LYT-003 - Dashboard

## Purpose

Shows operational summary for global or selected scope.

## Used by

```text
Global Dashboard
Scoped Dashboard
Health Summary Panel
Recent Alerts Panel
Billing Summary Panel
```

## Structure

```text
+-------------------------------------------------------------+
| Page Header: Dashboard title, selected scope, last updated   |
+-------------------------------------------------------------+
| KPI Cards                                                   |
| Customers | Sites | Devices | Users | Alerts | Billing      |
+-------------------------------------------------------------+
| Health Summary                    | Recent Alerts            |
+-------------------------------------------------------------+
| Device Summary / Activity         | Quick Actions            |
+-------------------------------------------------------------+
```

## Recommended content

```text
Customer/site/building/floor/venue counts
Device count and health
User count
Recent alerts
Billing summary if permitted
Quick actions if permitted
```

## RBAC behavior

- Billing cards are hidden if the user lacks billing permission.
- Admin actions are hidden for non-admin users.
- Read-only users see summaries only.

## States

```text
Loading
Empty scope
Partial data
No permission
Backend unavailable
```

---

# 8. LYT-004 - Hierarchy Workspace

## Purpose

Supports recursive hierarchy navigation and node-level workspaces.

This is the highest-priority layout because hierarchy-context complexity is the biggest UX risk.

## Used by

```text
Hierarchy Module
Hierarchy Tree
Node Workspace Shell
Node Overview Tab
Node Topology Tab
Node Devices Tab
Node Configurations Tab
Create Node
Edit Node
Move Node
Delete Node
```

## Structure

```text
+-------------------------------------------------------------+
| Page Header: Hierarchy                                      |
+-------------------------------------------------------------+
| Hierarchy Tree              | Node Workspace                 |
| Search / Filter             | Node Header                    |
| Recursive Tree              | Workspace Tabs                 |
| Selected Node               | Overview / Topology / Devices  |
+-------------------------------------------------------------+
```

## Workspace tabs for this phase

```text
Overview
Topology
Devices
Configurations
```

Deferred tabs:

```text
Clients
Maps
Metrics
AI Insights
```

## Tree behavior

The tree must support variable depth:

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

Rules:

- Tree shows allowed nodes only.
- Selected node is highlighted.
- Tree selection updates the Scope Breadcrumb Bar.
- Scope Breadcrumb Bar selection updates the tree.
- Tabs adapt by node type, permissions, and available data.

## States

```text
Tree loading
Node loading
Empty hierarchy
No selected node
Node unavailable
No permission
Backend unavailable
Partial data
```

---

# 9. LYT-005 - List + Detail

## Purpose

Reusable layout for resource lists, tables, filters, and detail inspection.

## Used by

```text
Customer List
Device Inventory
Gateway / Switch / AP Lists
Configuration List
Billing Plan List
Subscription Visibility Dashboard
User List
Audit Logs
```

## Structure

```text
+-------------------------------------------------------------+
| Page Header: title, scope, primary action                   |
+-------------------------------------------------------------+
| Filter Bar: search, filters, sort                           |
+-------------------------------------------------------------+
| Table / List                                                |
| Rows, columns, status, actions                              |
+-------------------------------------------------------------+
| Optional Detail Drawer / Detail Page                        |
+-------------------------------------------------------------+
```

## Common columns

| Module | Typical columns |
|---|---|
| Customers | Name, status, parent scope, subscription, users, devices. |
| Devices | Name, type, serial, status, assignment, firmware, last seen. |
| Configurations | Name, version, status, assignments, updated date. |
| Billing Plans | Name, type, status, cycle, price, limits. |
| Users | Name, email, role/profile, status, scope. |
| Audit Logs | Time, actor, action, resource, scope, result. |

## Rules

- Lists show only authorized resources.
- Primary create action is hidden if not permitted.
- Row actions are RBAC-aware.
- Destructive actions open confirmation.
- Empty lists use System State layout.

## States

```text
Loading
Empty
No search results
No permission
Backend unavailable
Partial data
Row action failed
```

---

# 10. LYT-006 - Form + Confirmation

## Purpose

Reusable layout for create, edit, assignment, move, delete, and confirmation flows.

## Used by

```text
Create Customer
Edit Customer
Create Node
Move Node
Add Device
Assign Device
Create Configuration
Assign Configuration
Create Billing Plan
Assign Plan to Customer
Create User
Assign Role/Profile
Edit Role/Policy
Confirmation Dialogs
```

## Modal structure

```text
+-------------------------------------------+
| Header: title, close                      |
+-------------------------------------------+
| Body: fields, validation, warnings        |
+-------------------------------------------+
| Footer: Cancel | Primary Action           |
+-------------------------------------------+
```

## Wizard structure

```text
+-------------------------------------------------------------+
| Header: title, step indicator                               |
+-------------------------------------------------------------+
| Step Content                                                |
+-------------------------------------------------------------+
| Footer: Back | Next | Submit                                |
+-------------------------------------------------------------+
```

## Common wizard examples

### Create Customer

```text
Customer details
First admin user
Optional billing assignment
Review and create
```

### Create Billing Plan

```text
Plan type
Plan details
Pricing and limits
Review and save
```

### Move Node / Move Device

```text
Select new parent/scope
Validate compatibility
Review impact
Confirm move
```

## Rules

- Parent scope must be visible before submit.
- Validation errors appear inline.
- Unauthorized actions are hidden before the form opens.
- Backend errors preserve entered data.
- Destructive actions require confirmation.

## States

```text
Loading
Submitting
Validation error
Conflict
No permission
Backend unavailable
Success
Confirmation required
```

---

# 11. LYT-007 - Topology Canvas

## Purpose

Supports visual topology views.

There are two topology experiences:

```text
Hierarchy -> Select Node -> Topology Tab
Devices -> Connectivity View
```

## Used by

```text
Node Topology Tab
Contextual Venue Topology
Site-Level Topology
Building-Level Topology
Tower-Level Topology
Floor-Level Topology
Venue-Level Topology
Topology Overlay Controls
Topology Device Detail Drawer
Device Connectivity View
```

## Structure

```text
+-------------------------------------------------------------+
| Topology Header: node/scope, status, view controls           |
+-------------------------------------------------------------+
| Overlay Controls / Filters                                  |
+-------------------------------------------------------------+
| Canvas / Graph                                              |
| Devices, links, markers, overlays                           |
+-------------------------------------------------------------+
| Optional Detail Drawer                                      |
+-------------------------------------------------------------+
```

## Topology by level

| Selected level | Layout behavior |
|---|---|
| Site | Building summaries and aggregate health. |
| Building | Floor structure and AP density. |
| Tower | Floor relationships and tower health. |
| Floor | Floor topology, AP placement, wireless overlays. |
| Venue | Detailed AP behavior and coverage visualization. |

## Rules

- Topology is not a root sidebar module.
- Device connectivity topology belongs under Devices.
- Unauthorized devices and links are hidden.
- Read-only users can view but not edit.
- Partial topology data must be clearly marked.

## States

```text
Loading
No topology data
No map available
Partial data
Overlay unavailable
No permission
Backend unavailable
Graph layout failed
```

---

# 12. LYT-008 - System State

## Purpose

Defines reusable screen states across all layouts.

## Used by

```text
Permission Denied
Backend Unavailable
Empty State
Loading State
Not Found
Confirmation Dialog
Backend Bootstrap Failed
Empty Hierarchy
Device Empty Inventory
Billing Conflict
No Active Subscription
```

## State patterns

| State | Pattern |
|---|---|
| Loading | Skeleton inside current layout. |
| Empty | Message, explanation, permitted CTA. |
| No Permission | Safe message, no resource leak, safe navigation. |
| Backend Unavailable | Service message, retry action. |
| Error | Error summary, retry, preserve screen. |
| Partial Data | Show available data and mark failed sections. |
| Not Found | Resource unavailable without leaking details. |
| Confirmation | Review impact, confirm or cancel. |

## Rules

- Keep App Shell visible where possible.
- Do not flash unauthorized actions before RBAC resolves.
- Empty-state CTAs appear only if permitted.
- No-permission messages must not expose hidden resources.
- Backend-unavailable state should include retry.

---

# 13. Responsive Rules

## Desktop

```text
Full Top App Header
Visible sidebar
Full Scope Breadcrumb Bar
Tables use full columns
Drawers can appear on the right
```

## Tablet

```text
Collapsible sidebar
Compact filters
Hierarchy tree may become drawer
Tables reduce columns
```

## Mobile

```text
Sidebar becomes drawer
Scope Breadcrumb Bar becomes compact selector
Tables become cards
Detail drawers become full-screen panels
Topology controls become bottom sheet
Workspace tabs scroll horizontally
```

---

# 14. Screen-to-Layout Mapping

| Screen group | Primary layout | Secondary layout |
|---|---|---|
| Global Shell | App Shell | System State |
| Authentication | Auth | System State |
| Dashboard | Dashboard | App Shell, System State |
| Customers | List + Detail | Form + Confirmation |
| Hierarchy | Hierarchy Workspace | Topology Canvas, Form + Confirmation |
| Topology | Topology Canvas | System State |
| Devices | List + Detail | Form + Confirmation, Topology Canvas |
| Configuration | List + Detail | Form + Confirmation |
| Billing | List + Detail | Form + Confirmation, System State |
| Users | List + Detail | Form + Confirmation |
| Administration | List + Detail | Form + Confirmation, System State |

---

# 15. Figma Component Set

## Shell

```text
Shell/TopAppHeader
Shell/Sidebar
Shell/SidebarItem
Shell/ScopeBreadcrumbBar
Shell/MainWorkspace
Shell/GlobalSearchOverlay
Shell/UserProfileMenu
```

## Navigation

```text
Navigation/HierarchyTree
Navigation/HierarchyTreeNode
Navigation/WorkspaceTabs
Navigation/ActionMenu
```

## Content

```text
Content/PageHeader
Content/KPICard
Content/SummaryCard
Content/StatusBadge
Content/MetadataList
Content/ActivityList
```

## Table

```text
Table/DataTable
Table/FilterBar
Table/RowActions
Table/Pagination
```

## Forms

```text
Form/TextInput
Form/Select
Form/ScopeSelector
Form/StepIndicator
Form/ValidationMessage
Modal/Confirmation
Modal/ImpactWarning
```

## Topology

```text
Topology/Canvas
Topology/OverlayControls
Topology/Legend
Topology/DeviceMarker
Topology/Link
Topology/DetailDrawer
```

## States

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

# 16. Acceptance Checklist

This layout system is complete when:

- Top App Header and Scope Breadcrumb Bar are separated correctly.
- Sidebar represents operational modules only.
- Scope Breadcrumb Bar controls selected hierarchy scope.
- Topology remains contextual under Hierarchy.
- Device connectivity topology remains under Devices.
- Every first-phase screen group maps to a reusable layout.
- RBAC behavior is supported.
- Loading, empty, error, no-permission, backend-unavailable, partial-data, and confirmation states are supported.
- Responsive behavior is defined.
- Figma components are listed.
- The document is ready for `wireframe-plan.md`.

---

# 17. Next Phase

Next document:

```text
wireframe-plan.md
```

It should define:

```text
Which low-fidelity wireframes to create
Which workflow wireframes to create
Which Figma frames are required
Which prototype paths are required
Which RBAC and system states need visual frames
```

---

# 18. Final Summary

The first-phase MDU UI should use these reusable layouts:

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

These layouts are enough to support the current phase while keeping the UI scalable for later modules.

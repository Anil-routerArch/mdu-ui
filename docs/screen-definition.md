# MDU UI - Screen Definitions

## 1. Purpose

This document defines the purpose, actions, key information, hierarchy dependency, RBAC behavior, and required UI states for the first-phase MDU UI screens.

It is the Phase 4 design document after:

- `workflows.md`
- `figma-navigation-model.md`
- `screen-inventory.md`

This document is intended to guide:

- low-fidelity wireframes
- Figma screen creation
- clickable prototype behavior
- frontend implementation planning
- RBAC-aware UI behavior
- loading, empty, error, no-permission, and backend-unavailable states


---

## 2. Design Scope for This Phase

This screen definition document intentionally covers only the first-phase screen inventory.

### Included modules

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

### Deferred modules

- Clients
- Rollouts
- Maps
- Metrics
- AI Agent

Deferred modules remain part of the full MDU UI product, but they are intentionally excluded from this phase and should be defined in later screen-definition documents.

---

## 3. Core UX Rules

### 3.1 Navigation rule

```text
Sidebar = WHAT the user wants to do
Scope Breadcrumb Bar = WHERE the user is working
Workspace Tabs = HOW the user operates inside the selected scope
```

### 3.2 Scope rule

Every resource screen must resolve the selected hierarchy scope before loading data or enabling actions.

Required behavior:

```text
Open screen
-> Resolve selected scope from Scope Breadcrumb Bar
-> Load only authorized resources inside that scope
-> Render only authorized actions
-> Preserve scope across navigation
```

### 3.3 RBAC rule

The frontend must hide unauthorized modules and actions by default, but backend authorization remains mandatory.

Default UI behavior:

```text
Unauthorized module = hidden
Unauthorized action = hidden
Read-only permission = visible but non-editable
Backend 403 = contextual no-permission state
```

### 3.4 Topology rule

Topology is not a root sidebar module.

Correct path:

```text
Hierarchy -> Select Node -> Topology Tab
```

Device connectivity topology is allowed under:

```text
Devices -> Connectivity View
```

### 3.5 Billing rule

Billing screens must enforce parent-child scope isolation.

Key behaviors:

- Parent operator can manage plans for direct child customers/sub-operators.
- Customer/sub-operator can view only eligible parent-offered plans.
- Customer/sub-operator can have only one active subscription.
- Sibling billing plans and subscriptions must never be visible.

---

## 4. Screen Definition Template

Each screen definition follows this model:

| Field | Meaning |
| --- | --- |
| Screen ID | Unique screen identifier from `screen-inventory.md`. |
| Screen Name | Human-readable screen name. |
| Purpose | Why the screen exists. |
| Primary Actions | Main user actions supported by the screen. |
| Key Information / KPIs | Primary content, fields, counts, summaries, or operational information. |
| Hierarchy Dependency | Whether the screen depends on the selected scope from the Scope Breadcrumb Bar. |
| Linked Workflows | Workflow IDs supported by the screen. |
| RBAC Behavior | Which roles can view or act, and how restricted users are handled. |
| Required States | Loading, empty, error, no-permission, backend-unavailable, read-only, success, and confirmation states as applicable. |

---

## 5. Role Model Used in This Document

| Role | General UI Access |
| --- | --- |
| Root Operator | Platform/global access where product policy allows. |
| Operator Admin | Own operator subtree, child customers/sub-operators, scoped resources, billing plan management. |
| Customer Admin | Own customer/sub-operator subtree, own users/devices/configurations, available billing plans, own subscription. |
| NOC/Support | Monitoring, diagnostics, device visibility, connectivity troubleshooting where permitted. |
| Installer | Deployment, device assignment, limited map/topology/device actions where permitted. |
| Billing/Admin | Billing plan, subscription, and customer billing visibility according to assigned scope. |
| Read-only | View-only access to allowed resources; no create, edit, delete, assign, execute, or approve actions. |

---

## 6. Standard System States

| State | Required UX Behavior |
| --- | --- |
| Loading | Use skeletons or progress indicators. Preserve shell, sidebar, Top App Header, Scope Breadcrumb Bar, and current route. |
| Empty | Explain that no resources exist in the selected scope. Provide create action only if user has permission. |
| Error | Show contextual error message, retry action, and preserve current screen state. |
| No Permission | Show a permission-denied message without exposing unauthorized resource details. Avoid redirect loops. |
| Backend Unavailable | Show service-unavailable state with retry. Authentication shell may remain available. |
| Partial Data | Render available safe data and clearly mark missing sections. Never show unauthorized cached data. |
| Success | Confirm completion and navigate or refresh according to workflow. |
| Read-only | Show permitted data but disable or hide write actions. |
| Hidden Action | If user lacks permission, hide the action by default. |
| Disabled Action | Use only when action is unavailable because of state, dependency, or validation, not because of missing permission. |
| Confirmation Required | Sensitive/destructive actions require explicit review and confirmation. |

---

## 7. Global Shell and Cross-Cutting Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-SHELL-001 | Main App Shell | Provide the authenticated product shell: Top App Header, sidebar, Scope Breadcrumb Bar, main content area, and user/session controls. | Navigate modules; open global search; use notifications/help/user menu; switch working scope through Scope Breadcrumb Bar; preserve selected scope while changing modules. | Current user, active role, selected scope, visible modules, active route, session status, backend status. | Required for all authenticated screens. Scope must remain synchronized across Scope Breadcrumb Bar, hierarchy tree, route, and workspace. | All workflows | All authenticated users see shell after login. Sidebar modules and actions are filtered by role and scope. | Loading shell, bootstrap failed, backend unavailable, no permission module, mobile/collapsed sidebar, read-only visible modules. |
| SCR-SHELL-002 | Scope Breadcrumb Bar / Scope Selector | Show and control the current hierarchy working scope using a breadcrumb-style selector. | Open a scope level dropdown; search hierarchy; select operator/customer/sub-operator/site/building/floor/venue; switch recent scopes. | Current scope path, current scope badge, scope type, allowed hierarchy levels, permission indicator when useful, recently used scopes. | Critical. Controls resource scope for dashboard, hierarchy, devices, configurations, billing, users, and topology. | WF-HIERARCHY-001 | Only allowed subtree items are visible. Unauthorized siblings, parents, and unrelated scopes are not selectable. | Scope loading, no scope selected, scope unavailable, no permission, backend unavailable, scope changed, unsaved changes warning. |
| SCR-SHELL-003 | Top App Header | Provide global product controls that are independent from hierarchy scope. | Toggle sidebar; open global search; view notifications; open help; open user profile menu. | Product logo/name, global search input, notifications count, help access, user avatar/name/role, session/account menu. | Not hierarchy-resource scoped. It persists across authenticated screens and does not change selected scope directly. | Cross-cutting, WF-AUTH-003 | Visible to all authenticated users. Notification, help, and profile menu contents may be filtered by role. | Loading user session, notification error, search unavailable, logout processing, mobile compact header. |
| SCR-SHELL-004 | Global Search / Resource Search | Search across permitted customers, nodes, devices, configurations, billing plans, and users. | Search resources; open result; filter by resource type; jump to result or switch to result scope when needed. | Permitted results only, result type, hierarchy path, status, last updated where useful. | Search results must be scoped by user RBAC and allowed subtree. Some results may also change the Scope Breadcrumb Bar when opened. | Cross-cutting | No unauthorized resources in results. Read-only users may open permitted results but not act. | Loading, no results, no permission, backend unavailable, partial results. |
| SCR-SHELL-005 | User Profile Menu | Provide account actions and session controls. | Open profile; change password; logout; view role/scope summary. | User name, role/profile, active session, account status. | User-session scoped, not hierarchy-resource scoped. | WF-AUTH-003 | Available to all authenticated users. Admin-only profile controls hidden unless permitted. | Logout processing, session expired, OWSEC unavailable, success. |
| SCR-SHELL-006 | Permission Denied State | Show contextual 403/no-permission UI without breaking navigation. | Return to safe page; retry if permissions changed; switch scope if allowed. | Message, current scope, blocked action/screen label. | Appears in any scoped screen when backend denies access. | Cross-cutting | Must not reveal unauthorized resource details. | No permission, permission changed, safe fallback. |
| SCR-SHELL-007 | Backend Unavailable State | Show service unavailable for business/resource operations. | Retry; keep shell visible; logout if needed. | Service status, affected module, retry affordance. | Applies to screens that call MDU backend. | Cross-cutting | Auth shell may remain available. No stale business data unless explicitly marked and allowed. | Backend unavailable, retrying, recovered, persistent failure. |
| SCR-SHELL-008 | Empty State Template | Reusable empty state for scoped resources. | Show create action if permitted; explain empty state. | Resource type, selected scope, suggested next action. | Depends on current screen and selected scope. | Cross-cutting | Create action hidden when not permitted. | Empty, read-only empty, no scope selected. |
| SCR-SHELL-009 | Loading / Skeleton State | Reusable loading state for module data. | Indicate data loading while preserving layout stability. | Skeleton areas for tables, cards, tabs, topology, forms. | Depends on current screen. | Cross-cutting | No RBAC-specific content should flash before permission resolution. | Initial loading, refresh loading, tab loading. |
| SCR-SHELL-010 | Not Found State | Handle deleted or missing resources. | Return to list; switch scope; retry. | Missing resource label, selected scope, safe next action. | Resource and route scoped. | Cross-cutting | Must not distinguish between missing and unauthorized resource if that would leak data. | Not found, no permission equivalent, deleted resource. |
| SCR-SHELL-011 | Confirmation Dialog | Reusable confirmation for destructive/sensitive actions. | Review impact; confirm; cancel. | Action name, target resource, impact warning, dependency warning. | Appears inside scoped workflows. | Customer, Device, Billing, User, Admin | Only shown when user already has permission to perform action. Read-only users never see destructive confirmations. | Confirmation required, validation error, submitting, success, failure. |

---

## 8. Authentication Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-AUTH-001 | Login | Authenticate users directly through OWSEC before loading MDU backend bootstrap. | Enter credentials; submit login; recover password. | Login status, validation errors, account lock information when safe. | None before login. | WF-AUTH-001 | Public unauthenticated screen. After login, backend bootstrap determines role/scope/module visibility. | Loading, invalid credentials, account locked, OWSEC unavailable, bootstrap failed. |
| SCR-AUTH-002 | Forgot Password | Start OWSEC password recovery. | Enter email; request reset link. | Submitted email, safe success message. | None. | Auth support | Public unauthenticated screen. Do not reveal whether account exists. | Loading, success, invalid input, OWSEC unavailable. |
| SCR-AUTH-003 | Reset Password | Complete password reset through OWSEC. | Enter new password; confirm password; submit. | Password rules, token validity, success/error. | None. | Auth support | Public token-based screen. | Loading, token expired, weak password, success, OWSEC unavailable. |
| SCR-AUTH-004 | Change Password | Allow authenticated user or forced-reset user to change password. | Enter current/new password; submit. | Password policy, success/error, session status. | User-session scoped. | Auth support | Available to authenticated users; forced reset users may only access this flow until complete. | Loading, invalid current password, weak password, success. |
| SCR-AUTH-005 | Session Expired | Explain session expiry and return user to login. | Go to login; clear session. | Expiry reason if safe, login call-to-action. | User-session scoped. | WF-AUTH-002 | All users. | Session expired, redirecting, local cleanup failure. |
| SCR-AUTH-006 | Logout Processing | Clear session and synchronize logout across browser tabs. | Show logout progress; redirect to login. | Logout status. | User-session scoped. | WF-AUTH-003 | All authenticated users. | Processing, OWSEC logout failed but local cleanup succeeded, success. |
| SCR-AUTH-007 | Backend Bootstrap Failed | Handle case where OWSEC login succeeds but MDU backend bootstrap fails. | Retry bootstrap; logout; show limited shell if allowed. | Bootstrap service state, retry action. | No business scope until bootstrap succeeds. | WF-AUTH-001 | Authenticated but no resource permissions loaded yet. Do not show business data. | Backend unavailable, retrying, failed, logout. |

---

## 9. Dashboard Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-DASHBOARD-001 | Global Dashboard | Show root/operator-level operational overview after login when permitted. | View summaries; open alerts; navigate to customers/devices/billing. | Customer count, device count, health summary, recent alerts, billing summary if permitted. | Uses default operator/root scope after bootstrap. | WF-AUTH-001 | Root Operator and Operator Admin. Customer Admin may not see global version unless policy allows. | Loading, empty summary, partial data, no permission, backend unavailable. |
| SCR-DASHBOARD-002 | Scoped Dashboard | Show dashboard for selected customer/site/node scope. | Switch scope; review health; open scoped modules. | Scoped device count, health, alerts, subscription status when permitted. | Required. Uses Scope Breadcrumb Bar selected scope. | WF-HIERARCHY-001 | Visible to users with dashboard access in selected scope. Billing cards hidden if not permitted. | Loading, empty scope, no permission, backend unavailable, partial data. |
| SCR-DASHBOARD-003 | Health Summary Panel | Summarize operational health for the current dashboard scope. | Open related device/hierarchy detail; filter health categories. | Online/offline devices, service health, warning/error counts. | Scoped by dashboard context. | Device | Visible to roles with operational monitoring access. Detail links follow RBAC. | Loading, no data, partial data, error. |
| SCR-DASHBOARD-004 | Recent Alerts Panel | Show recent operational alerts inside selected scope. | Open alert target; filter severity; acknowledge if permitted. | Alert severity, timestamp, affected resource, scope. | Scoped by dashboard context. | Cross-cutting | View depends on monitoring permission. Acknowledge action hidden if unauthorized. | Loading, no alerts, error, backend unavailable. |
| SCR-DASHBOARD-005 | Billing Summary Panel | Show subscription or billing summary when permitted. | Open billing overview; view subscription state. | Current plan, subscription state, renewal, device usage or connected-device billing summary. | Scoped by customer/sub-operator billing context. | WF-BILLING-004 | Visible to Operator Admin/Billing Admin/Customer Admin only when billing permission exists. | Loading, no active subscription, no permission, backend unavailable. |

---

## 10. Customers / Sub-Operators Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-CUSTOMER-001 | Customer List | List permitted customers/sub-operators for tenant management. | Search; filter; select customer; create customer if permitted. | Customer name, status, parent scope, subscription summary, health summary. | Scoped to operator/customer subtree. | WF-CUSTOMER-002 | Root/Operator Admin see permitted child customers. Customer Admin sees children only if allowed. Create hidden if unauthorized. | Loading, empty, no permission, backend unavailable. |
| SCR-CUSTOMER-002 | Create Customer | Create child customer/sub-operator and first admin user. | Enter customer details; enter first admin; optionally assign billing; submit. | Customer identity, admin user, parent scope, billing plan if selected. | Required. Parent scope must be resolved before create. | WF-CUSTOMER-001 | Operator Admin or authorized Customer/Sub-Operator Admin only. Read-only/NOC/Installer hidden. | Loading, validation error, duplicate, permission denied, orchestration failure, success. |
| SCR-CUSTOMER-003 | Customer Detail | View customer profile, status, scope, and summary. | Edit; suspend/delete if permitted; open workspace/tabs. | Customer metadata, status, parent path, health, billing, user count. | Customer resource scoped. | WF-CUSTOMER-002 | Visible only for customers in allowed subtree. Sensitive actions hidden by RBAC. | Loading, not found, no permission, backend unavailable, partial data. |
| SCR-CUSTOMER-004 | Edit Customer | Edit customer/sub-operator metadata. | Update name/contact/status fields; save. | Editable metadata, validation status. | Customer resource scoped. | Customer management | Operator/Customer Admin with edit permission. No role/policy internals shown. | Loading, validation error, no permission, success, backend unavailable. |
| SCR-CUSTOMER-005 | Suspend Customer Confirmation | Confirm customer suspension with impact warning. | Review impact; confirm suspend; cancel. | Affected customer, active users/devices/subscription warning. | Customer resource scoped. | WF-CUSTOMER-003 | Only users with suspend permission see this modal. | Confirmation required, dependency warning, submitting, error, success. |
| SCR-CUSTOMER-006 | Delete Customer Confirmation | Confirm destructive customer deletion with dependency warning. | Review dependencies; confirm delete; cancel. | Child nodes, users, devices, subscriptions, deletion impact. | Customer resource scoped. | WF-CUSTOMER-003 | Only authorized users. Delete may be disabled by active dependencies. | Confirmation required, dependency blocking, submitting, permission denied, success. |
| SCR-CUSTOMER-007 | Customer Workspace | Provide customer-level contextual workspace. | Switch tabs; view overview/billing/users/health. | Customer health, devices, users, subscription, hierarchy summary. | Customer scope required. | WF-CUSTOMER-002 | Tabs filtered by role and enabled capabilities. | Loading, empty, no permission, partial data, backend unavailable. |
| SCR-CUSTOMER-008 | Customer Billing Tab | View or assign billing plan for customer when permitted. | View current plan; assign plan; open subscription detail. | Plan name, type, status, eligibility, active subscription. | Customer billing scope required. | WF-BILLING-002, WF-BILLING-004 | Operator/Billing Admin can assign to direct child. Customer Admin cannot modify parent-created plans. | Loading, no active subscription, no available plan, no permission, conflict. |
| SCR-CUSTOMER-009 | Customer Users Tab | View users inside customer scope. | List users; create user if permitted; open user detail. | User count, roles/profiles, status, scope summary. | Customer scope required. | WF-USER-001, WF-USER-002, WF-USER-003 | Only users inside permitted subtree. Create/edit hidden if unauthorized. | Loading, empty, no permission, backend unavailable. |
| SCR-CUSTOMER-010 | Customer Health Summary | Show operational summary for a customer. | Open related devices/hierarchy/billing where permitted. | Health score, device status, alerts, subscription status when allowed. | Customer scope required. | WF-CUSTOMER-002 | Health visible to operational roles. Billing parts hidden if not allowed. | Loading, partial data, no permission, backend unavailable. |

---

## 11. Hierarchy Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-HIERARCHY-001 | Hierarchy Module | Entry screen for recursive subtree navigation. | Open tree; select node; create node if permitted. | Allowed hierarchy roots, selected node, node counts. | Required. Uses allowed subtree roots and selected scope. | WF-HIERARCHY-002 | All roles with hierarchy access see only allowed subtree. Create hidden if unauthorized. | Loading, empty hierarchy, no permission, backend unavailable. |
| SCR-HIERARCHY-002 | Hierarchy Tree | Expand and select customers, sites, buildings, towers, floors, and venues. | Expand/collapse; select node; search tree. | Node name, type, status, child count, selected state. | Critical. Must synchronize with Scope Breadcrumb Bar | WF-HIERARCHY-001, WF-HIERARCHY-002 | Tree only contains allowed nodes. Unauthorized siblings hidden. | Loading nodes, empty children, node unavailable, no permission. |
| SCR-HIERARCHY-003 | Node Workspace Shell | Contextual workspace for selected hierarchy node. | Switch workspace tabs; view overview/topology/devices/configurations. | Selected node, node type, health, tabs, allowed actions. | Required. All tabs depend on selected node. | WF-HIERARCHY-003 | Tabs/actions returned or filtered by RBAC, node type, capabilities. | Loading, no compatible tabs, no permission, backend unavailable, partial data. |
| SCR-HIERARCHY-004 | Node Overview Tab | Summarize selected node health, counts, and status. | Open related tab; view children/resources. | Device counts, child nodes, health, status, recent activity. | Selected node required. | WF-HIERARCHY-003 | View depends on node access. Actions hidden by permission. | Loading, empty node, partial data, no permission. |
| SCR-HIERARCHY-005 | Node Topology Tab | Show contextual topology for selected hierarchy node. | Open topology; switch overlays; inspect device; zoom/pan if applicable. | Topology type, devices, overlays, health, wireless quality where available. | Selected node required. Topology varies by site/building/tower/floor/venue. | WF-TOPOLOGY-001 | Only authorized resources and overlays appear. Topology tab hidden if user lacks access. | Loading, no map/topology, partial data, error, no permission, backend unavailable. |
| SCR-HIERARCHY-006 | Node Devices Tab | List infrastructure devices inside selected node scope. | Filter devices; open device detail; add/assign if permitted. | Gateway/switch/AP counts, status, assignment, firmware. | Selected node required. | WF-DEVICE-001 | Devices outside allowed subtree hidden. Create/assign actions hidden by permission. | Loading, empty devices, no permission, backend unavailable. |
| SCR-HIERARCHY-007 | Node Configurations Tab | Show configurations assigned or effective for selected node. | View assigned configs; assign config; preview effective config. | Config set, version, assignment target, effective status. | Selected node required. | WF-CONFIG-003, WF-CONFIG-004 | Visible to config-capable roles. Assign hidden for read-only/unauthorized users. | Loading, empty, validation/error, no permission. |
| SCR-HIERARCHY-008 | Create Node | Create site/building/tower/floor/venue under selected scope. | Select node type; enter details; save. | Parent node, node type, name, metadata. | Parent scope required. | WF-HIERARCHY-004 | Operator/Customer Admin with hierarchy create permission. Node type options may vary by policy. | Loading, validation error, duplicate, no permission, success. |
| SCR-HIERARCHY-009 | Edit Node | Edit selected node details. | Update metadata; save. | Node name, type, metadata, status. | Selected node required. | WF-HIERARCHY-005 | Edit hidden unless permitted. | Loading, validation error, no permission, success. |
| SCR-HIERARCHY-010 | Move Node | Move node to a new permitted parent scope. | Choose new parent; validate impact; save. | Current parent, new parent, affected descendants. | Selected node and allowed target parent required. | WF-HIERARCHY-006 | Only permitted target parents visible. Cannot move outside allowed subtree. | Loading, invalid parent, dependency conflict, no permission, success. |
| SCR-HIERARCHY-011 | Delete Node Confirmation | Confirm delete with impact/dependency warning. | Review impact; confirm delete; cancel. | Child nodes, devices, configs, topology/map dependencies. | Selected node required. | WF-HIERARCHY-007 | Only authorized destructive users. Delete may be blocked by dependencies. | Confirmation required, dependency warning, submitting, no permission, success. |
| SCR-HIERARCHY-012 | Empty Hierarchy State | Show when selected scope has no child nodes. | Create node if permitted; switch scope. | Selected scope and resource type. | Selected scope required. | WF-HIERARCHY-002 | Create call-to-action shown only if permitted. | Empty, read-only empty, no permission. |

---

## 12. Devices Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-DEVICE-001 | Device Inventory | List infrastructure devices inside selected scope. | Filter/search; open detail; add/assign/move if permitted. | Device type, serial, status, node/venue assignment, firmware. | Selected scope required. | WF-DEVICE-001 | Only permitted devices in subtree. Clients are excluded from Devices. | Loading, empty, no permission, backend unavailable. |
| SCR-DEVICE-002 | Gateways List | Filtered list of gateway infrastructure devices. | Filter; open gateway detail; run allowed actions. | Gateway status, uplink, assignment, firmware. | Selected scope required. | WF-DEVICE-001 | Visible if Devices module and gateway view permitted. | Loading, empty, no permission, backend unavailable. |
| SCR-DEVICE-003 | Switches List | Filtered list of switch infrastructure devices. | Filter; open switch detail; run allowed actions. | Switch status, uplinks, ports, firmware, assignment. | Selected scope required. | WF-DEVICE-001 | Visible if Devices module and switch view permitted. | Loading, empty, no permission, backend unavailable. |
| SCR-DEVICE-004 | Access Points List | Filtered list of access point infrastructure devices. | Filter; open AP detail; run allowed actions. | AP status, clients count if permitted, channel/health, firmware. | Selected scope required. | WF-DEVICE-001 | Visible if Devices module and AP view permitted. | Loading, empty, no permission, backend unavailable. |
| SCR-DEVICE-005 | Device Detail | View device identity, status, assignment, and operational summary. | View diagnostics; run action; move/assign; open connectivity view. | Serial, type, model, status, assignment, firmware, health, last seen. | Device must belong to allowed selected/accessible scope. | WF-DEVICE-001 | NOC/Customer Admin/Installer access depends on permission. Dangerous actions hidden unless permitted. | Loading, not found, offline, no permission, backend unavailable, partial data. |
| SCR-DEVICE-006 | Device Diagnostics | View logs, status, uplink, errors, and troubleshooting data. | Inspect logs/metrics; retry load; open related topology. | Status, logs, uplink state, errors, diagnostics summary. | Device scope required. | WF-DEVICE-002 | Diagnostic depth depends on role. Read-only users see summary only. | Loading, logs unavailable, metrics unavailable, no permission, partial data. |
| SCR-DEVICE-007 | Device Action Confirmation | Confirm reboot, upgrade, blink, or factory reset. | Review action; confirm; cancel; track result. | Device identity, action impact, risk level. | Device scope required. | WF-DEVICE-003 | Only shown when action permission exists. Factory reset is highest-risk and requires strong warning. | Confirmation required, device offline, unsupported action, submitting, failed, success. |
| SCR-DEVICE-008 | Add Device | Add infrastructure device by serial and type. | Enter serial; select type; save. | Serial, device type, initial status, target scope. | Selected scope required. | WF-DEVICE-004 | Operator/Customer Admin/Installer if permitted. Serial uniqueness enforced by backend. | Loading, duplicate serial, invalid type, no permission, success. |
| SCR-DEVICE-009 | Assign Device | Assign device to node/venue/floor. | Select target; validate compatibility; save. | Device, allowed target nodes/venues, current assignment. | Selected scope and target scope required. | WF-DEVICE-005 | Targets outside allowed subtree never shown. | Loading, invalid target, compatibility error, no permission, success. |
| SCR-DEVICE-010 | Move Device | Move device to another permitted node/venue. | Choose new scope; validate; save. | Current assignment, new assignment, impact warning. | Device and target scope required. | WF-DEVICE-006 | Can move only within allowed subtree and compatible scope. | Loading, invalid target, no permission, success. |
| SCR-DEVICE-011 | Firmware Management | View firmware state and upgrade eligibility. | View version; start upgrade if permitted. | Current version, available version, eligibility, upgrade status. | Selected scope/device required. | WF-DEVICE-003 | Upgrade hidden unless permitted. Read-only users view version only. | Loading, no update, incompatible, no permission, upgrade queued/success/failure. |
| SCR-DEVICE-012 | Device Assignments | Manage assignment history and current scope. | View history; assign/move if permitted. | Current scope, previous assignments, timestamps. | Device scope required. | WF-DEVICE-005, WF-DEVICE-006 | Assignment actions hidden unless permitted. | Loading, empty history, no permission, error. |
| SCR-DEVICE-013 | Connectivity View | Engineering topology for gateways, switches, AP uplinks, mesh links, and port relationships. | Inspect device/link; filter graph; open device detail. | Gateways, switches, AP uplinks, mesh links, WAN, port/link state. | Selected subtree or device group scope required. | WF-TOPOLOGY-002 | NOC/engineering/Customer Admin where permitted. Only authorized devices/links appear. | Loading graph, empty graph, partial link data, no permission, backend unavailable. |
| SCR-DEVICE-014 | Device Empty Inventory State | Show when no infrastructure devices exist in selected scope. | Add device if permitted; switch scope. | Selected scope and device type. | Selected scope required. | WF-DEVICE-001 | Add device CTA shown only if user has create permission. | Empty, read-only empty, no permission. |

---

## 13. Configuration Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-CONFIG-001 | Configuration List | List configuration sets inside selected scope. | Search/filter; create; open detail. | Config name, version, status, assignment count, last updated. | Selected scope required. | WF-CONFIG-001, WF-CONFIG-002 | Only configurations in allowed scope. Create/edit hidden if unauthorized. | Loading, empty, no permission, backend unavailable. |
| SCR-CONFIG-002 | Create Configuration | Create a configuration set after resolving current scope. | Enter settings; validate; save. | Config name, settings, target scope, validation status. | Selected scope required. | WF-CONFIG-001 | Operator/Customer Admin with config create permission. | Loading, validation error, duplicate name, no permission, success. |
| SCR-CONFIG-003 | Edit Configuration | Edit configuration settings. | Modify settings; validate; save version. | Editable settings, version, validation results. | Config resource scoped. | WF-CONFIG-002 | Edit hidden unless permitted. Read-only users view detail only. | Loading, validation error, no permission, conflict, success. |
| SCR-CONFIG-004 | Configuration Detail | View configuration summary, status, and assignments. | Open version history; assign; preview effective configuration. | Config version, status, assignments, last modified. | Config resource scoped. | WF-CONFIG-002, WF-CONFIG-003 | Visible only inside allowed scope. Assignment action hidden unless permitted. | Loading, not found, no permission, partial data. |
| SCR-CONFIG-005 | Configuration Version History | View previous versions and change history. | Compare versions; open version detail. | Version number, author, timestamp, change summary. | Config resource scoped. | WF-CONFIG-002 | View depends on config permission. Rollback is deferred unless rollout module is in scope later. | Loading, empty history, no permission, error. |
| SCR-CONFIG-006 | Assign Configuration | Assign configuration to permitted nodes/devices. | Select targets; validate; assign. | Target nodes/devices, compatibility, existing assignments. | Selected config and target scopes required. | WF-CONFIG-003 | Targets outside allowed subtree hidden. Assign hidden for read-only. | Loading targets, no eligible targets, validation error, no permission, success. |
| SCR-CONFIG-007 | Effective Configuration Preview | Preview effective configuration for selected node/device and overrides. | Select target; compare inherited/assigned overrides. | Effective values, override source, conflict indicators. | Selected node/device scope required. | WF-CONFIG-004 | Visible to roles with config view access. Sensitive values masked if required by policy. | Loading, no config, partial data, conflict/error, no permission. |
| SCR-CONFIG-008 | Configuration Validation Errors | Show invalid settings or assignment conflicts. | Review errors; jump to affected field; retry validation. | Error code, field, reason, suggested fix. | Config or assignment context required. | WF-CONFIG-001, WF-CONFIG-002 | Visible only to users editing/validating permitted configs. | Validation error, backend validation unavailable, resolved state. |

---

## 14. Topology Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-TOPOLOGY-001 | Contextual Venue Topology | Default topology view inside selected hierarchy workspace. | View topology; toggle overlays; select device; zoom/pan. | Map/canvas, device placements, health overlays, wireless quality overlays where available. | Selected hierarchy node required. | WF-TOPOLOGY-001 | Only authorized resources appear. Clients only appear as permitted overlays/counts, not default graph nodes. | Loading, no topology/map, partial data, no permission, backend unavailable. |
| SCR-TOPOLOGY-002 | Site-Level Topology | Show building summaries and aggregate health. | Inspect building summary; open child node. | Building summaries, aggregate health, deployment overview. | Selected site required. | WF-TOPOLOGY-001 | Only buildings/resources in allowed subtree. | Loading, empty site, partial data, no permission. |
| SCR-TOPOLOGY-003 | Building-Level Topology | Show floor structure, AP density, and distribution summary. | Open floor; view AP density; inspect devices. | Floors, AP density, distribution switches, health summary. | Selected building required. | WF-TOPOLOGY-001 | Only authorized floors/devices visible. | Loading, no floors, partial data, no permission. |
| SCR-TOPOLOGY-004 | Tower-Level Topology | Show floor relationships and tower-level health. | Open floor; inspect tower health. | Floor relationships, AP distribution, aggregation health. | Selected tower required. | WF-TOPOLOGY-001 | Only authorized floors/devices visible. | Loading, empty tower, partial data, no permission. |
| SCR-TOPOLOGY-005 | Floor-Level Topology | Show AP placement and wireless overlays for a floor. | Zoom/pan; toggle AP/switch/gateway/quality overlays; select device. | Floor map, AP placement, wireless overlays, client density if permitted. | Selected floor required. | WF-TOPOLOGY-001 | Only permitted devices and overlays. Client details hidden unless later client module permits. | Loading, no floor map, placement missing, partial data, no permission. |
| SCR-TOPOLOGY-006 | Venue-Level Topology | Show detailed overlays, AP behavior, and coverage visualization. | Inspect APs; view coverage; switch overlays. | AP behavior, coverage visualization, operational health, device relationships. | Selected venue required. | WF-TOPOLOGY-001 | Venue data only within allowed subtree. | Loading, no topology data, partial data, no permission. |
| SCR-TOPOLOGY-007 | Topology Overlay Controls | Toggle topology layers and display modes. | Turn overlays on/off; select health/wireless/device layers. | Available overlays, active overlays, layer status. | Selected topology context required. | WF-TOPOLOGY-001 | Unauthorized overlays hidden. Missing-data overlays disabled with explanation. | Loading overlays, overlay unavailable, disabled, no permission. |
| SCR-TOPOLOGY-008 | Topology Device Detail Drawer | Inspect selected device from topology. | View device summary; open full detail; run allowed action. | Device identity, status, assignment, health, selected coordinates if available. | Selected device inside topology scope required. | WF-TOPOLOGY-001, WF-DEVICE-001 | Shows only authorized device data. Actions hidden unless permitted. | Loading, no permission, device offline, not found. |

---

## 15. Billing Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-BILLING-001 | Billing Overview | Show billing status, plan summary, and actions for selected scope. | Open plans, available plans, current subscription, child subscriptions. | Current plan, subscription state, plan count, billing warnings. | Customer/sub-operator or operator billing scope required. | WF-BILLING-004 | Operator/Billing Admin see management views; Customer Admin sees own subscription/available plans. | Loading, no subscription, no permission, backend unavailable, partial data. |
| SCR-BILLING-002 | Billing Plan List | List plans the user can manage or view. | Search/filter; create plan; open detail; activate/deactivate. | Plan name, type, status, cycle, price, limits. | Operator billing scope required for management list. | WF-BILLING-001 | Parent operators manage own plans. Children cannot modify parent-created plans. | Loading, empty plans, no permission, backend unavailable. |
| SCR-BILLING-003 | Create Billing Plan | Create connection-based or fixed-device plan. | Select plan type; enter features, limits, pricing, status; save. | Plan type, device limits, billing cycle, price, connection-based charge. | Operator/parent billing scope required. | WF-BILLING-001 | Operator Admin/Billing Admin only where create permission exists. | Loading, validation error, duplicate, no permission, success. |
| SCR-BILLING-004 | Edit Billing Plan | Edit allowed billing plan fields. | Update details; activate/deactivate via confirmation. | Plan fields, status, eligibility, assignment impact. | Plan owner scope required. | WF-BILLING-001 | Only plan owner/authorized parent operator can edit. Child customers cannot edit. | Loading, validation error, no permission, conflict, success. |
| SCR-BILLING-005 | Billing Plan Detail | View plan details, status, features, pricing, and limits. | Edit if permitted; assign to customer; activate/deactivate. | Plan type, status, features, limits, billing cycle, price. | Plan scope required. | WF-BILLING-001 | View/manage depends on plan ownership and scope. Private parent plans hidden from children. | Loading, not found, no permission, backend unavailable. |
| SCR-BILLING-006 | Activate / Deactivate Plan Confirmation | Confirm plan status change. | Review impact; confirm; cancel. | Affected plan, child assignments, subscription impact. | Plan owner scope required. | WF-BILLING-001 | Only authorized plan managers. | Confirmation required, dependency warning, no permission, submitting, success. |
| SCR-BILLING-007 | Assign Plan to Customer | Assign eligible plan to a direct child customer/sub-operator. | Select direct child; select active plan; confirm. | Eligible plans, child customer, plan type, price, limits. | Parent operator scope and direct child customer scope required. | WF-BILLING-002 | Can assign only to direct child customers/sub-operators within allowed subtree. | Loading, no eligible plans, customer outside scope, inactive plan, no permission, success. |
| SCR-BILLING-008 | Available Plans | Allow customer/sub-operator to view parent-offered active plans. | Review plans; select eligible plan; open confirmation. | Plan cards, type, price, limits, active eligibility. | Current customer/sub-operator scope required. | WF-BILLING-003 | Customer Admin sees only eligible active parent-offered plans. Operator private/sibling plans hidden. | Loading, no available plans, no permission, backend unavailable. |
| SCR-BILLING-009 | Select Plan Confirmation | Confirm selected plan and check existing active subscription. | Review selected plan; confirm subscription; cancel. | Selected plan, current subscription if any, billing effect. | Customer/sub-operator scope required. | WF-BILLING-003 | Customer Admin with subscription select permission. Existing active subscription requires conflict handling. | Confirmation required, conflict, inactive plan, no permission, submitting, success. |
| SCR-BILLING-010 | Replace Existing Plan Confirmation | Confirm replace-or-reject behavior for existing active subscription. | Review current and new plan; confirm replacement if allowed. | Current plan, new plan, effective date, impact. | Customer/sub-operator scope required. | WF-BILLING-003 | Only shown if product allows replacement. Otherwise show conflict state. | Confirmation required, 409 conflict, no permission, success. |
| SCR-BILLING-011 | Current Subscription Detail | View current subscription, state, plan type, limits, and renewal. | View plan; open available plans; view usage details. | Subscription state, plan, renewal, limits, connection/fixed-device details. | Customer/sub-operator or permitted child scope required. | WF-BILLING-004 | Customer sees own subscription. Operator/Billing Admin sees permitted child subscriptions. | Loading, no active subscription, suspended/expired, no permission, backend unavailable. |
| SCR-BILLING-012 | Subscription Visibility Dashboard | Allow operator to view permitted child subscriptions. | Filter by child customer; open subscription detail. | Child customer, plan, status, renewal, usage alerts. | Operator/parent scope required. | WF-BILLING-004 | Only permitted child scopes. Sibling/unrelated subscriptions hidden. | Loading, empty, no permission, partial data. |
| SCR-BILLING-013 | Connection-Based Billing Detail | Show connected-device billing details. | Review connected-device usage; open subscription. | Connected device count, price per connected device, billing cycle. | Subscription scope required. | WF-BILLING-004 | Visible only for connection-based plans and billing-authorized roles. | Loading, no data, no permission, backend unavailable. |
| SCR-BILLING-014 | Fixed-Device Billing Detail | Show fixed-device limits and usage. | Review device allowance; inspect limit warning. | Device limit, used count, remaining allowance, billing cycle. | Subscription scope required. | WF-BILLING-004 | Visible only for fixed-device plans and billing-authorized roles. | Loading, limit exceeded, no permission, backend unavailable. |
| SCR-BILLING-015 | No Available Plans State | Show when customer has no eligible plans. | Return to billing overview; contact parent/operator if applicable. | Selected customer scope and empty plan state. | Customer/sub-operator scope required. | WF-BILLING-003 | No create/edit actions for child customer. Parent operator management link hidden unless role permits. | Empty, no permission equivalent, backend unavailable. |
| SCR-BILLING-016 | No Active Subscription State | Show when no subscription exists. | Open available plans if permitted. | Selected scope, subscription absence. | Customer/sub-operator scope required. | WF-BILLING-004 | Select plan CTA only if eligible and permitted. | Empty, no permission, backend unavailable. |
| SCR-BILLING-017 | Billing Conflict State | Show single-active-plan conflict or 409 error. | Review conflict; return to subscription; choose replace flow if allowed. | Existing subscription, attempted plan, conflict reason. | Customer/sub-operator scope required. | WF-BILLING-003 | Do not expose unauthorized subscription details. Only own/current conflict shown. | 409 conflict, no permission, backend unavailable. |

---

## 16. Users Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-USER-001 | User List | List users inside selected or permitted scope. | Search/filter; create user; open detail. | User name, email, role/profile, status, scope. | Selected customer/subtree scope required. | WF-USER-001 | Only users in permitted scope. Create hidden unless permitted. | Loading, empty, no permission, backend unavailable. |
| SCR-USER-002 | Create User | Create user and assign role/profile/scope. | Enter user details; select role/profile; select scope; save. | Email, name, role/profile, assigned scope. | Current scope and assignable child scopes required. | WF-USER-001 | Actor cannot grant permissions higher than allowed authority. Assignable roles filtered. | Loading, duplicate email, invalid role, scope not allowed, no permission, success. |
| SCR-USER-003 | User Detail | View user profile, status, roles, and scope. | Edit; assign role; reset password; suspend if permitted. | Profile, status, roles/profiles, scope assignments, sessions. | User resource must be inside permitted subtree. | WF-USER-001, WF-USER-002, WF-USER-003 | Cannot view users outside scope. Higher-authority users may be restricted by policy. | Loading, not found, no permission, backend unavailable. |
| SCR-USER-004 | Edit User | Edit user details where permitted. | Update profile fields; save. | Editable user metadata, status. | User resource scoped. | WF-USER-001 | Edit hidden unless permitted. Cannot elevate authority through edit. | Loading, validation error, no permission, success. |
| SCR-USER-005 | Assign Role/Profile | Assign permission profile within allowed authority. | Select role/profile; select scope; save. | Available profiles, scope summary, impact warning. | User and target scope required. | WF-USER-001 | Assignable profiles filtered by actor authority. Backend enforces OWPROV policy. | Loading, invalid assignment, no permission, success. |
| SCR-USER-006 | Reset Password Confirmation | Trigger OWSEC password reset flow. | Confirm reset; send reset. | Target user, email, reset status. | User resource scoped. | WF-USER-002 | Only allowed for users inside permitted scope. | Confirmation required, OWSEC unavailable, no permission, success. |
| SCR-USER-007 | Suspend User Confirmation | Suspend user and optionally revoke active sessions. | Review impact; confirm suspend; cancel. | Target user, role, active sessions, impact. | User resource scoped. | WF-USER-003 | Cannot suspend users outside scope or higher authority unless explicitly allowed. | Confirmation required, no permission, session revocation failure, success. |
| SCR-USER-008 | User Sessions | View and manage active sessions when permitted. | View sessions; revoke session if allowed. | Session device/browser, last active, status. | User resource scoped. | WF-USER-003 | Session management permission required. Read-only may view summary only. | Loading, no sessions, no permission, backend unavailable. |
| SCR-USER-009 | User Scope Assignment Summary | Show assigned customer/subtree/node scope. | Inspect assigned scopes; open hierarchy if permitted. | Scope path, role/profile, inherited permissions summary. | User resource scoped. | WF-USER-001 | Do not expose unauthorized hierarchy details. | Loading, no scope, no permission, partial data. |

---

## 17. Administration Screen Definitions

| Screen ID | Screen Name | Purpose | Primary Actions | Key Information / KPIs | Hierarchy Dependency | Linked Workflows | RBAC Behavior | Required States |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-ADMIN-001 | Administration Overview | Entry point for platform/operator administration. | Open settings, roles/policies, audit logs, debug views if permitted. | Available admin sections, system status, permission level. | Platform/operator scope depending on role. | WF-ADMIN-001 | Root Operator broadest access. Operator Admin limited by policy. Others usually hidden. | Loading, no permission, backend unavailable. |
| SCR-ADMIN-002 | Platform Settings | Manage global settings when permitted. | View/edit settings; save. | Setting name, value, scope, last updated. | Platform scope. | WF-ADMIN-001 | Root Operator or explicit platform admin only. | Loading, validation error, no permission, success. |
| SCR-ADMIN-003 | Operator Administration | Manage operator-level settings and child operator context. | View operator settings; edit permitted values. | Operator identity, status, settings, child context. | Operator scope required. | WF-ADMIN-001 | Operator Admin sees own operator scope only. Root sees permitted operators. | Loading, no permission, partial data, backend unavailable. |
| SCR-ADMIN-004 | Roles and Policies | View and manage role/policy profiles without exposing raw OWPROV complexity. | View profiles; edit allowed profile; inspect impact. | Role/profile names, permissions summary, scope rules. | Platform/operator scope depending on authority. | WF-ADMIN-001 | Root/Operator Admin only. Users cannot grant permissions outside their authority. | Loading, empty, no permission, backend unavailable, impact warning. |
| SCR-ADMIN-005 | Edit Role / Policy | Edit permitted role or policy settings. | Modify profile; validate; save. | Permissions summary, affected users/scopes, impact warning. | Admin scope required. | WF-ADMIN-001 | Restricted to authorized admins. Prevent breaking required admin access. | Loading, validation error, impact warning, no permission, success. |
| SCR-ADMIN-006 | Audit Logs | View permitted audit events. | Filter by user/action/resource/scope/date; open event detail. | Timestamp, actor, action, resource, scope, result. | Platform/operator/subtree scope depending on role. | WF-ADMIN-002 | Audit logs are scoped. No events from unauthorized subtrees. | Loading, empty logs, no permission, backend unavailable. |
| SCR-ADMIN-007 | Audit Event Detail | Inspect selected audit event. | View event metadata; return to log list. | Actor, action, resource, scope, before/after summary if permitted. | Audit event scope required. | WF-ADMIN-002 | Sensitive fields masked if not permitted. | Loading, not found, no permission, partial data. |
| SCR-ADMIN-008 | Advanced / Debug Views | Internal troubleshooting views for permitted admins. | Open debug details; inspect internal mappings when explicitly allowed. | Entity/venue mapping summaries, backend status, troubleshooting metadata. | Admin/debug scope required. | Admin support | Only advanced/internal admins. Normal users should not see raw OWPROV internals. | Loading, no permission, backend unavailable. |
| SCR-ADMIN-009 | Permission Change Impact Warning | Warn before sensitive RBAC changes. | Review affected users/scopes; confirm/cancel. | Affected roles, users, scopes, risk warning. | Admin scope required. | WF-ADMIN-001 | Only displayed during authorized role/policy changes. | Confirmation required, validation failure, no permission, success. |

---


## 18. High-Priority Detailed Definitions

The following screens require extra care in wireframes and prototype behavior because they carry the highest UX and RBAC risk.

### 18.1 SCR-SHELL-001 - Main App Shell

Purpose:

```text
Provide a stable authenticated shell while all modules, routes, hierarchy scope, and RBAC visibility change underneath it.
```

Required behavior:

- Top App Header must remain visible on authenticated screens.
- Sidebar must show only authorized in-scope modules.
- Scope Breadcrumb Bar must show and control the selected working scope.
- Main content must not render protected data until bootstrap and permission resolution complete.
- Mobile shell must collapse sidebar into drawer and keep the Scope Breadcrumb Bar or compact scope selector available.
- Route changes must not accidentally reset the selected scope.

Required states:

- Initial bootstrap loading
- Backend bootstrap failed
- Backend unavailable
- No modules available
- Scope changed
- Session expired
- Read-only module visibility

---

### 18.2 SCR-SHELL-002 - Scope Breadcrumb Bar / Scope Selector

Purpose:

```text
Control WHERE the user is working across all scoped modules.
```

Required behavior:

- Must display scope as:
  ```text
  Operator > Customer > Sub-Operator > Site > Building > Floor > Venue
  ```
- Must support recursive variable-depth hierarchy.
- Each scope level may open a dropdown selector for switching to another permitted item at that level.
- Must show only allowed subtree items.
- Must synchronize with hierarchy tree, route context, and workspace.
- When scope changes, all scoped module data must refresh.
- Unsafe forms should warn before discarding unsaved changes during scope switch.
- It replaces the old separate `Scope Breadcrumb Bar` and `Scope Breadcrumb Bar` model.

Required states:

- Scope loading
- No scope selected
- Scope search active
- Scope unavailable
- No permission for selected scope
- Backend unavailable
- Mobile compact selector

---

### 18.3 SCR-SHELL-003 - Top App Header

Purpose:

```text
Provide global product controls that are independent from hierarchy scope.
```

Required behavior:

- Must contain:
  ```text
  Logo / product identity
  Sidebar toggle
  Global search
  Notifications
  Help
  User profile menu
  ```
- Must not be used to change selected hierarchy scope.
- Global search can jump to resources, but actual working-scope changes must be reflected through the Scope Breadcrumb Bar.
- User menu provides profile, change password, role/scope summary, and logout.
- Mobile version may collapse global actions into icons or menu.

Required states:

- User/session loading
- Search unavailable
- Notifications unavailable
- Logout processing
- Session expired
- Mobile compact header

---

### 18.4 SCR-HIERARCHY-003 - Node Workspace Shell

Purpose:

```text
Provide contextual operations for the selected hierarchy node.
```

Required behavior:

- Workspace tabs adapt to node type, RBAC, capabilities, and available data.
- Unauthorized tabs are hidden.
- Missing-data tabs may be disabled with explanation.
- Selected node must remain clear at all times.

Required tab model for this phase:

- Overview
- Topology
- Devices
- Configurations

Deferred tabs:

- Clients
- Maps
- Metrics
- AI Insights

---

### 18.5 SCR-HIERARCHY-005 - Node Topology Tab

Purpose:

```text
Show contextual topology for the selected hierarchy node without making topology a root navigation module.
```

Required behavior:

- Site, building, tower, floor, and venue levels should render different topology summaries.
- Device overlays must include only authorized infrastructure devices.
- Client overlays are deferred unless represented only as non-identifying aggregate counts.
- Device details open in a drawer or link to Device Detail if permitted.

Required states:

- No topology available
- No map available where map is required
- Partial topology data
- Overlay unavailable
- Backend unavailable
- No permission

---

### 18.6 SCR-DEVICE-005 - Device Detail

Purpose:

```text
Provide the canonical operational detail page for an infrastructure device.
```

Required behavior:

- Show device identity, assignment, status, firmware, and health.
- Diagnostic depth depends on role.
- Dangerous actions require confirmation.
- If device is offline, actions may be disabled for state reasons.

Required RBAC behavior:

- Read-only: view only
- Installer: install/assignment actions if permitted
- NOC/Support: diagnostics and limited actions if permitted
- Customer Admin: management actions inside own scope if permitted
- Operator Admin: management actions inside operator subtree if permitted

---

### 18.7 SCR-DEVICE-013 - Connectivity View

Purpose:

```text
Show engineering-focused connectivity topology under Devices, separate from venue/floor topology.
```

Required behavior:

- Render gateways, switches, AP uplinks, mesh links, WAN relationships, and port/link states.
- Only authorized devices and links can appear.
- Link details must not reveal devices outside scope.
- If graph data is partial, label it clearly.

---

### 18.8 SCR-BILLING-003 - Create Billing Plan

Purpose:

```text
Allow authorized parent operators to create fixed-device or connection-based billing plans.
```

Required behavior:

- Plan type must be selected first.
- Connection-based plans require price per connected device.
- Fixed-device plans require device limit and billing cycle.
- Children/customers cannot access this screen for parent-created plans.

---

### 18.9 SCR-BILLING-008 - Available Plans

Purpose:

```text
Allow a customer/sub-operator to view eligible active plans offered by its parent operator.
```

Required behavior:

- Show only eligible active plans.
- Do not show inactive, archived, parent-private, sibling, or unauthorized plans.
- If there is an existing active subscription, route to confirmation/conflict handling.

---

### 18.10 SCR-BILLING-009 - Select Plan Confirmation

Purpose:

```text
Prevent accidental subscription changes and enforce single-active-subscription rules.
```

Required behavior:

- Show selected plan summary.
- Show existing active subscription conflict if present.
- Confirm or block selection based on backend validation.
- Preserve current subscription if selection fails.

---

### 18.11 SCR-BILLING-011 - Current Subscription Detail

Purpose:

```text
Show the current subscription state and plan limits for the selected customer/sub-operator scope.
```

Required behavior:

- Show subscription state clearly: active, inactive, pending, suspended, expired, or cancelled.
- Show plan type and relevant usage details.
- Show fixed-device or connection-based details only when applicable.
- Do not expose sibling subscriptions.

---

### 18.12 SCR-CONFIG-007 - Effective Configuration Preview

Purpose:

```text
Explain the final effective configuration for a node or device after assignments and overrides.
```

Required behavior:

- Show inherited, assigned, and overridden values.
- Mark conflicts and validation issues.
- Keep backend as source of truth.
- Do not expose configuration from unauthorized parent/sibling scopes unless explicitly allowed.

---

### 18.13 SCR-ADMIN-004 - Roles and Policies

Purpose:

```text
Expose permission profiles in a business-friendly way while hiding OWPROV internals from normal users.
```

Required behavior:

- Use user-facing role/profile labels.
- Avoid exposing raw managementRole, managementPolicy, policy inheritance, or scope-chain internals.
- Edits must include impact warning.
- Users cannot grant authority outside their own allowed authority.

---

## 19. Screen Definition Acceptance Checklist

This document is acceptable when:

- Every in-scope screen from `screen-inventory.md` has a purpose.
- Every in-scope screen has primary actions.
- Every in-scope screen identifies hierarchy/scope dependency.
- Every in-scope screen identifies RBAC behavior.
- Every important screen has loading, empty, error, no-permission, backend-unavailable, and read-only states where applicable.
- Topology remains contextual and not a root sidebar module.
- Device connectivity topology remains under Devices.
- Billing respects parent-child scope isolation.
- Customers and Hierarchy remain separate concepts.
- Devices and clients remain separate, with Clients deferred for this phase.
- Deferred modules are not accidentally expanded in this document.
- The document is ready to feed `layout-system.md` and `wireframe-plan.md`.

---

## 20. Next Phase Inputs

This document should feed directly into:

```text
layout-system.md
wireframe-plan.md
Figma low-fidelity screens
Figma clickable prototype
```

Recommended next step:

```text
Create layout-system.md using the recurring layout needs discovered in this screen definition:
- App Shell Layout
- Auth Layout
- Dashboard Layout
- Table + Detail Layout
- Form / Wizard Layout
- Hierarchy Workspace Layout
- Topology Canvas Layout
- Billing Management Layout
- System State Layout
```

---

## 21. Final Summary

This `screen-definition.md` defines all first-phase MDU UI screens from the approved inventory.

It covers:

- Global Shell, including Top App Header and Scope Breadcrumb Bar
- Authentication
- Dashboard
- Customers / Sub-Operators
- Hierarchy
- Devices
- Configuration
- Topology
- Billing
- Users
- Administration

It intentionally excludes:

- Clients
- Rollouts
- Maps
- Metrics
- AI Agent

Those deferred modules remain part of the full MDU UI design direction and should be handled in later design phases.


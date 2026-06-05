# MDU UI - Figma Navigation Model

## 1. Purpose

This document defines the navigation and hierarchy-context model that should be used while creating the MDU UI wireframes and clickable prototype in Figma.

It is the Phase 2 design document after `workflows.md`.

It translates the completed `mdu-ui-spec.md` and `workflows.md` into a practical Figma structure for:

* global navigation
* hierarchy scope navigation
* contextual workspaces
* module navigation
* RBAC-aware visibility
* role-based navigation
* prototype flow linking
* reusable Figma frame organization

This document does not replace `mdu-ui-spec.md`.

```text
mdu-ui-spec.md = source of truth
workflows.md = operational workflow source
figma-navigation-model.md = Figma navigation and prototype structure
```

---

## 2. Core Navigation Principle

The MDU UI must separate operational navigation from hierarchy scope navigation.

```text
Sidebar = WHAT the user wants to do
Top Context Bar = WHERE the user is working
Workspace Tabs = HOW the user views or operates inside the selected scope
```

This rule is mandatory for all scoped workflows.

Before any resource workflow executes, the UI must resolve the current hierarchy scope from the Top Context Bar.

Examples:

```text
Devices page -> uses selected customer/site/node scope
Billing page -> uses selected customer/sub-operator scope
Configuration rollout -> uses selected hierarchy scope
Topology tab -> uses selected node/venue/floor scope
Maps module -> manages map assets within allowed scope
```

---

## 3. Figma File Structure

Recommended Figma pages:

```text
00 - Cover and Design Notes
01 - Navigation Architecture
02 - App Shell Components
03 - Role-Based Navigation
04 - Hierarchy Workspace
05 - Module Navigation Frames
06 - Prototype Workflows
07 - System and RBAC States
08 - Reusable Components
09 - Mobile and Responsive Navigation
```

### 3.1 Page Purpose

| Figma Page | Purpose |
| ---------- | ------- |
| 00 - Cover and Design Notes | Document source, version, design principles, and scope. |
| 01 - Navigation Architecture | Sidebar, top context bar, workspace tabs, breadcrumbs, route model. |
| 02 - App Shell Components | Reusable shell layout, sidebar, header, context picker, tab bar. |
| 03 - Role-Based Navigation | Navigation visibility per role. |
| 04 - Hierarchy Workspace | Customer/site/building/tower/floor/venue workspace examples. |
| 05 - Module Navigation Frames | Dashboard, Customers, Devices, Clients, Billing, Users, etc. |
| 06 - Prototype Workflows | Clickable end-to-end flows from `workflows.md`. |
| 07 - System and RBAC States | Loading, empty, error, no permission, backend down, read-only. |
| 08 - Reusable Components | Tables, cards, breadcrumbs, tabs, filters, drawers, modals. |
| 09 - Mobile and Responsive Navigation | Drawer, compact context switcher, responsive workspace behavior. |

---

## 4. Global Application Shell

Every authenticated screen should use the same base shell.

```text
+--------------------------------------------------------------+
| Top Context Bar / Breadcrumb / User Actions                  |
+----------------------+---------------------------------------+
| Left Sidebar         | Main Workspace                        |
| Operational Modules  | Contextual Content                    |
|                      | Workspace Tabs / Page Content         |
+----------------------+---------------------------------------+
```

### 4.1 Shell Regions

| Region | Purpose |
| ------ | ------- |
| Left Sidebar | Stable operational navigation. |
| Top Context Bar | Current hierarchy scope and subtree switcher. |
| Breadcrumbs | Shows current hierarchy and route context. |
| Main Workspace | Module content rendered within current scope. |
| Workspace Tabs | Contextual tabs for selected hierarchy node. |
| Right Context Panel | Optional details, AI assistant, filters, or actions. |

---

## 5. Left Sidebar Navigation

The left sidebar should contain operational modules only.

Recommended order:

```text
Dashboard
Customers
Hierarchy
Devices
Clients
Configurations
Rollouts
Maps
Billing
Users
Metrics
AI Agent
Administration
```

### 5.1 Sidebar Module Definitions

| Module | Meaning |
| ------ | ------- |
| Dashboard | Global or scoped operational summary. |
| Customers | Tenant, customer, and sub-operator management. |
| Hierarchy | Operational subtree navigation and contextual workspace. |
| Devices | Infrastructure devices: gateways, switches, APs, inventory, firmware, assignments. |
| Clients | End-user/mobile clients, sessions, roaming, wireless experience. |
| Configurations | Configuration sets, templates, assignments, effective configuration. |
| Rollouts | Rollout creation, staged rollout progress, rollback, failure analysis. |
| Maps | Map asset management: upload, metadata, floor/venue association, visibility. |
| Billing | Billing plans, available plans, subscription selection, subscription status. |
| Users | User lifecycle, role/profile assignment, password reset, suspension. |
| Metrics | Health, traffic, wireless quality, client experience, rollout metrics. |
| AI Agent | Ask anything, investigations, recommendations, automations, playbooks, activity. |
| Administration | Platform/admin settings, roles, policies, audit logs, advanced controls. |

### 5.2 Sidebar Rules

* Sidebar items represent operational domains.
* Sidebar items should remain stable regardless of hierarchy depth.
* Sidebar visibility must be RBAC-aware.
* Unauthorized modules should be hidden by default.
* Read-only users may see fewer modules and fewer actions.
* Topology must not be a root sidebar item.

Correct:

```text
Hierarchy -> Select Floor 12 -> Topology tab
```

Not recommended:

```text
Sidebar -> Topology
```

---

## 6. Top Context Bar

The Top Context Bar represents the selected hierarchy scope.

Example:

```text
Operator A / Customer B / Sunrise Towers / Tower 1 / Floor 12
```

### 6.1 Purpose

The Top Context Bar answers:

```text
WHERE is the user currently working?
```

It must control the scope for scoped modules such as:

* Devices
* Clients
* Configurations
* Rollouts
* Maps
* Billing
* Users
* Metrics
* AI Agent

### 6.2 Required Elements

```text
Current Scope Breadcrumb
Scope Switcher
Search within hierarchy
Recently used scopes
Scope type label
Permission indicator when useful
```

### 6.3 Scope Resolution Rule

All resource workflows must resolve current scope before execution.

Required workflow pattern:

```text
Open module
-> Resolve current hierarchy scope from Top Context Bar
-> Load resources allowed in that scope
-> Show only authorized actions
-> Execute workflow inside resolved scope
```

### 6.4 Scope Error States

The Figma prototype should include these context states:

| State | Behavior |
| ----- | -------- |
| No scope selected | Prompt user to select a customer/site/node. |
| Scope loading | Show skeleton or loading state. |
| Scope unavailable | Show service unavailable or retry state. |
| No permission | Show permission-denied message. |
| Scope changed | Refresh module data and preserve safe UI state. |

---

## 7. Hierarchy Navigation Model

The MDU UI uses hierarchy-first navigation for contextual operations.

Example hierarchy:

```text
Root Operator
-> Operator
   -> Customer/Sub-Operator
      -> Site
         -> Building
            -> Tower
               -> Floor
                  -> Venue
```

The hierarchy depth may vary by deployment.

Examples:

```text
Customer -> Venue
Customer -> Site -> Building -> Tower -> Floor -> Venue
```

The UI must support recursive and variable-depth hierarchy.

---

## 8. Hierarchy Workspace Model

When a user selects a hierarchy node, the workspace should change contextually.

Example:

```text
Selected Node: Sunrise Towers / Floor 12
```

Recommended workspace tabs:

```text
Overview
Topology
Devices
Clients
Maps
Configurations
Metrics
AI Insights
```

### 8.1 Tab Behavior Rules

* Tabs are contextual to the selected node.
* Tabs are RBAC-aware.
* Tabs may differ by node type.
* Tabs may hide if capability is unavailable.
* Tabs must preserve selected scope.
* Tabs should not expose sibling or parent data unless explicitly allowed.

### 8.2 Node-Level Workspace Examples

| Selected Level | Recommended Tabs |
| -------------- | ---------------- |
| Customer/Sub-Operator | Overview, Devices, Clients, Billing, Users, Metrics, AI Insights |
| Site | Overview, Topology, Devices, Clients, Maps, Configurations, Metrics |
| Building | Overview, Topology, Devices, Maps, Metrics, AI Insights |
| Tower | Overview, Topology, Devices, Metrics |
| Floor | Overview, Topology, Devices, Clients, Maps, Metrics, AI Insights |
| Venue | Overview, Topology, Devices, Clients, Maps, Metrics, AI Insights |

---

## 9. Customers vs Hierarchy Navigation

The sidebar includes both `Customers` and `Hierarchy`, but they have different purposes.

```text
Customers = tenant/customer/sub-operator management
Hierarchy = operational subtree navigation and scoped workspace
```

### 9.1 Customers Module

Used for:

* customer list
* create customer/sub-operator
* edit customer
* suspend customer
* delete customer
* customer billing summary
* customer admin overview

### 9.2 Hierarchy Module

Used for:

* recursive hierarchy tree
* selected subtree navigation
* node workspace
* contextual topology
* node-scoped devices
* node-scoped clients
* node-scoped maps
* node-scoped metrics

---

## 10. Maps vs Topology Navigation

Maps and topology are related but not the same.

```text
Maps = map asset management
Topology = contextual visualization inside selected hierarchy workspace
```

### 10.1 Maps Module

The Maps module is a standalone operational module for map assets.

Used for:

* map list
* upload map
* edit map metadata
* associate map with node/venue/floor
* manage map visibility
* validate supported map formats

### 10.2 Topology View

Topology is not a root sidebar item.

Topology appears as a workspace tab after selecting a hierarchy node.

Correct Figma prototype path:

```text
Sidebar -> Hierarchy -> Select Floor 12 -> Topology tab
```

### 10.3 Device Connectivity Topology

Device connectivity topology is an engineering-focused view.

Recommended path:

```text
Sidebar -> Devices -> Connectivity View
```

This is separate from venue/floor topology.

---

## 11. Devices vs Clients Navigation

Devices and clients must be separate operational domains.

```text
Devices = managed infrastructure assets
Clients = transient end-user/mobile devices and sessions
```

### 11.1 Devices Module

Recommended structure:

```text
Devices
-> Gateways
-> Switches
-> Access Points
-> Inventory
-> Firmware
-> Assignments
-> Connectivity View
```

### 11.2 Clients Module

Recommended structure:

```text
Clients
-> Active Clients
-> Historical Clients
-> Client Sessions
-> Wireless Experience
-> Roaming
-> Client Analytics
-> Troubleshooting
```

### 11.3 Topology Behavior

Clients should appear in venue/floor topology primarily as:

* counts
* overlays
* heatmaps
* density indicators
* roaming paths
* wireless experience visualizations

Clients should not appear as default graph nodes in complex topology views.

---

## 12. Billing Navigation Model

Billing must follow parent-child scope isolation.

### 12.1 Operator Admin Billing Navigation

Path:

```text
Sidebar -> Billing -> Plans
Sidebar -> Billing -> Subscriptions
Customers -> Select Customer -> Billing Summary
```

Operator Admin can:

* create billing plans
* edit billing plans
* activate/deactivate plans
* assign plans to direct child customers/sub-operators
* view subscription status within allowed subtree

### 12.2 Customer/Sub-Operator Billing Navigation

Path:

```text
Sidebar -> Billing -> Available Plans
Sidebar -> Billing -> Current Subscription
```

Customer/Sub-Operator Admin can:

* view eligible plans offered by parent scope
* select one active billing plan
* view current subscription status
* view billing details according to permissions

Customer/Sub-Operator Admin cannot:

* modify parent-created plans
* view sibling subscriptions
* view parent-private plans
* select more than one active subscription

### 12.3 Billing Prototype Rule

Billing selection flow must include:

```text
Open Billing
-> Resolve current customer/sub-operator scope
-> Load available plans from parent scope
-> Select plan
-> Check existing active subscription
-> Replace existing active plan or reject invalid selection
-> Confirm subscription
```

---

## 13. AI Agent Navigation Model

AI is both a module and a contextual assistant.

### 13.1 AI Agent Module

Recommended structure:

```text
AI Agent
-> Ask Anything
-> Investigations
-> Recommendations
-> Automations
-> Playbooks
-> Agent Activity
```

### 13.2 Contextual AI Entry Points

AI actions should appear contextually throughout workflows.

Examples:

| Context | AI Action |
| ------- | --------- |
| Hierarchy node | Ask AI about this floor/building/site. |
| Device detail | Diagnose this AP or analyze uplink stability. |
| Rollout detail | Explain rollout failure or recommend rollback. |
| Billing | Summarize subscription risk. |
| Customer workspace | Generate customer health summary. |
| Metrics | Explain anomaly. |

### 13.3 AI Approval Rule

AI Assistant must not auto-execute operational actions.

Required flow:

```text
AI suggestion
-> User reviews recommendation
-> User approves action
-> System executes workflow
-> Result is tracked
```

AI must obey:

* RBAC
* subtree scope
* billing visibility rules
* device/client scope isolation
* audit logging requirements

---

## 14. Role-Based Navigation Visibility

Navigation must adapt based on role and permissions.

### 14.1 Root Operator

Visible modules:

```text
Dashboard
Customers
Hierarchy
Devices
Clients
Configurations
Rollouts
Maps
Billing
Users
Metrics
AI Agent
Administration
```

Purpose:

* global platform visibility
* all operators/customers depending on product policy
* platform administration
* audit and advanced controls

### 14.2 Operator Admin

Visible modules:

```text
Dashboard
Customers
Hierarchy
Devices
Clients
Configurations
Rollouts
Maps
Billing
Users
Metrics
AI Agent
Administration limited by policy
```

Purpose:

* manage own operator subtree
* create/manage direct child customers/sub-operators
* manage billing plans for direct children
* manage devices, users, maps, configurations, rollouts, metrics in allowed scope

### 14.3 Customer/Sub-Operator Admin

Visible modules:

```text
Dashboard
Hierarchy
Devices
Clients
Configurations
Rollouts
Maps
Billing
Users
Metrics
AI Agent
```

Optional, if allowed:

```text
Customers
Administration limited
```

Purpose:

* manage own subtree
* view/select eligible billing plans from parent scope
* manage own users, devices, maps, configurations, and rollouts

Cannot:

* view sibling subtrees
* modify parent billing plans
* access parent resources unless explicitly allowed

### 14.4 NOC/Support

Visible modules:

```text
Dashboard
Hierarchy
Devices
Clients
Metrics
AI Agent
Rollouts read-only or diagnostic access
```

Purpose:

* monitoring
* diagnostics
* operational investigation
* issue triage

### 14.5 Installer

Visible modules:

```text
Hierarchy
Devices
Maps
Metrics limited
AI Agent limited
```

Purpose:

* deployment setup
* device placement
* map association
* installation validation

### 14.6 Billing/Admin

Visible modules:

```text
Dashboard limited
Customers limited
Billing
Metrics limited
AI Agent limited
```

Purpose:

* plan management
* subscription status
* billing visibility according to scope

### 14.7 Read-only

Visible modules:

```text
Dashboard
Hierarchy
Devices read-only
Clients read-only
Maps read-only
Metrics read-only
Billing read-only if allowed
AI Agent limited
```

Purpose:

* view-only monitoring and reporting

---

## 15. Navigation State Model

Figma should define variants for these navigation states.

### 15.1 Sidebar States

```text
Expanded
Collapsed
Mobile drawer
Active item
Hover item
Disabled item
Hidden item by RBAC
```

### 15.2 Top Context Bar States

```text
Default selected scope
Scope picker open
Scope search active
Scope loading
No scope selected
No permission for scope
Backend unavailable
Mobile compact context selector
```

### 15.3 Workspace Tab States

```text
Active tab
Inactive tab
Hidden tab by RBAC
Disabled tab due to missing data
Loading tab content
Empty tab content
Error tab content
```

---

## 16. Prototype Workflow Paths

The clickable Figma prototype should include these minimum paths.

### 16.1 Authentication Path

Workflow IDs:

```text
WF-AUTH-001
WF-AUTH-002
WF-AUTH-003
```

Prototype path:

```text
Login
-> Dashboard
-> Session refresh invisible state
-> Logout
-> Login
```

### 16.2 Scope Switching Path

Workflow IDs:

```text
WF-HIERARCHY-001
WF-HIERARCHY-002
WF-HIERARCHY-003
```

Prototype path:

```text
Dashboard
-> Open Top Context Bar
-> Select Customer/Site/Floor
-> Hierarchy workspace updates
-> Workspace tabs update
```

### 16.3 Customer Creation Path

Workflow ID:

```text
WF-CUSTOMER-001
```

Prototype path:

```text
Customers
-> Create Customer
-> Enter details
-> Optional billing plan assignment
-> Submit
-> Success
-> Customer workspace
```

### 16.4 Billing Selection Path

Workflow ID:

```text
WF-BILLING-003
```

Prototype path:

```text
Billing
-> Available Plans
-> Resolve current customer scope
-> Select plan
-> Existing active subscription check
-> Confirm
-> Current Subscription
```

### 16.5 Device Diagnostics Path

Workflow IDs:

```text
WF-DEVICE-002
WF-AI-002
```

Prototype path:

```text
Devices
-> Device Detail
-> Diagnostics
-> Ask AI
-> AI recommendation
-> User approval
-> Result
```

### 16.6 Rollout Path

Workflow IDs:

```text
WF-CONFIG-002
WF-CONFIG-003
```

Prototype path:

```text
Configurations
-> Select configuration
-> Resolve current scope
-> Choose devices/nodes
-> Select staged rollout
-> Review
-> Execute
-> Progress tracking
-> Failure analysis
```

### 16.7 Maps and Topology Path

Workflow IDs:

```text
WF-MAP-001
WF-MAP-002
WF-MAP-003
```

Prototype path:

```text
Maps
-> Upload map asset
-> Associate to venue/floor
-> Hierarchy
-> Select Floor
-> Topology tab
-> View overlays
```

### 16.8 User Management Path

Workflow IDs:

```text
WF-USER-001
WF-USER-002
WF-USER-003
```

Prototype path:

```text
Users
-> Create User
-> Assign role/profile
-> Save
-> Reset Password
-> Suspend User
```

---

## 17. Figma Frame Naming Convention

Use consistent frame names so later screen inventory and implementation mapping are easy.

Recommended format:

```text
[Module] / [Screen or State] / [Role] / [Viewport]
```

Examples:

```text
Dashboard / Scoped Overview / Operator Admin / Desktop
Hierarchy / Floor Workspace - Topology Tab / NOC / Desktop
Billing / Available Plans / Customer Admin / Desktop
Devices / AP Detail - Diagnostics / NOC / Desktop
Maps / Upload Map / Installer / Desktop
Users / Create User / Customer Admin / Desktop
AI Agent / Investigation Detail / NOC / Desktop
```

For states:

```text
Hierarchy / Floor Workspace - No Permission / Customer Admin / Desktop
Devices / Device List - Empty / NOC / Desktop
Billing / Available Plans - Existing Active Plan / Customer Admin / Desktop
```

---

## 18. Component Naming Convention

Reusable Figma components should use predictable names.

```text
Shell/Sidebar
Shell/TopContextBar
Shell/Breadcrumb
Shell/WorkspaceTabs
Navigation/SidebarItem
Navigation/ScopePicker
Navigation/HierarchyTree
Navigation/WorkspaceTab
Table/DataTable
Table/FilterBar
Form/TextInput
Form/Select
Form/PermissionAwareAction
State/Loading
State/Empty
State/Error
State/NoPermission
State/BackendUnavailable
AI/AssistantPanel
AI/RecommendationCard
Billing/PlanCard
Billing/SubscriptionStatus
Map/MapCanvas
Map/DeviceMarker
Topology/OverlayToggle
```

---

## 19. Mobile and Responsive Navigation

The MDU UI must support desktop, tablet, and mobile layouts.

### 19.1 Desktop

```text
Left sidebar visible
Top context bar visible
Hierarchy tree can be persistent or collapsible
Workspace tabs visible horizontally
Right panel optional
```

### 19.2 Tablet

```text
Sidebar may collapse
Hierarchy tree may become drawer
Top context bar remains visible
Workspace tabs may scroll horizontally
```

### 19.3 Mobile

```text
Sidebar becomes drawer
Top context bar becomes compact selector
Hierarchy tree opens as full-screen picker or drawer
Workspace tabs become segmented control or horizontal scroll
Large topology/map views require pan/zoom controls
```

---

## 20. RBAC and System State Requirements

Every major navigation path should include state variants.

Required states:

```text
Default
Loading
Empty
Error
No Permission
Backend Unavailable
Read-only
Action Hidden
Action Disabled
Success
Confirmation Required
```

### 20.1 RBAC Rules for Navigation

* Unauthorized sidebar modules should be hidden by default.
* Unauthorized actions should be hidden by default.
* Backend 403 responses should show contextual permission messages.
* Scoped dropdowns should only show allowed subtree resources.
* Breadcrumbs and hierarchy trees must not expose unauthorized ancestors/siblings beyond allowed display policy.
* AI must not expose information outside current scope.

---

## 21. Minimum Navigation Frames to Create First

For the first Figma navigation model, create these frames before detailed screens.

```text
1. Desktop App Shell - Default
2. Desktop App Shell - Sidebar Collapsed
3. Desktop App Shell - Scope Picker Open
4. Dashboard - Global/Operator View
5. Dashboard - Scoped Customer View
6. Customers - List
7. Customers - Create Customer
8. Hierarchy - Tree + Workspace Overview
9. Hierarchy - Floor Workspace Topology Tab
10. Devices - List
11. Devices - Device Detail Diagnostics
12. Clients - Active Clients
13. Configurations - List
14. Rollouts - Progress Tracking
15. Maps - Asset List
16. Maps - Upload Map
17. Billing - Plans Management
18. Billing - Available Plans
19. Billing - Current Subscription
20. Users - User List
21. Metrics - Scoped Metrics
22. AI Agent - Ask Anything
23. AI Context Panel - Recommendation Approval
24. Administration - Roles/Policies
25. No Permission State
26. Backend Unavailable State
27. Mobile App Shell - Drawer Closed
28. Mobile App Shell - Drawer Open
29. Mobile Scope Picker
```

---

## 22. Acceptance Checklist

The Figma navigation model is acceptable when:

* Sidebar clearly represents WHAT the user wants to do.
* Top Context Bar clearly represents WHERE the user is working.
* Scoped workflows resolve current hierarchy scope before execution.
* Customers and Hierarchy are clearly separated.
* Maps and Topology are clearly separated.
* Topology is not shown as a root sidebar item.
* Devices and Clients are separate modules.
* Billing respects parent-child scope and single active subscription rules.
* AI suggestions require explicit user approval before execution.
* RBAC visibility is shown for at least Root Operator, Operator Admin, Customer Admin, NOC/Support, Installer, Billing/Admin, and Read-only.
* Loading, empty, error, no-permission, and backend-unavailable states are represented.
* Mobile navigation has a clear drawer and compact context selector model.
* Prototype links cover the major workflows from `workflows.md`.

---

## 23. Output of This Phase

After this document is approved, the next phase is:

```text
screen-inventory.md
```

The screen inventory should list every screen/frame required by this navigation model and map each screen to:

* module
* workflow ID
* actor/role
* scope dependency
* RBAC behavior
* system states

# MDU UI - Operational Workflows

# 1. Purpose

This document defines the major operational workflows in the MDU UI platform.

It answers:

```text
WHO performs WHAT action in WHICH scope
```

This document is used as the foundation for:

* screen design
* wireframing
* RBAC behavior
* navigation flows
* frontend implementation
* workflow-to-screen mapping

---

# 2. Workflow Model

Each workflow is defined using:

```text
Workflow ID
Actor
Action
Scope
Entry Point
Flow
Outcome
RBAC Constraints
Failure/Edge Cases
```

Workflow IDs are used to connect this document with screen inventory, screen definitions, wireframes, and acceptance checks.

---

# 3. Actor Definitions

| Actor | Description |
| ----- | ----------- |
| Root Operator | Platform-level administrator with global platform access. |
| Operator Admin | Manages direct child customers/sub-operators and resources within the operator subtree. |
| Customer Admin | Manages its own customer/sub-operator subtree. |
| NOC/Support | Monitors health, investigates issues, and performs diagnostics. |
| Installer | Performs deployment, setup, map placement, and device installation workflows. |
| Billing/Admin | Manages billing plans, subscriptions, and billing visibility according to scope. |
| AI Assistant | Scope-aware system assistant that supports diagnostics, recommendations, workflow guidance, and operational insights. |

---

# 4. Core Workflows

---

# 4.1 Authentication Workflows

## 4.1.1 Login

* Workflow ID: WF-AUTH-001
* Actor: All users
* Scope: Global

Entry Point:

```text
Login Screen
```

Flow:

```text
Login Screen
-> Enter Credentials
-> OWSEC Auth
-> Token Issued
-> Backend Bootstrap
-> Redirect Dashboard
```

Outcome:

* User session is created.
* Access token is stored in memory.
* Refresh token is stored in secure cookie.
* User lands on the appropriate dashboard based on role and scope.

Failure/Edge Cases:

* Invalid credentials
* Account locked
* OWSEC unavailable
* Backend bootstrap unavailable
* Token validation failed

---

## 4.1.2 Session Refresh

* Workflow ID: WF-AUTH-002
* Actor: All users
* Scope: Current user session

Flow:

```text
Token nearing expiry
-> Silent refresh through OWSEC
-> New access token issued
-> Continue session
```

Outcome:

* User remains logged in without disruption.

Failure/Edge Cases:

```text
Refresh failed
-> Clear session
-> Logout user
-> Redirect login
```

---

## 4.1.3 Logout

* Workflow ID: WF-AUTH-003
* Actor: All users
* Scope: Current user session

Flow:

```text
User selects Logout
-> Clear local session state
-> Call OWSEC logout
-> Synchronize logout across tabs
-> Redirect login
```

Outcome:

* User session ends safely.
* All open browser tabs are logged out.

Failure/Edge Cases:

* OWSEC logout unavailable
* Local session cleanup still succeeds
* Other tabs must still receive logout event

---

# 4.2 Customer/Sub-Operator Management Workflows

## 4.2.1 Create Customer/Sub-Operator

* Workflow ID: WF-CUSTOMER-001
* Actor: Operator Admin
* Scope: Operator subtree

Entry Point:

```text
Sidebar -> Customers -> Create Customer
```

Flow:

```text
Open Create Customer Form
-> Enter customer/sub-operator details
-> Enter first admin user details
-> Optional billing plan assignment
-> Submit
-> Backend orchestration
-> Success
-> Redirect to Customer Workspace
```

Outcome:

* Customer/sub-operator is created.
* First admin user is created.
* RBAC role/policy is configured.
* Customer receives its own subtree scope.

RBAC Constraints:

* Only authorized operator-level users can create child customers/sub-operators.
* Customer must be created only inside the actor's allowed subtree.

Failure/Edge Cases:

* Duplicate customer name
* Invalid admin user details
* Permission denied
* Backend orchestration failure
* Billing plan assignment failure

---

## 4.2.2 View Customer Workspace

* Workflow ID: WF-CUSTOMER-002
* Actor: Operator Admin / Customer Admin
* Scope: Selected customer/sub-operator subtree

Entry Point:

```text
Sidebar -> Customers -> Select Customer
```

Flow:

```text
Select Customer
-> Load Customer Workspace
-> Show contextual tabs
-> Overview | Devices | Clients | Topology | Billing | Users | Metrics
```

Outcome:

* User views the customer workspace according to role and scope.

RBAC Constraints:

* Users can only view customers inside their allowed subtree.
* Sibling customer/sub-operator workspaces must not be visible.

Failure/Edge Cases:

* Customer not found
* Permission denied
* Backend unavailable

---

## 4.2.3 Suspend or Delete Customer/Sub-Operator

* Workflow ID: WF-CUSTOMER-003
* Actor: Operator Admin
* Scope: Direct child customer/sub-operator

Entry Point:

```text
Customers -> Customer Detail -> Actions
```

Flow:

```text
Open Customer Detail
-> Select Suspend or Delete
-> Review impact warning
-> Confirm action
-> Backend validates scope and permission
-> Status updated
```

Outcome:

* Customer/sub-operator status is updated according to the selected action.

RBAC Constraints:

* Actor can only manage allowed direct or scoped child customers/sub-operators.
* Destructive actions must be permission-gated.

Failure/Edge Cases:

* Active dependencies prevent deletion
* Permission denied
* Customer has active subscription or devices
* Backend unavailable

---

# 4.3 Billing and Subscription Workflows

## 4.3.1 Create Billing Plan

* Workflow ID: WF-BILLING-001
* Actor: Operator Admin / Billing Admin
* Scope: Operator billing scope

Entry Point:

```text
Sidebar -> Billing -> Plans -> Create Plan
```

Flow:

```text
Open Create Plan Form
-> Select plan type: connection-based or fixed-device
-> Enter plan name, description, limits, features, and pricing
-> For connection-based plan, configure monthly charge per connected device
-> For fixed-device plan, configure fixed device limit and billing cycle: monthly, yearly, or free
-> Set plan status
-> Save
```

Outcome:

* Billing plan is created inside the operator scope.
* Plan is created as either a connection-based plan or a fixed-device plan.

RBAC Constraints:

* Parent operator can create billing plans for its own billing scope.
* Child customers/sub-operators cannot create or modify parent-created billing plans.

Failure/Edge Cases:

* Duplicate plan name
* Invalid plan type
* Invalid plan limits
* Invalid billing cycle
* Invalid connection-based device charge
* Permission denied
* Backend unavailable

---

## 4.3.2 Assign Plan to Customer/Sub-Operator

* Workflow ID: WF-BILLING-002
* Actor: Operator Admin / Billing Admin
* Scope: Direct child customer/sub-operator

Entry Point:

```text
Customers -> Customer Detail -> Billing -> Assign Plan
```

Flow:

```text
Open Customer Billing View
-> Select eligible active plan
-> Review assignment, plan type, pricing, and device limits
-> Confirm
-> Backend validates direct child scope
-> Plan assigned
```

Outcome:

* Billing plan is assigned to an eligible direct child customer/sub-operator.

RBAC Constraints:

* Operator Admin can assign plans only to direct child customers/sub-operators within its allowed subtree.
* Actor cannot assign plans to sibling, parent, or unrelated customers.
* Actor cannot assign inactive or unauthorized plans.

Failure/Edge Cases:

* Selected customer is outside scope
* Selected plan is inactive
* Customer is not eligible for the plan
* Fixed-device plan limit is not valid for the customer
* Permission denied

---

## 4.3.3 Select Billing Plan as Customer/Sub-Operator

* Workflow ID: WF-BILLING-003
* Actor: Customer Admin
* Scope: Own customer/sub-operator subtree

Entry Point:

```text
Sidebar -> Billing -> Available Plans
```

Flow:

```text
Open Available Plans
-> Review plans offered by parent operator
-> Review plan type, pricing, billing cycle, and device limits
-> Select eligible active plan
-> Confirm Subscription
-> Backend validates eligibility
-> Backend enforces single active subscription
-> Subscription updated
```

Outcome:

* Customer/sub-operator has one active billing subscription.
* Selected subscription follows either connection-based billing or fixed-device billing.

RBAC Constraints:

* Customer Admin can only view plans offered by its parent operator.
* Customer Admin can select only one eligible active plan.
* Customer Admin cannot modify parent-created billing plans.
* Customer Admin cannot view sibling billing plans or subscriptions.

Failure/Edge Cases:

* Plan inactive
* Plan not eligible
* Existing subscription conflict
* Fixed-device limit exceeded
* Permission denied
* Billing API unavailable

---

## 4.3.4 View Subscription

* Workflow ID: WF-BILLING-004
* Actor: Customer Admin / Billing Admin / Operator Admin
* Scope: Own subtree or permitted child scope

Entry Point:

```text
Sidebar -> Billing -> Subscription
```

Flow:

```text
Open Subscription View
-> View current plan
-> View plan type
-> View subscription state
-> View limits and billing status
-> For connection-based plan, view connected-device billing details
-> For fixed-device plan, view fixed device allowance and billing cycle
```

Outcome:

* User can view permitted subscription details.
* User can understand whether the current subscription is connection-based or fixed-device based.

RBAC Constraints:

* Customer Admin can view only own subscription.
* Operator Admin can view permitted direct child customer/sub-operator subscriptions.
* Sibling subscriptions must not be visible.

Failure/Edge Cases:

* No active subscription
* Subscription suspended or expired
* Fixed-device limit exceeded
* Permission denied
* Backend unavailable

---

# 4.4 Hierarchy Navigation Workflows	

All workflows that operate on scoped resources must resolve the current hierarchy scope from the Top Context Bar before execution.

```text
Sidebar = WHAT the user wants to do
Top Context Bar = WHERE the user is working

## 4.4.1 Switch Hierarchy Scope

* Workflow ID: WF-HIERARCHY-001
* Actor: All users
* Scope: Allowed subtree

Entry Point:

```text
Top Context Bar
```

Flow:

```text
Open Top Context Bar
-> Select Customer/Site/Node/Venue
-> Load selected subtree
-> Update route context
-> Update breadcrumbs
-> Update workspace
```

Outcome:

* Selected hierarchy scope changes.
* Operational modules render data for the selected scope.

RBAC Constraints:

* Context selector must only show allowed subtree items.
* Unauthorized hierarchy nodes must never appear.

Failure/Edge Cases:

* Selected node unavailable
* Permission changed during session
* Backend unavailable

---

## 4.4.2 Browse Hierarchy Tree

* Workflow ID: WF-HIERARCHY-002
* Actor: All users
* Scope: Allowed subtree

Entry Point:

```text
Sidebar -> Hierarchy
```

Flow:

```text
Open Hierarchy Module
-> Expand hierarchy nodes
-> Select node
-> Open hierarchy workspace
-> Show contextual workspace tabs
```

Outcome:

* User lands in the selected hierarchy node workspace.

RBAC Constraints:

* User can only browse nodes inside the allowed subtree.

Failure/Edge Cases:

* Empty hierarchy
* Node load failure
* Permission denied

---

## 4.4.3 Use Hierarchy Workspace Tabs

* Workflow ID: WF-HIERARCHY-003
* Actor: All users
* Scope: Selected hierarchy node

Entry Point:

```text
Hierarchy -> Select Node -> Workspace Tabs
```

Flow:

```text
Select hierarchy node
-> Open node workspace
-> Choose tab
-> Overview | Topology | Devices | Clients | Maps | Configurations | Metrics | AI Insights
```

Outcome:

* User performs contextual operations inside the selected hierarchy node.

RBAC Constraints:

* Workspace tabs must adapt to role, node type, enabled capabilities, and permissions.

Failure/Edge Cases:

* Tab hidden because of RBAC
* Tab disabled because data is unavailable
* Selected node has no compatible workspace data

---
## 4.4.4 Create Node

* Workflow ID: WF-HIERARCHY-004
* Actor: Operator Admin / Customer Admin
* Scope: Selected hierarchy subtree

Entry Point:

```text
Hierarchy -> Create Node
```

Flow:
Resolve current hierarchy scope
-> Select parent node
-> Select node type
-> Site | Building | Tower | Floor | Venue
-> Enter node details
-> Save
-> Backend validates scope
-> Node created

Outcome:

* New node is added to hierarchy.

RBAC Constraints:

* User can create nodes only inside permitted subtree.

Failure/Edge Cases:

* Invalid parent node
* Duplicate node name
* Permission denied
* Backend unavailable

---

```md
## 4.4.5 Edit Node

* Workflow ID: WF-HIERARCHY-005

Flow:

```text
Select Node
-> Edit Details
-> Save

---

```md
## 4.4.6 Move Node

* Workflow ID: WF-HIERARCHY-006

Flow:

```text
Select Node
-> Select New Parent
-> Validate Scope
-> Save

---

```md
## 4.4.7 Delete Node

* Workflow ID: WF-HIERARCHY-007

Flow:

```text
Select Node
-> Review Impact
-> Confirm Delete
-> Backend Validation
-> Delete

---

# 4.5 Device Management Workflows

## 4.5.1 View Devices

* Workflow ID: WF-DEVICE-001
* Actor: Customer Admin / NOC/Support / Installer
* Scope: Selected subtree or selected hierarchy node

Entry Point:

```text
Sidebar -> Devices
```

Flow:

```text
Open Devices Module
-> Resolve current hierarchy scope
-> Load devices inside scope
-> Filter devices
-> Select device
-> Open device detail
```

Outcome:

* User can view infrastructure devices within permitted scope.

RBAC Constraints:

* Devices outside the user's subtree must not be visible.

Failure/Edge Cases:

* Empty device inventory
* Device offline
* Permission denied
* Backend unavailable

---

## 4.5.2 Device Diagnostics

* Workflow ID: WF-DEVICE-002
* Actor: NOC/Support / Customer Admin
* Scope: Selected device inside allowed subtree

Entry Point:

```text
Devices -> Device Detail -> Diagnostics
```

Flow:

```text
Select Device
-> Open Diagnostics
-> View status, logs, metrics, uplink state
-> Optional AI Assistant diagnosis
-> Review suggested fix
```

Outcome:

* User understands device health and possible remediation steps.

RBAC Constraints:

* Diagnostic depth depends on role.
* Read-only users may only view summary diagnostics.

Failure/Edge Cases:

* Device offline
* Logs unavailable
* Metrics unavailable
* Permission denied

---

## 4.5.3 Device Action

* Workflow ID: WF-DEVICE-003
* Actor: Customer Admin / NOC/Support / Installer
* Scope: Selected device inside allowed subtree

Entry Point:

```text
Devices -> Device Detail -> Actions
```

Flow:

```text
Select Device
-> Choose action
-> Reboot | Upgrade | Blink | Factory Reset
-> Confirm action
-> Backend validates permission
-> Action submitted
-> Track result
```

Outcome:

* Device action is executed or queued.

RBAC Constraints:

* Dangerous actions must be hidden or disabled unless permitted.
* Backend must enforce authorization even if UI shows action.

Failure/Edge Cases:

* Action not supported for device type
* Device offline
* Permission denied
* Action failed

---

## 4.5.4 Add Device

* Workflow ID: WF-DEVICE-004

Flow:

```text
Devices
-> Add Device
-> Resolve current hierarchy scope
-> Enter serial number
-> Select device type
-> Save

---

## 4.5.5 Assign Device

* Workflow ID: WF-DEVICE-005

Flow:

```text
Select Device
-> Assign Device
-> Select Node/Venue
-> Save Assignment

---

## 4.5.6 Move Device

* Workflow ID: WF-DEVICE-006

Flow:

```text
Select Device
-> Move Device
-> Select New Node/Venue
-> Save

---

# 4.6 Client Management Workflows

## 4.6.1 View Active Clients

* Workflow ID: WF-CLIENT-001
* Actor: NOC/Support / Customer Admin
* Scope: Selected subtree or selected hierarchy node

Entry Point:

```text
Sidebar -> Clients -> Active Clients
```

Flow:

```text
Open Active Clients
-> Filter by node/venue/AP/status
-> Select client
-> View client detail
```

Outcome:

* User can monitor active clients inside permitted scope.

RBAC Constraints:

* Clients outside the selected/allowed subtree must not be visible.

Failure/Edge Cases:

* No active clients
* Client disconnected
* Permission denied
* Backend unavailable

---

## 4.6.2 View Client Experience

* Workflow ID: WF-CLIENT-002
* Actor: NOC/Support / Customer Admin
* Scope: Selected client inside allowed subtree

Entry Point:

```text
Clients -> Client Detail -> Wireless Experience
```

Flow:

```text
Select Client
-> Open Wireless Experience
-> View signal, roaming, AP association, session history
-> Optional AI Assistant analysis
```

Outcome:

* User can troubleshoot client experience issues.

RBAC Constraints:

* Client identity/details may be limited by role.

Failure/Edge Cases:

* Historical data unavailable
* Client session ended
* Permission denied

---

# 4.7 Configuration and Rollout Workflows

## 4.7.1 Create Configuration

* Workflow ID: WF-CONFIG-001
* Actor: Customer Admin / Operator Admin
* Scope: Selected subtree

Entry Point:

```text
Sidebar -> Configurations -> Create
```

Flow:

```text
Open Create Configuration
-> Resolve current hierarchy scope
-> Define settings
-> Validate configuration
-> Save
```

Outcome:

* Configuration set is created.

RBAC Constraints:

* User can create configurations only inside permitted scope.

Failure/Edge Cases:

* Invalid configuration
* Duplicate configuration name
* Permission denied
* Backend unavailable

---
## 4.7.2 Edit Configuration

* Workflow ID: WF-CONFIG-002

Flow:

```text
Select Configuration
-> Edit Settings
-> Validate
-> Save
```
---
## 4.7.3 Assign Configuration

* Workflow ID: WF-CONFIG-003

Flow:

```text
Select Configuration
-> Select Target Nodes/Devices
-> Assign
```
---

## 4.7.4 Preview Effective Configuration

* Workflow ID: WF-CONFIG-004

Flow:

```text
Select Node or Device
-> View Effective Configuration
-> Compare Overrides
-> Review Result
```
---
## 4.7.5 Rollout Configuration

* Workflow ID: WF-ROLLOUT-005
* Actor: Customer Admin / Operator Admin
* Scope: Selected nodes/devices inside allowed subtree

Entry Point:

```text
Configurations -> Select Config -> Rollout
```

Flow:

```text
Select Configuration
-> Choose target nodes/devices
-> Select rollout type
-> Immediate | Scheduled | Staged
-> Review rollout plan
-> Execute
-> Track progress
```

Outcome:

* Rollout is started and tracked.

States:

```text
pending -> successful / failed
```

RBAC Constraints:

* Rollout targets must be inside allowed subtree.
* User must have rollout permission.

Failure/Edge Cases:

* Invalid rollout target
* Device incompatible
* Rollout failed
* Permission denied

---

## 4.7.8 Analyze Failed Rollout

* Workflow ID: WF-ROLLOUT-006
* Actor: Customer Admin / NOC/Support
* Scope: Selected rollout inside allowed subtree

Entry Point:

```text
Rollouts -> Failed Rollout -> Analyze
```

Flow:

```text
Open Failed Rollout
-> Review failed targets
-> View failure reasons
-> Optional AI Assistant explanation
-> Retry or rollback
```

Outcome:

* User can understand and act on rollout failure.

RBAC Constraints:

* Retry and rollback actions require permission.

Failure/Edge Cases:

* Rollout logs unavailable
* Retry not supported
* Rollback not available
* Permission denied

---

# 4.8 Maps and Topology Workflows

## 4.8.1 Upload Map

* Workflow ID: WF-MAP-001
* Actor: Installer / Customer Admin
* Scope: Selected node/venue/floor inside allowed subtree

Entry Point:

```text
Sidebar -> Maps -> Upload Map
```

Flow:

```text
Open Maps Module
-> Upload map asset
-> Select node/venue/floor association
-> Add metadata
-> Save
```

Outcome:

* Map asset is uploaded and associated with a permitted hierarchy scope.

RBAC Constraints:

* User can only associate maps with nodes/venues/floors inside allowed subtree.

Failure/Edge Cases:

* Unsupported map format
* Upload failed
* Invalid association
* Permission denied

---

## 4.8.2 Place Devices on Map

* Workflow ID: WF-MAP-002
* Actor: Installer / Customer Admin
* Scope: Selected venue/floor inside allowed subtree

Entry Point:

```text
Hierarchy -> Select Venue/Floor -> Maps Tab -> Open Map Editor
```

Flow:

```text
Select Venue/Floor in Hierarchy
-> Open Maps Tab
-> Open Map Editor
-> Drag device onto map
-> Set position and rotation
-> Save position
```

Outcome:

* Device placement coordinates are saved for map/topology visualization.

RBAC Constraints:

* User can place only permitted devices on maps inside allowed subtree.
* Device and map must belong to compatible scope.

Failure/Edge Cases:

* Device not assignable to map scope
* Map missing
* Invalid coordinates
* Permission denied

---

## 4.8.3 View Topology

* Workflow ID: WF-TOPOLOGY-001
* Actor: All users
* Scope: Selected hierarchy node

Entry Point:

```text
Hierarchy -> Select Node -> Topology Tab
```

Flow:

```text
Select hierarchy node
-> Open Topology Tab
-> View contextual topology
-> Toggle overlays
-> APs | Switches | Gateways | Clients | Health | Wireless Quality
```

Outcome:

* User views contextual topology for the selected node.

RBAC Constraints:

* Topology overlays must only show resources inside permitted scope.
* Topology is not a standalone root sidebar module.

Failure/Edge Cases:

* No map available
* Topology data unavailable
* Partial data
* Permission denied

---

## 4.8.4 View Device Connectivity Topology

* Workflow ID: WF-TOPOLOGY-002
* Actor: NOC/Support / Customer Admin
* Scope: Selected subtree or selected device group

Entry Point:

```text
Sidebar -> Devices -> Connectivity View
```

Flow:

```text
Open Devices Module
-> Open Connectivity View
-> View gateways, switches, AP uplinks, mesh links, and port relationships
-> Select device or link
-> Inspect connectivity detail
```

Outcome:

* User views engineering-focused device connectivity topology.

RBAC Constraints:

* Connectivity graph must only show authorized devices and links.

Failure/Edge Cases:

* Topology graph unavailable
* Link data unavailable
* Permission denied

---

# 4.9 User Management Workflows

## 4.9.1 Create User

* Workflow ID: WF-USER-001
* Actor: Operator Admin / Customer Admin
* Scope: Own subtree or permitted child subtree

Entry Point:

```text
Sidebar -> Users -> Create User
```

Flow:

```text
Open Create User Form
-> Enter user details
-> Select role/profile
-> Select scope if applicable
-> Save
-> Backend creates user through OWSEC
-> Backend applies role/policy through OWPROV
```

Outcome:

* User account is created and assigned to the correct scope and role/profile.

RBAC Constraints:

* Actor can create users only inside permitted scope.
* Actor cannot grant permissions higher than their own allowed authority.

Failure/Edge Cases:

* Duplicate email
* Invalid role assignment
* Scope not allowed
* OWSEC user creation failed
* OWPROV role/policy attachment failed

---

## 4.9.2 Reset Password

* Workflow ID: WF-USER-002
* Actor: Operator Admin / Customer Admin
* Scope: User inside permitted subtree

Entry Point:

```text
Users -> User Detail -> Reset Password
```

Flow:

```text
Open User Detail
-> Select Reset Password
-> Confirm
-> Backend triggers OWSEC password reset flow
-> Show success state
```

Outcome:

* Password reset is triggered for the selected user.

RBAC Constraints:

* Actor can reset password only for users inside permitted scope.

Failure/Edge Cases:

* User outside scope
* OWSEC unavailable
* Permission denied

---

## 4.9.3 Suspend User

* Workflow ID: WF-USER-003
* Actor: Operator Admin / Customer Admin
* Scope: User inside permitted subtree

Entry Point:

```text
Users -> User Detail -> Suspend User
```

Flow:

```text
Open User Detail
-> Select Suspend User
-> Confirm
-> Backend updates user status
-> Active sessions revoked if required
```

Outcome:

* User is suspended and access is blocked.

RBAC Constraints:

* Actor can suspend users only inside permitted scope.
* Actor cannot suspend users with higher authority unless explicitly allowed.

Failure/Edge Cases:

* User outside scope
* Permission denied
* Active session revocation failed

---

# 4.10 AI Assistant Workflows

## 4.10.1 Ask AI

* Workflow ID: WF-AI-001
* Actor: All users
* Scope: Current selected scope

Entry Point:

```text
Sidebar -> AI Agent -> Ask Anything
```

Flow:

```text
Open AI Agent
-> Ask question
-> AI Assistant resolves current user scope and permissions
-> AI Assistant responds using authorized data only
```

Outcome:

* User receives scope-aware operational guidance.

RBAC Constraints:

* AI Assistant must obey RBAC and subtree isolation.
* AI Assistant must not expose sibling, parent, or unauthorized data.

Failure/Edge Cases:

* Question requires unauthorized data
* AI context unavailable
* Backend unavailable

---

## 4.10.2 AI Diagnostics

* Workflow ID: WF-AI-002
* Actor: NOC/Support / Customer Admin
* Scope: Selected device or hierarchy node

Entry Point:

```text
Device Detail -> Ask AI
```

Flow:

```text
Select Device
-> Ask AI Assistant to diagnose issue
-> AI Assistant analyzes permitted device data
-> Suggests possible cause and next steps
-> User reviews recommendation
```

Outcome:

* User receives a diagnostic explanation and recommended next actions.

RBAC Constraints:

* AI Assistant can only analyze data the user is authorized to view.
* AI-generated actions require user approval before execution.

Failure/Edge Cases:

* Insufficient data
* Unauthorized data requested
* Recommendation cannot be executed

---

## 4.10.3 AI Recommendations

* Workflow ID: WF-AI-003
* Actor: Customer Admin / Operator Admin / NOC/Support
* Scope: Current selected scope

Entry Point:

```text
Dashboard -> AI Recommendations
```

Flow:

```text
Open AI Recommendations
-> Review suggested actions
-> Open recommendation detail
-> Review plan
-> Approve, edit, or dismiss
```

Outcome:

* User can act on AI-supported recommendations after review.

RBAC Constraints:

* AI recommendations must be scoped to authorized resources.
* Execution of AI-suggested actions must use normal RBAC validation.

Failure/Edge Cases:

* Recommendation stale
* Required permission missing
* Suggested action conflicts with policy

---

# 4.11 Administration Workflows

## 4.11.1 Manage Roles and Policies

* Workflow ID: WF-ADMIN-001
* Actor: Root Operator / Operator Admin
* Scope: Platform scope or operator subtree

Entry Point:

```text
Sidebar -> Administration -> Roles/Policies
```

Flow:

```text
Open Administration
-> Open Roles/Policies
-> View existing role/policy profiles
-> Edit allowed settings
-> Save changes
-> Backend validates authority
```

Outcome:

* Role/policy settings are viewed or updated according to authority.

RBAC Constraints:

* Root Operator can manage platform-level administration.
* Operator Admin can manage only permitted operator-scope settings.
* Users cannot grant permissions outside their authority.

Failure/Edge Cases:

* Permission denied
* Invalid policy configuration
* Change would break required admin access
* Backend unavailable

---

## 4.11.2 View Audit Logs

* Workflow ID: WF-ADMIN-002
* Actor: Root Operator / Operator Admin / NOC/Support
* Scope: Platform or permitted subtree

Entry Point:

```text
Sidebar -> Administration -> Audit Logs
```

Flow:

```text
Open Audit Logs
-> Filter by user, action, resource, scope, or date
-> View event detail
```

Outcome:

* User can review permitted audit activity.

RBAC Constraints:

* Audit logs must be scoped.
* Users must not see audit events for unauthorized subtrees.

Failure/Edge Cases:

* No logs available
* Permission denied
* Backend unavailable

---

# 5. Cross-Cutting Behaviors

## 5.1 RBAC Enforcement

All workflows must follow RBAC behavior:

* Actions are hidden if not permitted.
* Read-only users see read-only states where appropriate.
* Backend APIs enforce authorization.
* Unauthorized resources are never shown in responses.
* UI permissions are convenience only; backend remains the enforcement layer.

---

## 5.2 Scope Isolation

All workflows must follow subtree isolation:

* Users only see resources in their allowed subtree.
* Sibling subtree data is never visible.
* Parent resources are hidden unless explicitly allowed.
* Dropdowns, searches, filters, topology views, billing views, and AI responses must be scope-filtered.

---

## 5.3 Backend Outage Behavior

Authentication should continue when the MDU backend is unavailable.

UI behavior:

* UI shell loads.
* Navigation can render from existing session context.
* Business data screens show service unavailable state.
* Retry option is available.
* No stale or unauthorized cached business data is shown.

Display state:

```text
Service Unavailable
Retry
```

---

## 5.4 System States

All workflows must define and handle:

```text
Loading
Empty
Error
No Permission
Backend Down
Partial Data
Success
```

These states are especially important for:

* topology
* billing
* metrics
* rollouts
* AI workflows
* maps
* hierarchy workspaces

---

## 5.5 Confirmation and Safety States

Destructive or sensitive actions must include explicit confirmation.

Examples:

* Delete customer/sub-operator
* Suspend user
* Factory reset device
* Rollback rollout
* Change billing plan
* Modify role/policy

---

# 6. Workflow Coverage Summary

This document covers:

* Authentication
* Customer/sub-operator lifecycle
* Billing and subscription management
* Hierarchy navigation and workspace behavior
* Device management and diagnostics
* Client management and wireless experience
* Configuration and rollout workflows
* Maps and contextual topology
* User management
* AI Assistant workflows
* Administration workflows
* RBAC behavior
* Scope isolation
* Backend outage behavior
* System states

---

# 7. Next Design Documents

This workflows document should feed into:

```text
screen-inventory.md
screen-definitions.md
layout-system.md
wireframe-plan.md
figma-navigation-model.md
```

The next step is to map each workflow ID to the screens required to support it.


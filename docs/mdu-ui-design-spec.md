# MDU UI Specification and Design Flow

## 1. Purpose

This document defines the architecture, design flow, information architecture, navigation model, UI modules, authentication model, RBAC behavior, entity hierarchy, backend integration model, and frontend behavior for the MDU UI platform.

The goal of the MDU UI is to provide a unified multi-tenant management platform for:

* Operators
* Customers/Sub-Operators
* Entities
* Nodes
* Sites
* Venues
* Infrastructure devices
* Clients
* Configurations
* Rollouts
* Billing plans
* Subscriptions
* Maps
* Topology views
* Metrics
* Contacts
* Locations
* Users
* AI-assisted operations
* RBAC-controlled administration

This document also defines how the MDU UI interacts with:

* OWSEC (Authentication and Security Service)
* OWPROV (Hierarchy, Resource, and RBAC Service)
* MDU Backend APIs

The design intentionally separates frontend business concepts from OWPROV internal implementation details. The frontend should expose a clear operational UX while the backend remains responsible for orchestration, hierarchy resolution, and access enforcement.

---

# 2. Glossary and Naming Model

## 2.1 Customer/Sub-Operator

Customer/Sub-Operator represents a recursive child tenant inside the MDU hierarchy.

In UI-facing language, this may be shown as **Customer** because business users commonly understand that term. In technical architecture, backend flow, and permission logic, the same object should be treated as a **Sub-Operator / Child Tenant**.

Meaning:

```text
Customer = Sub-Operator = Child Tenant
```

A Customer/Sub-Operator is not only a final leaf customer. It can also act like an operator for its own subtree when its permissions allow.

A customer/sub-operator:

* Owns its own subtree
* Can create child customers/sub-operators if its policy allows
* Can manage users, devices, clients, configurations, maps, contacts, locations, nodes, sites, and venues within its subtree
* Can view/select eligible billing plans offered by its parent operator
* Can view current subscription and billing status according to permissions
* Can delegate access to users inside its own subtree
* Cannot modify parent-created billing plans
* Cannot view sibling billing plans or subscriptions
* Cannot access sibling subtrees
* Cannot access parent resources unless explicitly allowed
* Cannot create or manage resources outside its assigned subtree

---

## 2.2 Entity

Entity is an OWPROV internal hierarchy object.

Frontend behavior:

```text
Entity should not be a first-class business object in normal UI flows.
```

Entity may be exposed only in:

* Advanced admin pages
* Debug/admin tooling
* Internal troubleshooting views

Normal frontend flows should use:

* Customer/Sub-Operator
* Node
* Venue
* Site

instead of raw entity terminology.

---

## 2.3 Node

Node is the generic hierarchy abstraction used by the frontend.

A node may represent:

* Customer scope
* Site
* Building
* Tower
* Floor
* Venue
* Grouping hierarchy

Nodes form the recursive frontend tree structure.

Nodes internally map to:

* OWPROV Entity
* OWPROV Venue

through backend mapping/orchestration.

---

## 2.4 Site

Site represents a logical or physical deployment grouping.

Examples:

* Apartment complex
* Hotel
* Campus
* Office building
* Retail branch

A site may contain:

* Multiple nodes
* Multiple venues
* Multiple floor maps
* Infrastructure devices
* Clients
* Configurations
* Metrics

---

## 2.5 Venue

Venue represents the physical deployment location.

Examples:

* Floor
* Hall
* Wing
* Building area
* Room cluster

Venues are the primary physical scope for:

* Device placement
* Maps
* Topology overlays
* Wireless coverage
* Client density visualization
* Client/device contextualization

---

## 2.6 Infrastructure Device

Infrastructure devices are managed network assets.

Examples:

* Gateways
* Switches
* Access Points

Infrastructure devices are persistent inventory objects, can participate in configuration rollouts, and can appear in topology and connectivity views.

---

## 2.7 Client

Client represents an end-user/mobile/endpoint device connected to the network.

Examples:

* Phones
* Laptops
* Tablets
* IoT endpoints
* Printers
* TVs

Clients are transient, session-oriented, high-volume, analytics-focused objects. They should be treated as a separate operational domain from infrastructure devices.

---

# 3. High-Level Architecture

## 3.1 Architecture Overview

```text
MDU UI
 ├── Directly calls OWSEC
 │     ├── Login
 │     ├── Logout
 │     ├── Token refresh
 │     ├── Session validation
 │     ├── Forgot password
 │     └── Change password
 │
 └── Calls MDU Backend APIs
       ├── Customers/Sub-Operators
       ├── Hierarchy/Nodes
       ├── Sites
       ├── Venues
       ├── Devices
       ├── Clients
       ├── Users
       ├── Configurations
       ├── Rollouts
       ├── Billing Plans
       ├── Subscriptions
       ├── Maps
       ├── Metrics
       ├── AI Agent / AI Actions
       └── Administration

MDU Backend
 ├── Calls OWSEC for user lifecycle operations
 ├── Calls OWPROV for hierarchy, RBAC, and resource operations
 ├── Resolves selected hierarchy scope
 ├── Enforces subtree isolation
 ├── Enforces billing/subscription visibility
 ├── Builds contextual topology responses
 └── Provides AI workflow orchestration interfaces when enabled

OWSEC
 ├── Authentication
 ├── Token management
 ├── Session handling
 ├── Password management
 └── User account management

OWPROV
 ├── Operator hierarchy
 ├── Customer/Sub-Operator hierarchy
 ├── Entity tree
 ├── Venue tree
 ├── Inventory/devices
 ├── Configuration
 ├── Maps
 ├── Contacts
 ├── Locations
 ├── ManagementRole
 ├── ManagementPolicy
 └── RBAC enforcement
```

---

## 3.2 UI Architecture Principle

The UI architecture must separate:

```text
Operational Navigation
```

from:

```text
Hierarchy Scope Navigation
```

Operational navigation answers:

```text
What work does the user want to do?
```

Hierarchy scope navigation answers:

```text
Where in the customer/operator hierarchy is the user working?
```

This separation is required because the MDU hierarchy is recursive and may be shallow or deeply nested depending on deployment.

---

# 4. Core Design Principles

## 4.1 Frontend Must Not Understand OWPROV Internals

The frontend must not directly expose or depend on internal OWPROV concepts such as:

* managementRole
* managementPolicy
* policy inheritance
* scope chains
* entity attachment internals
* venue attachment internals
* raw RBAC resolution

The frontend should operate using business-oriented concepts:

* Customer
* Sub-Operator
* Node
* Site
* Venue
* Gateway
* Switch
* Access Point
* Client
* User
* Configuration Set
* Rollout
* Billing Plan
* Subscription
* Map
* Topology View
* AI Agent

---

## 4.2 Direct Authentication Through OWSEC

The frontend directly integrates with OWSEC for authentication and session handling.

Reason:

```text
MDU UI authentication should continue functioning even if the MDU backend is unavailable.
```

This allows:

* Login while backend is down
* Session refresh while backend is down
* Logout while backend is down
* UI shell rendering during backend outage

Business/resource operations still depend on the MDU backend.

---

## 4.3 MDU Backend Acts as Orchestrator

The MDU backend acts as a wrapper/orchestrator layer.

The UI calls:

```text
/api/v1/mdu/*
```

The backend internally:

* Validates requests
* Resolves hierarchy/scope
* Calls OWSEC
* Calls OWPROV
* Builds composed responses
* Applies orchestration logic
* Enforces tenant scope for billing plans and subscriptions
* Enforces device/client visibility boundaries
* Builds contextual topology and workspace responses
* Converts canonical responses into MDU response shapes

---

## 4.4 UX Must Hide Backend Complexity

The frontend should avoid exposing backend hierarchy complexity directly to users.

The user should not need to understand whether an item is internally represented as an entity, venue, role, policy, or scope chain. The UI should present a clear operational model using customers, hierarchy, devices, clients, maps, billing, and contextual workspaces.

---

# 5. Information Architecture and Navigation Model

## 5.1 Information Architecture Philosophy

The MDU platform is a recursive multi-tenant operational system.

The UI architecture must optimize for:

* Operational simplicity
* Recursive hierarchy scalability
* Contextual workflows
* RBAC-aware visibility
* AI-native operational assistance
* Topology contextualization
* Subtree isolation

The Information Architecture (IA) is not a replacement for this specification. It is the UX/navigation layer that defines how users move through the platform and how operational modules behave inside the selected hierarchy scope.

---

## 5.2 Operational Navigation vs Hierarchy Scope Navigation

The platform must clearly separate:

```text
Operational Navigation
```

from:

```text
Hierarchy Scope Navigation
```

Operational navigation should be stable regardless of hierarchy depth.

Hierarchy scope navigation should be contextual and should represent the current working scope.

Example:

```text
Selected scope:
Operator A / Customer B / Sunrise Towers / Floor 12
```

When the selected scope changes, each operational module should automatically load data within that scope.

---

## 5.3 Left Sidebar Navigation

The left sidebar should expose operational modules only.

Recommended top-level navigation:

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

Design rules:

* Navigation modules represent operational domains.
* Recursive hierarchy navigation remains contextual.
* Topology is not a standalone root sidebar module.
* AI is available as a module and as contextual actions.
* Modules remain stable regardless of hierarchy depth.
* Sidebar items must be RBAC-aware and hidden when unauthorized.

---

## 5.4 Top Context Bar

The top context bar represents the currently selected subtree scope.

Example:

```text
Operator A / Customer B / Sunrise Towers / Floor 12
```

The following UI components must remain synchronized:

* Hierarchy tree
* Breadcrumbs
* Selected subtree
* Route context
* Operational workspace context
* Scoped API query parameters
* RBAC visibility state

If the user changes the selected subtree, all module data should refresh within the new scope.

---

## 5.5 Hierarchy-First Navigation

The platform should use:

```text
Hierarchy-first navigation
```

instead of:

```text
Dedicated topology navigation
```

Users should first navigate to the appropriate hierarchy node. Once the correct hierarchy node is selected, the workspace context changes automatically.

Example hierarchy:

```text
Customer
 └── Site
      └── Building
           └── Tower
                └── Floor
                     └── Venue
```

The hierarchy depth may vary across deployments.

Valid examples:

```text
Customer → Venue
```

```text
Customer → Site → Building → Tower → Floor → Venue
```

The UI architecture must support variable recursive hierarchy depth.

---

## 5.6 Hierarchy Workspace Model

Once a hierarchy node is selected, the platform should expose contextual operational tabs.

Example:

```text
Selected Node:
Sunrise Towers / Floor 12
```

Contextual workspace tabs:

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

The workspace context should dynamically adapt based on:

* Selected hierarchy node
* Node type
* Available deployment data
* RBAC scope
* Enabled platform capabilities

Unauthorized tabs must be hidden.

---

## 5.7 Topology as a Contextual View

Topology should not be modeled as a standalone root navigation object.

Correct UX:

```text
Hierarchy → Select Floor 12 → Topology tab
```

Not ideal:

```text
Sidebar → Topology
```

Topology is a contextual view of the selected hierarchy node.

This allows topology to scale across:

* Sites
* Buildings
* Towers
* Floors
* Venues

without coupling topology behavior to a single hierarchy type.

---

## 5.8 Venue Topology vs Device Connectivity Topology

The platform should distinguish between venue topology and device connectivity topology.

### Venue Topology

Venue topology is the primary operational visualization.

Focus:

* Maps
* Floor visualization
* AP placement
* Wireless coverage
* Client density
* Wireless quality
* Venue hierarchy
* Spatial visualization

Venue topology should be the default topology experience for most users.

Examples:

```text
Floor 12 topology
Building topology
Tower topology
Campus topology
```

### Device Connectivity Topology

Device connectivity topology is a secondary engineering-focused topology.

Focus:

* Switch uplinks
* Gateway uplinks
* AP uplinks
* Mesh links
* WAN connectivity
* L2/L3 relationships
* Port connectivity
* Logical network graph

Recommended navigation:

```text
Devices → Connectivity View
```

This experience is intended primarily for:

* NOC
* Engineering
* Advanced troubleshooting

The platform should avoid exposing complex network graphs as the default topology experience.

---

## 5.9 Recommended Topology Behavior Per Hierarchy Level

### Site Level

Recommended topology content:

* Building summaries
* Aggregate health
* Deployment overview
* Regional metrics

### Building Level

Recommended topology content:

* Floor structure
* Distribution switches
* AP density
* Backbone connectivity

### Tower Level

Recommended topology content:

* Floor relationships
* AP distribution
* Tower-level health
* Aggregation links

### Floor Level

Recommended topology content:

* Floor maps
* AP placement
* Wireless overlays
* Client density
* Wireless quality
* Roaming visualization

### Venue Level

Recommended topology content:

* Detailed operational topology
* Overlays
* Client relationships
* AP/client behavior
* Coverage visualization
* Wireless experience metrics

---

## 5.10 Devices vs Clients Separation

Infrastructure devices and end-user clients must be separate operational domains.

Devices are managed assets:

```text
Devices
 ├── Gateways
 ├── Switches
 ├── Access Points
 ├── Inventory
 ├── Firmware
 ├── Assignments
 └── Connectivity View
```

Clients are transient/session-oriented endpoints:

```text
Clients
 ├── Active Clients
 ├── Historical Clients
 ├── Client Sessions
 ├── Wireless Experience
 ├── Roaming
 ├── Client Analytics
 └── Troubleshooting
```

Clients should appear in topology primarily as:

* Counts
* Overlays
* Heatmaps
* Density visualization
* Roaming visualization

Clients should not appear as default topology graph nodes.

---

## 5.11 AI-Native Operational Model

The platform should be designed as an AI-native operational system.

AI functionality should exist in two forms:

```text
A. Centralized AI Agent Module
B. Contextual AI Actions Across Operational Workflows
```

Recommended AI Agent module structure:

```text
AI Agent
 ├── Ask Anything
 ├── Investigations
 ├── Recommendations
 ├── Automations
 ├── Playbooks
 └── Agent Activity
```

The AI system should support:

* Diagnostics
* Anomaly detection
* Rollout planning
* Wireless optimization
* Customer health analysis
* Subscription risk analysis
* Topology analysis
* AP placement recommendations
* Congestion analysis

---

## 5.12 Contextual AI Workflows

AI capabilities should appear contextually throughout the platform.

Examples:

### Hierarchy Node

```text
Ask AI About This Floor
Ask AI About This Building
Analyze Wireless Health
```

### Device

```text
Diagnose This AP
Analyze Uplink Stability
```

### Rollout

```text
Explain Rollout Failure
Create Staged Rollout
```

### Billing

```text
Summarize Subscription Risk
```

### Customer

```text
Generate Customer Health Summary
```

Recommended operational workflow:

```text
AI Suggestion
 → Review Plan
 → Approve Action
 → Execute Workflow
 → Track Result
```

AI-generated operational plans should remain editable before execution.

---

## 5.13 AI RBAC and Scope Rules

AI should:

* Augment operators
* Provide explainable recommendations
* Remain scope-aware
* Obey RBAC
* Respect subtree isolation

AI should not:

* Expose sibling subtree information
* Expose unauthorized billing data
* Expose unauthorized device inventory
* Recommend actions outside user scope
* Execute workflow changes without proper review/approval when required

---

# 6. Multi-Tenant Hierarchy Model

## 6.1 Recursive Customer/Sub-Operator Model

The system uses a recursive tenant hierarchy.

```text
Root Operator
 └── Customer/Sub-Operator A
      └── Customer/Sub-Operator B
           └── Customer/Sub-Operator C
                ├── Nodes
                ├── Venues
                ├── Devices
                ├── Clients
                ├── Users
                ├── Configurations
                ├── Billing Subscriptions
                ├── Maps
                ├── Contacts
                └── Locations
```

Meaning:

```text
Customer = Sub-Operator = Child Tenant
```

Every child customer/sub-operator behaves like its parent:

* Can manage its own subtree
* Can create child customers/sub-operators
* Can create users
* Can create venues
* Can manage infrastructure inventory
* Can view clients within its scope
* Can manage configuration
* Can manage billing plan visibility for direct children when allowed
* Can view and select eligible billing plans from its parent scope
* Can manage maps
* Can manage contacts and locations

---

## 6.2 Isolation Rules

Each customer/sub-operator only sees its own subtree.

Example:

```text
Customer A
  cannot see
Customer B
```

Rules:

* Child cannot see sibling subtree
* Child cannot see parent resources unless explicitly allowed
* Child cannot create resources outside its scope
* Child cannot bypass scope boundaries
* Child cannot access unauthorized billing, device, client, map, topology, or AI context data

---

# 7. Authentication Flow

## 7.1 Login Flow

```text
1. User opens MDU UI.
2. UI calls OWSEC login API directly.
3. OWSEC authenticates credentials.
4. OWSEC returns:
     access_token
     refresh_token
     session information
     user information
5. UI stores token/session.
6. UI calls MDU backend bootstrap API.
7. MDU backend validates token.
8. MDU backend resolves RBAC scope using OWPROV.
9. UI loads dashboard, navigation, selected hierarchy context, and allowed modules.
```

---

## 7.2 Session Refresh Flow

```text
1. UI detects token nearing expiry.
2. UI directly calls OWSEC refresh API.
3. OWSEC returns refreshed token.
4. UI updates stored session.
```

---

## 7.3 Backend Down Behavior

If MDU backend is unavailable:

```text
- Login still works.
- Logout still works.
- Session refresh still works.
- UI shell still loads.
- Navigation renders from cached/bootstrapped permissions when safe.
- Data pages show service unavailable state.
```

Business data must not be shown from stale cache unless the UI clearly marks it as stale and the product requirement allows it.

---

# 8. RBAC Model

## 8.1 RBAC Ownership

RBAC means **Role-Based Access Control**.

RBAC determines:

```text
Who can do what, and where.
```

OWPROV is the source of truth for:

* RBAC
* Scope
* Hierarchy
* Role attachment
* Policy attachment
* Access validation

---

## 8.2 ManagementRole

ManagementRole defines:

```text
Who has access
and
Where access is scoped
```

Example:

```text
Customer Admin Role
  → attached to customer entity
  → contains customer admin users
```

---

## 8.3 ManagementPolicy

ManagementPolicy defines:

```text
What actions are allowed
on which resource types
```

Example:

```text
Customer Full Access Policy
  → inventory FULL
  → venue FULL
  → configuration FULL
```

---

## 8.4 Scope Chain

OWPROV evaluates access through scope chains.

Example:

```text
venue
 → parent venue
 → entity
 → parent entity
 → operator entity
 → operator
```

Frontend should never directly implement this logic.

---

## 8.5 RBAC-Aware Navigation

The UI must apply RBAC to:

* Sidebar modules
* Top context bar scope options
* Hierarchy tree nodes
* Workspace tabs
* Page actions
* Dropdown options
* Search results
* Billing plans and subscriptions
* Device and client visibility
* AI prompts, context, and recommendations

Backend authorization remains mandatory even when the UI hides unauthorized elements.

---

# 9. Customer/Sub-Operator Creation Flow

## 9.1 Frontend Behavior

Frontend performs one business action:

```http
POST /api/v1/mdu/customers
```

Frontend does not individually call:

* create entity
* create role
* create policy
* create user
* attach role
* attach policy

Those are backend orchestration operations.

---

## 9.2 Backend Orchestration Flow

```text
1. Authenticate token.
2. Resolve current parent scope.
3. Validate create-customer permission.
4. Create child entity in OWPROV.
5. Create admin user in OWSEC.
6. Create management policy in OWPROV.
7. Create management role in OWPROV.
8. Attach user to role.
9. Attach role and policy to entity.
10. Return customer/sub-operator summary.
```

---

## 9.3 Result

The newly created customer/sub-operator receives:

* Its own entity scope
* Its own admin user
* Its own RBAC policy
* Its own role attachment
* Its own subtree isolation

The new admin can then:

* Login
* Create child sub-operators when allowed
* Create users
* Create venues
* Manage devices
* View clients
* Manage configuration
* View/select billing plans when eligible

---

# 10. User Creation Flow

## 10.1 First Admin User

The first admin user is automatically created during customer/sub-operator creation.

---

## 10.2 Additional Users

Additional users are created through User Management.

Frontend:

```http
POST /api/v1/mdu/users
```

Backend internally:

```text
1. Validate permission.
2. Create user in OWSEC.
3. Attach user to role.
4. Create/reuse policy profile.
5. Attach policy to current scope.
```

---

## 10.3 Supported User Types

Supported user profiles:

* Customer Admin
* Installer
* NOC
* Read-only
* CSR
* Accounting
* Partner

---

# 11. Node and Venue Model

## 11.1 MDU Node Concept

The frontend uses the abstraction:

```text
Node
```

A node may internally map to:

* OWPROV Entity
* OWPROV Venue

The frontend should not need to know which internal object type is used.

---

## 11.2 Recursive Node Tree

Example:

```text
Customer
 └── Site
      └── Building
           └── Tower
                └── Floor
                     └── Venue
```

The frontend must support variable depth.

Examples:

```text
Customer → Venue
```

```text
Customer → Site → Building → Tower → Floor → Venue
```

---

## 11.3 Node APIs

```text
GET    /api/v1/mdu/nodes
POST   /api/v1/mdu/nodes
GET    /api/v1/mdu/nodes/{nodeId}
GET    /api/v1/mdu/nodes/{nodeId}/children
GET    /api/v1/mdu/nodes/{nodeId}/topology
GET    /api/v1/mdu/nodes/{nodeId}/workspace
```

`GET /api/v1/mdu/nodes/{nodeId}/workspace` may return contextual tabs, summary metrics, and allowed actions for the selected hierarchy node.

---

## 11.4 Hierarchy Workspace Tabs

A selected node may expose:

* Overview
* Topology
* Devices
* Clients
* Maps
* Configurations
* Metrics
* AI Insights

The backend should return only tabs allowed by RBAC and enabled platform capabilities.

---

# 12. Device Management

## 12.1 Device Categories

The Devices module is for infrastructure devices only.

Infrastructure device categories:

* Gateways
* Switches
* Access Points

Clients must not be treated as infrastructure devices in the Devices module.

---

## 12.2 Device Module Structure

Recommended structure:

```text
Devices
 ├── Gateways
 ├── Switches
 ├── Access Points
 ├── Inventory
 ├── Firmware
 ├── Assignments
 └── Connectivity View
```

---

## 12.3 Device Operations

Supported operations:

* Create device
* Assign device
* Move device
* Reboot device
* Upgrade device
* Blink device
* Factory reset
* View contextual topology
* View connectivity topology
* View metrics
* Run AI-assisted diagnostics when permitted

---

## 12.4 Device Connectivity View

Device connectivity topology is an engineering-focused view under:

```text
Devices → Connectivity View
```

It may show:

* Gateway uplinks
* Switch uplinks
* AP uplinks
* Mesh links
* WAN connectivity
* L2/L3 relationships
* Port connectivity
* Logical network graph

This view is intended mainly for NOC, engineering, and advanced troubleshooting roles.

---

## 12.5 Inventory Validation

Backend must validate:

* Device belongs to allowed scope
* Serial number uniqueness
* Configuration scope compatibility
* Contact/location scope compatibility
* Assignment target is inside the user's allowed subtree

---

# 13. Client Management

## 13.1 Client Domain

Clients are end-user/mobile/endpoint devices and should exist as a separate operational domain from infrastructure devices.

Examples:

* Phones
* Laptops
* Tablets
* IoT endpoints
* Printers
* TVs

---

## 13.2 Client Module Structure

Recommended structure:

```text
Clients
 ├── Active Clients
 ├── Historical Clients
 ├── Client Sessions
 ├── Wireless Experience
 ├── Roaming
 ├── Client Analytics
 └── Troubleshooting
```

---

## 13.3 Client Characteristics

Clients are:

* Transient
* Session-oriented
* High-volume
* Analytics-focused
* Wireless-experience-focused

Clients should appear in topology primarily as:

* Counts
* Overlays
* Heatmaps
* Density visualization
* Roaming visualization

Clients should not appear as default topology graph nodes.

---

## 13.4 Client RBAC and Scope

Client visibility must follow the selected hierarchy scope and RBAC rules.

A user can only view clients connected within the user's allowed subtree. Unauthorized clients and client sessions must not appear in lists, searches, topology overlays, AI context, or analytics.

---

# 14. Configuration Management

## 14.1 Configuration Sets

Frontend exposes:

```text
Configuration Set
```

Internally backed by OWPROV DeviceConfiguration.

---

## 14.2 Supported Features

* Create configuration set
* Edit configuration set
* Versioning
* Assign to nodes/devices
* Preview effective configuration
* Rollout configuration
* Rollback configuration
* Staged/phased deployment

---

## 14.3 Rollout Lifecycle States

Supported rollout states:

```text
pending
successful
failed
```

---

## 14.4 Staged/Phased Rollouts

The platform should support staged/phased rollouts.

Example:

```text
Stage 1:
  10 devices

Stage 2:
  100 devices

Stage 3:
  Remaining devices
```

Supported rollout modes:

* Immediate rollout
* Scheduled rollout
* Staged/phased rollout

The rollout UI should support:

* Stage visibility
* Per-stage progress
* Retry actions
* Rollback actions
* Rollout cancellation
* AI-assisted rollout failure explanation when permitted

---

# 15. Billing and Subscription Management

## 15.1 Billing Plan Ownership

Billing plans are owned and managed by parent operators for their direct child customers/sub-operators.

A parent operator may:

* Create billing plans
* Edit billing plans
* Activate/deactivate billing plans
* Assign plans to direct child customers/sub-operators
* Control billing visibility within its subtree
* View subscription status for direct child customers/sub-operators when permitted

A child customer/sub-operator may:

* Log in
* View plans assigned or offered by its parent operator
* Select one eligible active billing plan
* View current subscription/billing status
* Manage billing details according to permissions

A child customer/sub-operator cannot:

* Modify parent-created billing plans
* Create billing plans outside its allowed scope
* View sibling customer subscriptions
* View sibling billing plan assignments
* View parent-private billing plans

---

## 15.2 Billing Plan Model

Operators can create two types of billing plans:

```text
connection_based
fixed_device
```

Plan type behavior:

* `connection_based` plan charges based on the number of connected devices per month.
* `fixed_device` plan assigns a fixed device limit and may be monthly, yearly, or free.

Recommended billing plan structure:

```json
{
  "id": "plan-pro-1",
  "name": "Professional Plan",
  "status": "active",
  "type": "fixed_device",
  "description": "Professional deployment package",
  "features": [
    "500 APs",
    "Topology",
    "Advanced Metrics"
  ],
  "limits": {
    "devices": 500,
    "users": 100
  },
  "billing": {
    "cycle": "monthly",
    "connectionBased": false
  },
  "price": {
    "currency": "USD",
    "amount": 199
  }
}
```

Example connection-based billing plan:

```json
{
  "id": "plan-connection-1",
  "name": "Connection Based Plan",
  "status": "active",
  "type": "connection_based",
  "description": "Monthly billing based on connected devices",
  "features": [
    "Connected device billing",
    "Topology",
    "Basic Metrics"
  ],
  "limits": {
    "devices": null,
    "users": 100
  },
  "billing": {
    "cycle": "monthly",
    "connectionBased": true,
    "pricePerConnectedDevice": 2
  },
  "price": {
    "currency": "USD",
    "amount": 0
  }
}
```

Plan status values:

```text
active
inactive
draft
archived
```

Billing cycle values:

```text
monthly
yearly
free
```

Only active and eligible plans should be selectable by a child customer/sub-operator.

---

## 15.3 Subscription Model

Each customer/sub-operator may have one active billing subscription at a time.

Recommended subscription structure:

```json
{
  "id": "subscription-1",
  "customerId": "customer-a1",
  "planId": "plan-pro-1",
  "status": "active",
  "startedAt": "2026-01-01T00:00:00Z",
  "renewalAt": "2026-02-01T00:00:00Z"
}
```

Subscription states:

```text
active
inactive
pending
suspended
expired
cancelled
```

The UI must clearly show the current subscription state and must prevent selecting more than one active plan at the same time.

---

## 15.4 Billing APIs

Frontend billing APIs:

```http
POST /api/v1/mdu/billing/plans
GET  /api/v1/mdu/billing/plans
GET  /api/v1/mdu/billing/available-plans
POST /api/v1/mdu/billing/subscription/select-plan
GET  /api/v1/mdu/billing/subscription
```

Recommended behavior:

* `POST /api/v1/mdu/billing/plans` creates a fixed-device or connection-based plan within the caller's allowed operator scope.
* `GET /api/v1/mdu/billing/plans` returns plans the caller is allowed to manage or view.
* `GET /api/v1/mdu/billing/available-plans` returns only eligible active plans offered by the parent scope.
* `POST /api/v1/mdu/billing/subscription/select-plan` selects one eligible active plan for the current customer/sub-operator.
* `GET /api/v1/mdu/billing/subscription` returns the current subscription/billing status for the caller's allowed scope.

The frontend should interact only with MDU billing APIs and should not directly access internal billing providers, OWPROV billing internals, payment processors, or backend billing implementation details.

---

## 15.5 Billing RBAC Rules

RBAC behavior:

* Parent operator can create, edit, activate, deactivate, and assign billing plans for direct child operators/customers.
* Child operator can only view available plans from its parent scope.
* Child operator can select one eligible active plan.
* Child operator cannot modify parent-created billing plans.
* Child operator cannot view sibling billing plans or subscriptions.
* Child operator cannot select inactive, suspended, archived, or unauthorized plans.
* Billing plan and subscription APIs must enforce backend authorization even when UI actions are hidden.

---

## 15.6 Billing UI Features

Operator billing UI features:

* Billing plan list
* Create/edit billing plan
* Select billing plan type: connection-based or fixed-device
* Configure connection-based monthly device charge
* Configure fixed-device limit and billing cycle: monthly, yearly, or free
* Activate/deactivate plans
* Assign plans to direct child customers/sub-operators
* Subscription visibility dashboard
* Filter subscriptions by child customer/sub-operator
* View current plan and subscription state for allowed child scopes
* AI-assisted subscription risk summary when permitted

Customer/sub-operator billing UI features:

* Available plan list
* Current subscription view
* Plan selection
* Billing status visibility
* Subscription details
* Clear disabled/hidden state for unauthorized billing actions

---

## 15.7 Billing Scope Isolation

Billing visibility follows subtree isolation rules.

Example:

```text
Operator A
 ├── Customer A1
 └── Customer A2
```

Rules:

```text
Customer A1 cannot view:
  - Customer A2 subscription
  - Customer A2 plan assignments
  - Operator private plans
  - Billing plans outside the parent-approved scope
```

Billing scope resolution must follow the same hierarchy isolation model used throughout the MDU platform.

---

## 15.8 Billing Error and Empty-State UX

Billing screens should handle:

* No available plans
* No active subscription
* Inactive or expired subscription
* Suspended billing status
* Unauthorized plan selection
* Backend 403 permission denial
* Backend 409 conflict when another active subscription already exists
* Fixed-device plan limit exceeded

Recommended messages:

```text
No billing plans are currently available for your account.
```

```text
You do not have permission to manage this billing plan.
```

```text
Only one active billing plan can be selected at a time.
```

```text
This plan does not allow more connected devices.
```

---


# 16. Maps and Topology

## 16.1 Maps Module Purpose

The Maps module is a standalone operational module for managing map assets.

It may include:

* Map list
* Upload map
* Edit map metadata
* Associate map with node/venue/floor
* Manage map visibility

Topology should not be a standalone root sidebar module. Topology should appear as a contextual workspace tab after the user selects a hierarchy node.

```text
Maps = map asset management
Topology = contextual visualization inside a selected hierarchy workspace
```
---

## 16.2 Supported Map Types

The MDU UI map system supports:

* png
* jpg
* jpeg
* svg
* pdf

Unsupported formats:

* dwg
* dxf
* geojson
* advanced GIS/CAD formats

---

## 16.3 Venue Multi-Floor Support

A venue may contain multiple floors/maps.

Example:

```text
Venue
 ├── Floor 1 map
 ├── Floor 2 map
 └── Floor 3 map
```

This supports:

* Apartment deployments
* Hotels
* Office buildings
* Malls
* Campus deployments

---

## 16.4 Coordinate System

Device placement coordinates should support both:

* Normalized coordinates
* Rendered pixel coordinates

Internal storage:

```text
Normalized coordinates (0.0–1.0)
```

Rendering:

```text
Frontend dynamically converts normalized coordinates into pixels.
```

Example:

```json
{
  "x": 0.42,
  "y": 0.67
}
```

Benefits:

* Resolution-independent rendering
* Responsive UI scaling
* Zoom compatibility
* SVG/PDF scaling compatibility
* Multi-device compatibility

---

## 16.5 Device Placement Model

Supported overlay objects:

* Gateways
* Switches
* Access Points
* Client counts
* Client density
* Wireless links
* Uplink/downlink paths
* Venue hierarchy visualization

Recommended placement object:

```json
{
  "deviceId": "ap-1",
  "deviceType": "access-point",
  "x": 0.42,
  "y": 0.67,
  "rotation": 90,
  "status": "online"
}
```

---

## 16.6 Topology Overlay Behavior

Topology overlays should support:

* Complete venue structure visualization
* Device hierarchy visualization
* AP placement
* Switch placement
* Gateway placement
* Client count overlays
* Client density visualization
* Wireless quality visualization
* Online/offline state visualization
* Uplink/downlink visualization
* Interactive device selection
* AI-assisted topology analysis when permitted

---

## 16.7 Map Interaction Features

The frontend should support:

* Zoom in/out
* Pan
* Fit-to-screen
* Floor switching
* Overlay toggles
* Device selection
* Device hover states
* Responsive scaling

---

## 16.8 Topology by Hierarchy Level

Topology behavior should adapt to the selected hierarchy level:

* Site level: building summaries, aggregate health, deployment overview, regional metrics
* Building level: floor structure, distribution switches, AP density, backbone connectivity
* Tower level: floor relationships, AP distribution, tower-level health, aggregation links
* Floor level: floor maps, AP placement, wireless overlays, client density, wireless quality, roaming visualization
* Venue level: detailed operational topology, overlays, client relationships, AP/client behavior, coverage visualization, wireless experience metrics

---

# 17. UI Modules

## 17.1 Dashboard

Dashboard includes:

* Customer count
* Device count
* Client count
* Venue count
* Health summary
* Billing/subscription summary when permitted
* Recent alerts
* Recent rollouts
* AI-generated operational insights when enabled

---

## 17.2 Customers/Sub-Operators

Features:

* List customers
* Create customer/sub-operator
* Edit customer
* Suspend customer
* Delete customer
* Navigate subtree
* View customer health summary
* Generate customer health summary using AI when permitted

---

## 17.3 Hierarchy

The Hierarchy module is the primary operational subtree navigation workspace.

Features:

* Recursive hierarchy tree
* Node detail
* Node hierarchy
* Selected-scope context
* Contextual workspace tabs
* Overview tab
* Topology tab	
* Effective configuration tab
* Metrics tab
* AI Insights tab when enabled

---

## 17.4 Devices

Features:

* Gateway management
* Switch management
* Access point management
* Inventory
* Firmware
* Assignments
* Device actions
* Device metrics
* Connectivity View
* AI-assisted device diagnostics when enabled

---

## 17.5 Clients

Features:

* Active clients
* Historical clients
* Client sessions
* Wireless experience
* Roaming visibility
* Client analytics
* Troubleshooting
* Client overlays in topology

---

## 17.6 Configurations

Features:

* Configuration sets
* Templates
* Overrides
* Rollouts
* Assignment management
* Effective configuration preview

---

## 17.7 Rollouts

Features:

* Rollout list
* Rollout detail
* Immediate rollout
* Scheduled rollout
* Staged/phased rollout
* Per-stage progress
* Retry/rollback/cancel actions
* AI-assisted rollout failure explanation when permitted

---

## 17.8 Maps

Features:

* Map list
* Upload map
* Edit map metadata
* Associate map with node/venue/floor
* Visibility management
* Map preview

---

## 17.9 Billing

Features:

* Billing plan management
* Subscription management
* Plan selection
* Billing status visibility
* Parent-child plan assignment
* Subscription visibility dashboard
* Billing RBAC behavior
* AI-assisted subscription risk summary when enabled

---

## 17.10 Users

Features:

* User list
* Create user
* Assign permission profile
* Suspend user
* Reset password
* Manage sessions
* View role/scope assignment summary

---

## 17.11 Metrics

Features:

* Device health
* Client health
* Traffic
* Wireless quality
* Client metrics
* Billing/subscription metrics when permitted
* Rollout progress
* Hierarchy-scoped metric filtering

---

## 17.12 AI Agent

Features:

```text
AI Agent
 ├── Ask Anything
 ├── Investigations
 ├── Recommendations
 ├── Automations
 ├── Playbooks
 └── Agent Activity
```

The AI Agent must remain RBAC-aware and scope-aware.

---

## 17.13 Administration

Features:

* Platform settings
* Operator administration
* Permission profile administration
* Audit views
* Advanced/debug views when permitted

---

# 18. RBAC UX Behavior

## 18.1 Hidden vs Disabled Actions

The UI should primarily use hidden actions for unauthorized operations.

Behavior:

```text
If user lacks permission:
  hide action completely
```

Examples:

* Delete buttons hidden
* Create customer hidden
* Rollout actions hidden
* Billing plan create/edit hidden
* User management hidden
* AI action hidden when the AI context would include unauthorized data

The frontend must still rely on backend authorization validation.

---

## 18.2 Permission Denied UX

If backend denies an operation:

```text
403 Forbidden
```

The UI should:

* Show contextual permission-denied message
* Preserve current screen state
* Avoid redirect loops
* Avoid blank/error-only screens

Recommended message:

```text
You do not have permission to perform this action within the current scope.
```

---

## 18.3 Scoped Dropdown Behavior

All hierarchy/resource dropdowns must only load resources from the user's allowed subtree.

Examples:

* Venue selector
* Node selector
* User assignment selector
* Device assignment selector
* Configuration assignment selector
* Billing plan assignment selector
* Subscription customer selector
* AI context selector

Behavior:

```text
Only allowed subtree items are returned.
Unauthorized resources are never shown.
```

---

## 18.4 Subtree Switching UX

The platform should support both:

* Persistent hierarchy-tree navigation
* Breadcrumb/dropdown subtree switching
* Top context bar selected-scope switching

Desktop behavior:

* Operational left sidebar
* Collapsible hierarchy tree where appropriate
* Top context bar
* Breadcrumb synchronization
* Context-aware navigation

Mobile/tablet behavior:

* Collapsed operational navigation
* Collapsed hierarchy drawer
* Breadcrumb navigation
* Dropdown subtree switcher

Navigation state must remain synchronized across:

* Hierarchy tree
* Breadcrumbs
* Top context bar
* Route context
* Selected subtree
* Operational workspace

---

## 18.5 RBAC for AI

AI prompts, recommendations, and automation plans must only use data from the user's allowed scope.

AI must not:

* Expose sibling subtree information
* Expose unauthorized billing data
* Expose unauthorized device inventory
* Expose unauthorized client sessions
* Recommend actions outside the user's allowed scope

AI-generated operational actions should follow:

```text
AI Suggestion
 → Review Plan
 → Approve Action
 → Execute Workflow
 → Track Result
```

---

# 19. Role-Based Navigation

## 19.1 Root Admin

Can access:

* Operators
* All customers
* All subtrees
* Global metrics
* Platform administration
* Billing administration where permitted
* AI Agent where enabled

---

## 19.2 Operator Admin

Can access:

* Own operator subtree
* Direct and nested child customers/sub-operators when permitted
* Hierarchy
* Devices
* Clients
* Users
* Configuration
* Rollouts
* Maps
* Billing plans and subscriptions for allowed child scopes
* Metrics
* AI Agent/contextual AI actions when enabled

Cannot access:

* Another operator subtree
* Unauthorized sibling/parent scopes
* Billing data outside allowed scope

---

## 19.3 Customer/Sub-Operator Admin

Can access:

* Own subtree
* Child customers/sub-operators when permitted
* Own users
* Own devices
* Own clients
* Own venues
* Own configurations
* Own maps
* Available billing plans from parent scope
* Own subscription status
* AI Agent/contextual AI actions when enabled and scoped

Cannot access:

* Parent resources unless explicitly allowed
* Sibling subtrees
* Parent-private billing plans
* Sibling billing plans or subscriptions
* Unauthorized AI context

---

## 19.4 Installer

Can access limited operational workflows based on permission profile, usually:

* Assigned hierarchy scopes
* Device installation/assignment
* Maps/topology views needed for installation
* Limited device actions

Cannot access billing or administrative user management unless explicitly granted.

---

## 19.5 NOC

Can access operational monitoring and troubleshooting workflows based on permission profile, usually:

* Devices
* Clients
* Metrics
* Rollouts
* Connectivity View
* Contextual AI diagnostics when enabled

Cannot manage billing plans unless explicitly granted.

---

## 19.6 Read-only

Can view allowed data within assigned scope.

Cannot create, update, delete, assign, select billing plans, execute device actions, or approve AI-generated workflow actions.

---

# 20. API Design Philosophy

## 20.1 Frontend Uses Only MDU APIs

Frontend should use:

```text
/api/v1/mdu/*
```

Frontend should not directly call:

* OWPROV entity APIs
* OWPROV venue APIs
* OWPROV role APIs
* OWPROV policy APIs
* Internal billing provider APIs
* Internal AI provider APIs

Authentication APIs are the only exception.

---

## 20.2 Response Format

Recommended response format:

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

---

## 20.3 Scoped API Behavior

All MDU APIs should resolve scope from:

* Authenticated user
* Selected hierarchy context
* Route/resource parameters
* Backend RBAC rules

Unauthorized resources should not be returned in API responses.

---

## 20.4 Navigation Bootstrap API

The frontend should be able to bootstrap allowed navigation and default selected scope after login.

Recommended API:

```http
GET /api/v1/mdu/bootstrap
```

Recommended response includes:

* User summary
* Allowed modules
* Default selected scope
* Allowed hierarchy roots
* Feature flags
* Role/permission summary

---

# 21. UI Technology Expectations

Recommended stack:

* React
* TypeScript
* TailwindCSS
* TanStack Query
* Zustand or Context API
* React Router
* OpenAPI-generated API clients

---

# 22. Recommended Frontend Structure

```text
src/
 ├── app/
 ├── api/
 ├── auth/
 ├── components/
 ├── layouts/
 ├── navigation/
 ├── hierarchy/
 ├── pages/
 ├── modules/
 │    ├── dashboard/
 │    ├── customers/
 │    ├── hierarchy/
 │    ├── devices/
 │    ├── clients/
 │    ├── configurations/
 │    ├── rollouts/
 │    ├── maps/
 │    ├── billing/
 │    ├── users/
 │    ├── metrics/
 │    ├── ai-agent/
 │    └── administration/
 ├── hooks/
 ├── state/
 ├── types/
 ├── routes/
 ├── utils/
 └── styles/
```

---

# 23. Security and Session Behavior

## 23.1 Token Storage

Recommended token handling:

```text
Access token:
  stored in memory only

Refresh token:
  stored in secure HttpOnly cookie
```

The frontend should avoid storing long-lived tokens in localStorage.

---

## 23.2 Session Lifetime

Session configuration:

```text
Access token lifetime:
  15 minutes

Refresh token lifetime:
  7 days

Idle timeout:
  30 minutes

Absolute session timeout:
  12 hours
```

---

## 23.3 Refresh Behavior

Behavior:

```text
1 automatic refresh retry
```

If refresh fails:

```text
- clear local session state
- synchronize logout across tabs
- redirect to login page
```

---

## 23.4 Multi-Tab Session Synchronization

If logout/session expiry occurs in one tab:

```text
all tabs must logout automatically
```

---

## 23.5 CSRF/CORS Assumptions

Frontend assumes:

* OWSEC supports secure CORS configuration
* Refresh cookie uses Secure + HttpOnly + SameSite protections
* Backend APIs validate bearer tokens
* Session refresh endpoints are CSRF-protected when cookies are used

---

## 23.6 Audit Logging

The platform should support backend audit logging for:

* Login/logout
* Customer creation
* User creation
* Role changes
* Rollouts
* Configuration changes
* Device actions
* Billing plan changes
* Subscription changes
* AI-generated recommendation approvals/actions
* Permission failures

---

# 24. Acceptance Requirements

## 24.1 Authentication

Acceptance checks:

* User can login directly through OWSEC.
* User can refresh session without MDU backend.
* Logout propagates across all browser tabs.
* Session expiry redirects user to login.
* Invalid refresh token clears session state.

---

## 24.2 Scope Isolation

Acceptance checks:

* Customer admin cannot see sibling customer in node tree.
* Customer admin cannot assign device outside subtree.
* Customer admin cannot view clients outside subtree.
* Customer admin cannot load unauthorized venues in dropdowns.
* Customer admin cannot view parent subtree unless explicitly allowed.
* Unauthorized resources never appear in dropdown/search responses.

---

## 24.3 RBAC Behavior

Acceptance checks:

* Unauthorized actions are hidden.
* Backend 403 responses show contextual permission messages.
* Navigation updates according to subtree context.
* Role changes update visible navigation/actions after refresh.
* AI actions are hidden when user lacks required scope or permission.

---

## 24.4 Backend Outage Behavior

Acceptance checks:

* Login/logout continues while MDU backend is unavailable.
* UI shell/navigation still renders.
* Data pages show service unavailable state.
* Retry button is available.
* UI performs automatic retry attempts.
* No stale/cached business data is displayed unless clearly marked and allowed.

---

## 24.5 Information Architecture and Navigation

Acceptance checks:

* Left sidebar contains only operational modules.
* Top context bar shows the selected hierarchy scope.
* Hierarchy tree, breadcrumbs, selected subtree, route context, and workspace context remain synchronized.
* Selecting a hierarchy node updates all scoped modules.
* Desktop layouts support recursive hierarchy navigation.
* Mobile layouts support subtree switching.
* Selected subtree persists during route navigation.
* Topology does not appear as a standalone root sidebar module.

---

## 24.6 Maps and Topology

Acceptance checks:

* Multi-floor venue maps render correctly.
* Device overlays scale correctly during zoom.
* Device coordinates remain accurate after resize.
* Topology renders as a contextual tab for the selected hierarchy node.
* Venue topology is the default topology experience.
* Device connectivity topology is available from Devices → Connectivity View for permitted roles.
* Supported map types upload successfully.

---

## 24.7 Devices and Clients

Acceptance checks:

* Devices module shows infrastructure devices only.
* Clients module exists separately from Devices.
* Clients appear in topology as counts, overlays, heatmaps, density, or roaming visualization.
* Clients do not appear as default topology graph nodes.
* Client visibility follows subtree and RBAC rules.

---

## 24.8 Rollouts

Acceptance checks:

* Rollout supports staged deployment.
* Rollout states update correctly.
* Failed rollout displays actionable status.
* Rollback actions are visible after failure.
* Stage progress is visible in UI.
* AI can explain rollout failure only when enabled and authorized.

---

## 24.9 Billing and Subscription Management

Acceptance checks:

* Parent operator can create billing plans.
* Parent operator can assign billing plans to direct child customers/sub-operators.
* Child customer can only view plans from parent scope.
* Child customer cannot modify parent-created plans.
* Child customer cannot view sibling subscriptions.
* Customer can select one active billing plan.
* Subscription state updates correctly in UI.
* Unauthorized billing resources never appear in API responses.
* AI subscription risk summaries do not include unauthorized billing data.

---

## 24.10 AI Agent and Contextual AI

Acceptance checks:

* AI Agent appears as a module only for authorized users.
* Contextual AI actions appear only where supported and authorized.
* AI uses the selected hierarchy scope as context.
* AI does not expose sibling subtree data.
* AI does not expose unauthorized billing, device, or client data.
* AI-generated operational plans remain reviewable/editable before execution.

---

# 25. Future Backend Alignment

Current UI specification is intentionally backend-abstraction-first.

As the MDU backend API evolves:

* openapi.yaml will be aligned with production contracts
* screens.yaml bindings will be updated
* validation rules will be tightened
* metrics schemas will be finalized
* rollout APIs will be finalized
* billing APIs will be finalized
* client analytics APIs will be finalized
* AI Agent APIs and approval workflows will be finalized if enabled

The frontend architecture should remain stable because it already abstracts OWPROV internals behind MDU APIs and separates operational navigation from hierarchy scope navigation.

---

# 26. Final Summary

The MDU platform is a recursive multi-tenant management system.

Core principles:

```text
Frontend directly authenticates through OWSEC.
Frontend uses only MDU business APIs.
MDU backend orchestrates OWSEC + OWPROV.
OWPROV remains source of truth for hierarchy and RBAC.
Customer/sub-operator hierarchy is recursive.
Each subtree is isolated.
Frontend uses business abstractions instead of OWPROV internals.
Operational navigation is separate from hierarchy scope navigation.
Topology is a contextual hierarchy view, not a root sidebar module.
Devices and clients are separate operational domains.
AI remains RBAC-aware and scope-aware.
```

The resulting UI provides:

* Multi-tenant administration
* Recursive customer/sub-operator management
* Hierarchy-first navigation
* Top context bar selected-scope model
* Contextual hierarchy workspaces
* Venue and device management
* Separate client management
* Configuration and rollout management
* Billing and subscription management
* Contextual maps and topology
* Device connectivity topology for advanced troubleshooting
* AI Agent and contextual AI workflows
* RBAC-aware navigation
* Secure tenant isolation
* Scalable hierarchical management
* Stable frontend architecture independent of OWPROV internals

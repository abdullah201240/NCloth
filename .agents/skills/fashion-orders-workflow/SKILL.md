---
name: fashion-orders-workflow
description: >-
  Workflows, UI components, and state management for fashion e-commerce order processing, luxury packaging, VIP client tags, fulfillments, returns, and exchanges.
---

# Fashion Order Fulfillment & Clienteling Workflow

Use this skill when developing order management tables, order detail slide-overs, return authorization (RMA), and VIP customer relationship features.

## 1. Fashion Order States & Status Flow

```
[Received] ──> [Processing] ──> [Quality Check / Packaging] ──> [Dispatched] ──> [Delivered]
     │                                                                 │
     └──> [Cancelled / Refunded]                                       └──> [Return Requested / Exchanged]
```

### Visual Status Badges
* **Pending Verification**: Amber subtle badge (`bg-amber-500/10 text-amber-600`)
* **Quality Checked & Packed**: Sky blue subtle badge (`bg-sky-500/10 text-sky-600`)
* **In Transit / Shipped**: Indigo subtle badge (`bg-indigo-500/10 text-indigo-600`)
* **Delivered**: Emerald subtle badge (`bg-emerald-500/10 text-emerald-600`)
* **Return In-Inspection**: Purple subtle badge (`bg-purple-500/10 text-purple-600`)
* **Refunded**: Zinc subtle badge (`bg-zinc-500/10 text-zinc-600`)

---

## 2. Luxury Clienteling UI Features

Fashion e-commerce requires tracking high-value VIP customers and custom gift packaging:

1. **VIP Client Indicators**:
   * Badges: `VIP Tier 1` ($5k+ lifetime value), `Private Client` ($20k+ lifetime value).
   * Display lifetime spend, total orders, and favorite sizes/categories directly in the order drawer.

2. **Packaging & Personalization Directives**:
   * Highlight order notes: "Monogram initial: *A.S.*", "Luxury Gift Box & Ribbon", "Handwritten Greeting Card".

3. **Size Exchange & Return Workflow**:
   * Quick-action button: "Initiate Size Exchange (e.g., Size M -> Size L)" with automated inventory reservation.
   * Return reason categorization: "Fit: Too Large", "Fit: Too Small", "Color Mismatch", "Fabric Hand-Feel".

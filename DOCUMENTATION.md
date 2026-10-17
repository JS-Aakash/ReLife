# ReLife System Architecture & Technical Documentation

This document provides a comprehensive technical reference for the **ReLife Digital Product Passport (DPP)** platform. It outlines the architectural patterns, database schemas, cryptographic provenance models, AI pipelines, and operational standards implemented across the application.

---

## 1. System Overview & Architectural Paradigm

ReLife is engineered as a high-integrity, reactive digital twin platform for physical assets (consumer electronics, professional tools, micro-mobility, and appliances). It addresses the core failure modes of the modern circular economy: **information asymmetry**, **missing service records**, **unverifiable second-hand claims**, and **premature e-waste disposal**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Physical World Layer                          │
│     [Hardware Asset] ──── (QR Sticker / NFC Hardware Tag)             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Optical / NFC Tap
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Client Application Tier                          │
│  Next.js 16 (Turbopack, Server & Client Components, Responsive UI)     │
│                                                                        │
│  ┌───────────────────────┐                  ┌────────────────────────┐ │
│  │ Private Vault Access  │                  │ Public Safe Inspection │ │
│  │ (/products/[id])      │                  │ (/passport/[publicId]) │ │
│  └──────────┬────────────┘                  └───────────┬────────────┘ │
└─────────────┼───────────────────────────────────────────┼──────────────┘
              │ Authenticated (Session)                   │ Public Safe
              ▼                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Application Logic Services                       │
│  • Health Score Engine (Factor Breakdown & Life Extension Calculus)    │
│  • Product Time Machine (Chronological Event Aggregator & Scrubber)    │
│  • Warranty Rescue Engine (Evidence Auditor & Statutory Claim Builder) │
│  • Resale Valuation & Custody Transfer Protocol                        │
└─────────────┬───────────────────────────────────────────┬──────────────┘
              │                                           │
              ▼                                           ▼
┌───────────────────────────────────┐       ┌────────────────────────────┐
│      Google Gemini AI Engine      │       │     Supabase PostgreSQL   │
│  • Multimodal Invoice OCR         │       │  • Row-Level Security (RLS)│
│  • Diagnostic Reasoning Copilot   │       │  • Encrypted Storage Vault │
│  • Model Fallback Waterfall       │       │  • User Persona Isolation  │
└───────────────────────────────────┘       └────────────────────────────┘
```

---

## 2. Directory Structure & App Router Hierarchy

```
src/
├── app/
│   ├── analytics/               # Sustainability & aggregate environmental impact
│   ├── api/ai/
│   │   ├── copilot/route.ts     # Gemini Repair vs. Replace diagnostic API
│   │   └── scan-invoice/route.ts# Gemini Multimodal OCR invoice extraction API
│   ├── auth/                    # Dedicated auth portal
│   ├── copilot/                 # Interactive Repair vs. Replace AI Copilot
│   ├── dashboard/               # Custodian Command Center & Fleet Overview
│   ├── login/                   # Streamlined authentication view
│   ├── passport/[publicId]/     # Public-safe verification profile (QR/NFC target)
│   ├── products/
│   │   ├── [id]/
│   │   │   ├── page.tsx         # Full Product Passport detail view
│   │   │   ├── repair/page.tsx  # Maintenance entry submission workflow
│   │   │   └── time-machine/    # Full-screen standalone Time Machine
│   │   └── new/page.tsx         # Asset registration & AI OCR intake
│   ├── profile/                 # Custodian security settings & persona management
│   ├── reminders/               # Preventative maintenance schedules & alarms
│   ├── resale/[publicId]/       # Smart Resale Passport & evidence coverage report
│   ├── technician/              # Licensed Service Provider Intake Portal
│   ├── transfer/[token]/        # Cryptographic chain-of-custody transfer receiver
│   └── warranty-rescue/         # Warranty claim compilation & PDF package builder
├── components/
│   ├── auth/                    # AuthModal, ProtectedRoute, PersonaSwitcher
│   ├── layout/                  # Responsive Navbar, NotificationDropdown, Footer
│   ├── passport/                # ProductTimeMachine, RepairTimeline, DocumentVault,
│   │                            # DPPCertificateModal, ResaleValuationWidget
│   ├── scanner/                 # HardwareScannerModal, InvoiceScannerModal
│   └── ui/                      # HealthGauge, Badges, QRCard, Modals
└── lib/
    ├── ai-service.ts            # Google Gemini SDK integration & fallbacks
    ├── auth-personas.ts         # Multi-persona profiles (Owner, Fleet, Technician)
    ├── calculations.ts          # Health score, warranty countdowns, depreciation
    ├── initial-data.ts          # Seed data with rich physical hardware lifecycles
    ├── store.tsx                # Hybrid Supabase/LocalStorage reactive state store
    ├── supabase.ts              # Supabase Cloud Client initialization
    ├── types.ts                 # Full TypeScript domain model definitions
    └── utils.ts                 # Currency formatters, date utilities, class helpers
```

---

## 3. Data Models & TypeScript Specifications

### 3.1 Product Domain Model
```typescript
export interface Product {
  id: string;
  publicId: string; // Unguessable UUID (e.g., "rl-macbook-pro-16-c02g")
  userId?: string;  // Bound to Supabase auth.users.id
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  category: ProductCategory;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: string; // ISO 8601 YYYY-MM-DD
  seller: string;
  warrantyMonths: number;
  warrantyExpiryDate: string;
  condition: ProductCondition;
  imageUrl: string;
  description?: string;
  
  // Health & Environmental Metrics
  healthScore: number; // 0 - 100
  healthBreakdown: HealthScoreBreakdown;
  eWasteAvoidedKg: number;
  carbonAvoidedKg: number;
  estimatedUsefulLifeRemainingYears: number;
  originalLifespanYears: number;

  // Relational Collections
  documents: DocumentItem[];
  repairs: RepairRecord[];
  ownershipHistory: OwnershipMilestone[];
  
  // Privacy & Secondary Disclosure Rules
  resaleDisclosure: ResaleDisclosureSettings;
  status: 'active' | 'in_repair' | 'transferred' | 'archived';
  isPubliclyShared: boolean;
  
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 Service & Repair Record Model
```typescript
export interface RepairRecord {
  id: string;
  productId: string;
  date: string;
  issueSummary: string;
  symptoms?: string;
  diagnosis?: string;
  technicianOrShopName: string;
  serviceProviderId?: string;
  cost: number;
  partsReplaced?: {
    name: string;
    partNumber?: string;
    cost: number;
  }[];
  warrantyClaim: boolean;
  verificationBadge: 'technician-verified' | 'document-backed' | 'owner-reported';
  verificationDetails?: {
    verifiedBy: string;
    shopName?: string;
    shopAddress?: string;
    technicianLicense?: string;
    verifiedAt: string;
    verificationNotes?: string;
  };
  usefulLifeExtensionMonths: number;
  receiptDocumentId?: string;
  photos?: string[];
  ownerApproved: boolean;
  notes?: string;
  createdAt: string;
}
```

---

## 4. Product Time Machine Engine

The Product Time Machine (`ProductTimeMachine`) is a core lifecycle feature designed to visualize the entire chronological biography of a physical device.

```
(Inception) ───► (Warranty Expiry) ───► (Fault Logged) ───► (Certified Repair) ───► (Present Telemetry)
   100%                 95%                  78%                  94%                  94%
```

### 4.1 Chronological Event Pipeline
The Time Machine normalizes heterogeneous data sources into a unified chronological array:
1. **Inception Event:** Generated from `product.purchaseDate`, initial purchase invoice document, baseline health score (100%), and original retailer information.
2. **Warranty Milestones:** Synthesized from `product.warrantyExpiryDate`, distinguishing active coverage windows from expired status.
3. **Anomalies & Faults:** Ingests `repair.symptoms` with an empirical prior timestamp reflecting user defect observation prior to workshop intake, applying a temporary health delta (-16%).
4. **Certified Service Interventions:** Ingests `repair` records, itemizing replaced OEM components, part numbers, technician license numbers, and lifetime restoration increments (+16%).
5. **Chain-of-Custody Transfers:** Sourced from `product.ownershipHistory`, verifying non-repudiation while protecting confidential transaction prices.
6. **Present-Day Health Node:** Reflects current real-time telemetry, active environmental impact (kg CO₂e, kg e-waste avoided), and maintenance reminders.

### 4.2 Interactive Scrubber & Animated Playback
- **Timeline Range Slider:** Enables users to scrub through discrete time steps to observe how the device degraded and recovered.
- **Auto-Playback:** Iterates through milestones using a deterministic 1200ms timer, dynamically updating the health score line trajectory and inspector drawer.

---

## 5. Warranty Rescue & Evidence Audit Engine

The Warranty Rescue system (`/warranty-rescue`) automates the compilation of formal, manufacturer-compliant warranty claim packages.

### 5.1 Evidence Readiness Audit Algorithm
When a user begins a claim for any registered product, the system audits the vault:

$$\text{Claim Strength Score} = W_{\text{inv}} + W_{\text{sn}} + W_{\text{diag}} + W_{\text{photo}}$$

Where:
- $W_{\text{inv}} = 35\text{ pts}$ if a verified retail invoice (`fileType === 'invoice'` or `isVerifiedReceipt === true`) exists.
- $W_{\text{sn}} = 25\text{ pts}$ if a validated serial number ($\ge 4\text{ chars}$) is documented.
- $W_{\text{diag}} = 20\text{ pts}$ if the user provides technical fault observations ($\ge 30\text{ chars}$).
- $W_{\text{photo}} = 20\text{ pts}$ if photographic defect evidence is attached.

### 5.2 Manufacturer Route Directory
The system automatically maps manufacturer names to statutory service endpoints:
- **Apple:** `applecare-support@apple.com`
- **Specialized Bicycles:** `ridercare@specialized.com`
- **Fluke Industrial:** `service.desk@fluke.com`
- **Dyson Appliances:** `help@dyson.com`
- **Dell Technologies:** `prosupport@dell.com`
- **Sony Electronics:** `support.electronics@sony.com`
- **Weller Tools:** `weller-service@apex-tools.com`

### 5.3 Legal Integrity & Statutory Notice
To avoid regulatory liability, the engine enforces strict statutory language:
> *ReLife compiles verifiable hardware telemetry, authentic purchase receipts, and statutory claim drafts. ReLife is not a warranty underwriter or claims adjuster; final warranty eligibility and repair coverage are determined solely by the manufacturer or authorized service provider under applicable commercial or statutory guarantees.*

---

## 6. Health Score Calculation & Life Cycle Analysis (LCA)

### 6.1 Formula Breakdown
The ReLife Health Score $H \in [0, 100]$ is computed deterministically from four transparent factors:

$$H = F_{\text{age}} + F_{\text{prov}} + F_{\text{stab}} + F_{\text{econ}}$$

1. **Service Age & Consumption ($F_{\text{age}} \in [0, 25]$):**
   $$F_{\text{age}} = \max\left(5, 25 \times \left(1 - \frac{\text{Age}_{\text{years}}}{\text{Lifespan}_{\text{baseline}} + \sum \Delta_{\text{extension}}}\right)\right)$$
2. **Repair Provenance Quality ($F_{\text{prov}} \in [0, 25]$):**
   Rewards verified technician service records (10 pts per certified repair) and document-backed entries (5 pts).
3. **Fault Recurrence & Stability ($F_{\text{stab}} \in [0, 25]$):**
   Penalizes rapid consecutive failures occurring within 90 days.
4. **Cost-to-Value Sustainability Ratio ($F_{\text{econ}} \in [0, 25]$):**
   Measures cumulative repair expenses relative to original acquisition cost, incentivizing timely preventative servicing.

### 6.2 Life Cycle Analysis (LCA) Benchmarks
Avoided e-waste and diverted CO₂ emissions are computed based on standardized IEEE and EPA lifecycle studies:
- **Laptops / Workstations:** 2.1 kg e-waste, 240 kg embodied CO₂e.
- **Smartphones:** 0.18 kg e-waste, 72 kg embodied CO₂e.
- **Bicycles / Mobility:** 12.5 kg landfill mass, 180 kg manufacturing CO₂e.
- **Major Appliances:** 18.0 kg hazardous waste, 350 kg embodied CO₂e.

---

## 7. Google Gemini AI Multi-Model Vision Pipeline

### 7.1 Architecture
The OCR and diagnostic copilot use the Google GenAI SDK with a resilient multi-model fallback cascade:

```
[Incoming Payload] 
       │
       ▼
[Gemini 3.1 Flash Lite] ──(Quota / Error)──► [Gemini 3.6 Flash] ──(Fallback)──► [Deterministic Heuristic Engine]
```

### 7.2 Safety Interlocks
The diagnostic prompt explicitly monitors for physical hardware hazards:
- **Thermal Runaway / Lithium Swelling:** Immediately instructs users to stop charging and isolate devices with bulging enclosures.
- **High-Voltage Hazards:** Warns against opening SMPS power supplies, CRT anodes, or inverter assemblies.
- **Brake System Safety:** Mandates torque checks and hydraulic line bleeding verification before road operation.

---

## 8. Database Architecture & Row-Level Security (RLS)

### 8.1 PostgreSQL Tables
- `products`: Core asset attributes, serials, and health metadata.
- `repairs`: Service history, replaced components, costs, and technician seals.
- `documents`: Uploaded invoices, diagnostic PDFs, and inspection certificates.
- `ownership_history`: Historical custody handshakes.
- `maintenance_reminders`: Scheduled maintenance tasks.
- `service_providers`: Verified technician workshop credentials.

### 8.2 Strict User Isolation Policies
Every query on private tables is protected by Supabase Row-Level Security (RLS):

```sql
-- Enforce user data isolation
CREATE POLICY "Users can only view their own products" 
ON products FOR SELECT 
USING (auth.uid() = user_id OR is_publicly_shared = true);

CREATE POLICY "Users can only view their own documents" 
ON documents FOR SELECT 
USING (auth.uid() = user_id);
```

Public QR scans only have access to non-sensitive columns through sanitized public RPC functions or public passport views (`isPubliclyShared = true`), ensuring purchase prices and personal identifiers are never transmitted over the wire.

---

## 9. Production Deployment Guide

### Vercel Deployment
1. Import repository on [Vercel](https://vercel.com).
2. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Cloud project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Cloud public anon key.
   - `GEMINI_API_KEY`: Google Gemini API key.
3. Build command: `npm run build` (Next.js App Router).

### Local Validation
```bash
npm run build
npm run start
```
All routes must compile statically or dynamically with 0 TypeScript and ESLint errors.

# ReLife — Living Digital Product Passport & Lifecycle Preservation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Multimodal_Vision-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Compliance](https://img.shields.io/badge/EU_ESPR-DPP_Compliant-gold?style=for-the-badge)](https://commission.europa.eu/)

> **Turn disposable hardware into repairable heirlooms.**  
> ReLife empowers manufacturers, certified repair technicians, and hardware owners with permanent, tamper-evident Digital Product Passports (DPP). By capturing verified service history, OEM component refreshes, and lifetime ownership transfers, ReLife eliminates asymmetric information in secondary markets, unlocks warranty claims, and preserves real economic value across the physical circular economy.

---

## ⚡ Standout Platform Features

### 1. Living Digital Product Passport (DPP)
- **Physical-to-Digital Twin:** Every registered asset receives an unguessable cryptographic token linked to a scannable QR code and simulated NFC hardware tag.
- **Dual-Surface Privacy Architecture:** 
  - **Private Custodian Vault (`/products/[id]`):** Accessible only by the authenticated owner. Contains raw purchase bills, tax receipts, technician invoices, and warranty documents.
  - **Public Safe Profile (`/passport/[publicId]`):** Safe for any third-party or second-hand buyer to inspect. Invoices, personal names, phone numbers, and payment details are strictly redacted while preserving verifiable repair pedigree.
- **EU ESPR Certificate Generator:** One-click export of official Digital Product Passport certificates compliant with EU Ecodesign for Sustainable Products Regulations.

### 2. Product Time Machine (`/products/[id]/time-machine`)
- **Full-Lifespan Interactive Timeline:** A cinematic, chronological scrubber that maps an asset's entire biography from initial retail purchase to present-day telemetry.
- **Animated Playback Engine:** Play through the journey of the hardware to watch health score drops during component failures and instant recovery spikes after certified service interventions.
- **Deep Node Inspector:** Inspect specific replacement parts (with OEM part numbers), certified workshop credentials, diagnostic notes, associated receipts, and SHA-256 provenance hashes.
- **Provenance Filters:** Instant filtering across certified repairs, warranty milestones, and ownership handshakes.

### 3. Warranty Rescue Engine (`/warranty-rescue`)
- **Automated Evidence Audit:** Ingests receipts, serial numbers, fault symptoms, and uploaded photo proofs to calculate an empirical **Claim Strength Score (0–100%)**.
- **Missing Document Identification:** Identifies statutory documentation gaps (e.g., missing proof of purchase, unrecorded serial plates, insufficient technical symptoms) before submitting to manufacturers.
- **Official Claim Dossier Generator:** Crafts formal, legally compliant warranty claims routed directly to manufacturer support desks (AppleCare, Specialized Rider Care, Fluke Service, Dyson, Dell ProSupport, Sony, Weller).
- **1-Click PDF & Email Dispatch:** Exports an official, print-ready claim dossier complete with QR verification stamp and owner affirmation signature bar, or opens directly in native email clients via pre-formatted `mailto:` dispatch.
- **Statutory Claim Disclaimers:** Explicitly separates verified factual purchase records from user-reported defect observations to maintain complete legal integrity.

### 4. Repair vs. Replace AI Copilot (`/copilot`)
- **Multimodal Failure Diagnosis:** Powered by Google Gemini AI to analyze user-described symptoms, strange mechanical noises, error codes, and thermal anomalies.
- **Hazard & Safety Interlocks:** Immediately identifies hazardous scenarios, such as swollen lithium-ion cells, high-voltage capacitor charges in power supplies, or hydraulic brake fluid leaks.
- **Financial & Ecological ROI:** Compares the cost of independent/authorized repairs against outright replacement, calculating both net dollar savings and kilograms of avoided landfill mass.

### 5. Explainable Health & Maintainability Index
- **Transparent Scoring (0–100):** Unlike arbitrary black-box rating algorithms, ReLife's health gauge exposes four auditable factor weights:
  1. *Service Age & Lifespan Consumption* (0–25 pts)
  2. *Repair Provenance & Documentation* (0–25 pts)
  3. *Fault Recurrence & Component Stability* (0–25 pts)
  4. *Cost-to-Value Economic Ratio* (0–25 pts)
- **Dynamic Restoration:** Every certified repair logs an estimated useful life extension in months, actively restoring the health index toward factory baseline.

### 6. Three-Tier Trust & Provenance Seals
Every service entry in the ledger carries an auditable badge:
- 🛡️ **Technician Verified:** Submitted directly through the Certified Technician Portal (`/technician`) and signed by licensed master technicians.
- 📄 **Document Backed:** Verified by uploaded optical tax invoices, service work orders, and parts receipts.
- 👤 **Owner Reported:** Self-logged maintenance and DIY care (e.g. cleaning, lubrication, pad swaps).

### 7. Smart Resale Valuation & Chain of Custody Handshake
- **Dynamic Valuation Index:** Analyzes original retail price, age, current health tier, and maintenance provenance to compute an evidence-backed second-hand valuation.
- **Cryptographic Transfer of Custody (`/transfer/[token]`):** Enables sellers to transfer permanent digital ownership to buyers via secure one-time tokens, passing down living maintenance histories while keeping historical personal bills locked.

### 8. AI Bill & Optical Invoice Scanner
- **Zero-Friction Asset Onboarding:** Drop any PDF invoice, store receipt, or retail snapshot. ReLife's OCR pipeline extracts brand, model, serial number, purchase price, currency, merchant, and warranty duration with interactive validation before passport registration.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack, Server Components) |
| **Language & Typing** | TypeScript 5 (Strict Mode, 100% Type-Safe) |
| **UI & Styling** | Vanilla Tailwind CSS (Custom Industrial Dark/Emerald Design System) |
| **Icons & Visuals** | Lucide React, HTML5 Canvas QR Generator |
| **Authentication & RLS** | Supabase Auth with Row-Level Security Policies |
| **Database & Storage** | PostgreSQL on Supabase Cloud + Browser-Isolated Local Fallback |
| **AI & Multimodal Vision** | Google Gemini 3 SDK (`gemini-3.1-flash-lite`, `gemini-3.6-flash`) |

> For comprehensive system architecture, database schemas, cryptographic proof specifications, and API reference, see [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18.18+ or v20+ / v22+
- npm, pnpm, or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/JS-Aakash/ReLife.git
cd ReLife

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local demo)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🛡️ Enterprise Data Privacy & Security

- **Strict Isolation:** Sensitive invoices and personal purchase receipts are bound to authenticated user identifiers via PostgreSQL Row-Level Security (`auth.uid() = user_id`).
- **Zero-Knowledge Public Verification:** Public QR scans and second-hand resale links strictly sanitize and strip billing addresses, credit card digits, and owner contact details.
- **Graceful Multi-Engine Resilience:** ReLife operates with full cloud Supabase persistence when credentials are provided, and automatically transitions to an isolated client-side engine if offline or unconfigured.

---

## 📄 License & Intellectual Property

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
Designed and built for the modern physical circular economy.

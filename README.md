# ReLife — The Living Digital Passport for Every Product

> **Turn disposable hardware into repairable heirlooms.**  
> Give physical products a permanent, tamper-evident digital identity that preserves lifetime ownership, warranty status, and verified repair milestones.

---

## 🌟 Key Innovations for Hackathon Judges

1. **Living QR Identity & Public Safe Profiles:**  
   Every product generates a unique, unguessable QR code and passport URL (`/passport/[publicId]`). Scanning a physical sticker opens an authentic, tamper-evident profile with private invoices and payment data automatically redacted.
2. **Explainable Product Health Score:**  
   An explainable maintainability index (0–100) with four transparent contributing factors:
   - *Service Age & Lifespan Consumption* (0–25)
   - *Repair Provenance & Documentation* (0–25)
   - *Fault Recurrence & Component Stability* (0–25)
   - *Cost-to-Value Sustainability Ratio* (0–25)
3. **Repair vs. Replace AI Copilot (`/copilot`):**  
   Diagnostic AI engine that provides safety warnings (e.g. hazardous swollen lithium cells), estimated component cost ranges, and an objective repair-versus-replacement economic comparison.
4. **Trust & Provenance Badge System:**  
   Every repair milestone carries an auditable provenance tier:
   - 🛡️ **Technician Verified:** Backed by certified workshops and technician credentials.
   - 📄 **Document Backed:** Verified by uploaded receipts and invoices.
   - 👤 **Owner Reported:** Self-reported maintenance entries.
5. **Smart Resale Passport (`/resale/[publicId]`):**  
   "Carfax for consumer electronics & bicycles." Generates a shareable second-hand report with an Evidence Coverage Rating and print/PDF export capabilities.
6. **AI Bill & Invoice Scanner:**  
   Upload or drop store receipts to automatically extract product name, brand, model, purchase price, and warranty duration with editable verification before saving.
7. **Transparent E-Waste Avoidance Tracker (`/analytics`):**  
   Grounded Life Cycle Analysis (LCA) benchmarks calculating actual kilograms of hazardous e-waste diverted and embodied manufacturing CO₂ avoided.
8. **Chain of Custody Handshake (`/transfer/[token]`):**  
   Initiate secure ownership transfers to new buyers with recipient acceptance and private billing history redacted by default.

---

## 🚀 Instant Vercel Deployment

ReLife is built with Next.js (App Router) and optimized for zero-configuration deployment to Vercel:

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: complete ReLife digital passport platform"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your `ReLife` repository.
3. Framework Preset will auto-detect **Next.js**.
4. *(Optional)* Add environment variables from `.env.example` if you have Supabase or Gemini API keys. **If no keys are provided, ReLife automatically activates its client-persistent demo mode with seeded sample assets and OCR fallback — the app will never crash!**
5. Click **Deploy**.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js v18+ or v20+ / v24+
- npm, yarn, or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ReLife.git
cd ReLife

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database & Security Architecture

ReLife supports a dual-engine data model:
1. **Client Persistent & Demo Mode (Default):**  
   Fully reactive state with browser `localStorage` persistence and rich seed data (MacBook Pro 16", Specialized Gravel Bike, iPhone 15 Pro, Dyson V15 Vacuum, Sony Headphones). Changes persist across page reloads with 1-click factory reset.
2. **Production Supabase PostgreSQL:**  
   When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided in `.env.local`, the application links to Supabase.
   - Full SQL schema with Row-Level Security (RLS) is located at:  
     [`supabase/schema.sql`](file:///c:/Users/jsaak/OneDrive/Desktop/Coding/ReLife/supabase/schema.sql)
   - To apply migrations, copy the contents of `supabase/schema.sql` into the Supabase SQL Editor and execute.

---

## 🎯 Recommended Live Demo Flow for Judges

1. **Explore the Fleet (`/dashboard`):**  
   Inspect the 5 pre-loaded products across laptops, bicycles, and appliances. Note the warranty countdown alert on the Sony Headphones (12 days left).
2. **Scan an Invoice (`/products/new` or Header Button):**  
   Click **"AI Bill Scanner"** and click on one of the sample receipts (e.g. *Apple Store Receipt* or *Trek Bicycle Bill*). Watch the OCR engine extract hardware specs and click **"Confirm & Create Passport"**.
3. **Inspect a Living Digital Passport (`/products/prod-macbook-pro-16`):**  
   - Inspect the scannable QR code and download the printable badge.
   - Explore the explainable Health Score (88/100) and click into the factor breakdown.
   - Scroll down the **Lifetime Repair Timeline** to see the *Technician Verified* battery overhaul seal.
4. **Test the Public QR Scan (`/passport/rl-macbook-pro-16-c02g`):**  
   Notice how private financial bills and owner home addresses are redacted while verified repair provenance remains public.
5. **Ask the Repair vs. Replace Copilot (`/copilot`):**  
   Pick the MacBook Pro and click the *"Swelling / Draining Battery"* quick scenario. Review the safety hazard alert, estimated component cost range, and carbon savings.
6. **Smart Resale Passport (`/resale/rl-macbook-pro-16-c02g`):**  
   View the Carfax-style report with 100% evidence coverage and click **"Print / Save as PDF"**.
7. **Authorized Service Provider Portal (`/technician`):**  
   Submit a certified technician repair entry, then approve it in the owner queue to seal it into the permanent timeline.
8. **Ownership Transfer (`/transfer/[token]`):**  
   Initiate an ownership transfer from Elena Rostova to a new buyer and test the claim flow.

---

## 💻 Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, Custom Sustainability Forest Theme tokens
- **Icons & Graphics:** Lucide React, SVG Radial Gauges
- **QR Engine:** `qrcode` (Universal SVG & Canvas renderer)
- **Delight:** `canvas-confetti`
- **Database / Backend:** Supabase Client + PostgreSQL RLS (`supabase/schema.sql`)
- **AI / LLM:** Google Gemini API integration with intelligent heuristic OCR fallback

---

## 📄 License
MIT © ReLife Platform Team. Built for the Circular Economy.

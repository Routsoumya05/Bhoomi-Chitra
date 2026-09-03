# BHOOMI CHITRA
## National Land Acquisition & Management System (Govt of India)

> **Tagline:** *"Transparent Land Acquisition. Connected Governance. Smarter Decisions."*

---

## 🏛️ Platform Overview

**BHOOMI CHITRA** is a full-stack, GIS-enabled national platform designed for end-to-end management of the land acquisition lifecycle—from initial project proposal submission to final physical possession, compensation disbursement, and Rehabilitation & Resettlement (R&R) across Indian States and Union Territories.

Compliant with statutory frameworks:
- **RFCTLARR Act, 2013** (Fair Compensation, 100% Solatium, R&R entitlement)
- **National Highways Act, 1956** (Sections 3A to 3J)
- **Railways Act, 1989** (Special Railway Projects)
- **Digital Personal Data Protection (DPDP) Act, 2023** (Citizen Privacy Protection)
- **PM Gati Shakti National Master Plan (NMP)**

---

## 🚀 Live Access & Running the Application

Both backend and frontend are pre-configured and active:
- **Unified Full-Stack App (Production Build):** `http://localhost:5000/`
- **Vite Development Server:** `http://localhost:5173/`
- **Backend REST API Base:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

To restart or launch manually:
```bash
# Windows 1-Click Launch
run.bat

# Or command line:
npm run start        # Launches backend on port 5000 (serving frontend and APIs)
npm run dev:frontend # Launches Vite dev server on port 5173
npm run test         # Executes the complete 10-step SIH demo flow verification
```

---

## 👥 Dual Portal Login Experiences & Demo Accounts

All demo accounts use password: **`Demo@1234`**

| Portal Experience | Role | Email | Designated Authority |
| :--- | :--- | :--- | :--- |
| **Public Citizen Portal** | Public Citizen (Read-Only) | `public@bhoomichitra.demo` | Citizens, Landholders, Public Observers |
| **Administrative Center** | District Authority (CALA) | `district@bhoomichitra.demo` | Shri Somesh Upadhyay, IAS (Collector & CALA Dhenkanal) |
| **Administrative Center** | Central Ministry | `central@bhoomichitra.demo` | Smt. Anita Sundaram, IAS (MoRTH) |
| **Administrative Center** | State Government | `state@bhoomichitra.demo` | Shri Manoj Kumar Mishra, IAS (Govt of Odisha) |
| **Administrative Center** | Implementing Agency (PIA) | `pia@bhoomichitra.demo` | Er. Pradeep Satapathy (NHAI PIU) |
| **Administrative Center** | Field Officer | `field@bhoomichitra.demo` | Bipin Bihari Rout (Revenue Inspector Office) |
| **Administrative Center** | System Administrator | `admin@bhoomichitra.demo` | Dr. Rajesh Verma, IAS (DoLR, MoRD) |

> 💡 **Evaluator Convenience:** The login interface features a **1-Click Evaluator Switcher** allowing instant role switching without typing credentials during presentations!

---

## 🔒 Strict RBAC & Citizen Privacy Protection

1. **Strict 403 Forbidden Enforcement:**
   Public users cannot create, edit, delete projects, mutate parcel states, disburse compensation, or access administrative audit trails. Even if a user attempts to trigger administrative REST endpoints directly, the backend returns:
   ```json
   {
     "success": false,
     "error": "403 Forbidden: Public users are strictly read-only and cannot access administrative resources or actions."
   }
   ```
2. **DPDP Act Citizen Privacy Masking:**
   Public portals anonymize personal data:
   - Landholders: `Owner ID: ******3001`
   - Family Heads: `Family Head: ******1001`
   - Full identity and contact records are exclusively visible to authorized administrative roles.

---

## 🗺️ Flagship Showcase Project: NH-55 Corridor Expansion

- **Project:** NH-55 4-Laning Expansion Corridor (Cuttack - Dhenkanal - Angul Section)
- **State:** Odisha | **District:** Dhenkanal
- **Implementing Agency:** National Highways Authority of India (NHAI)
- **Required Land:** 342.50 Ha | **Acquired Land:** 184.20 Ha
- **Corridor Land Parcels:** 75 realistic georeferenced cadastral polygons along NH-55 corridor across Gondia, Joranda, Kapilash Road, and Motanga villages.
- **Acquisition Risk Score:** **78/100 (HIGH RISK)** factoring in 6 disputed parcels, ₹54.20 Cr pending compensation for 67 families, and milestone delays.

---

## 🔄 Complete 13-Stage Statutory Workflow

```
PROJECT PROPOSAL
   ↓
DOCUMENT SUBMISSION
   ↓
DISTRICT SCRUTINY
   ↓
STATE VERIFICATION
   ↓
CENTRAL APPROVAL
   ↓
NOTIFICATION (Sec 3A / 11)
   ↓
LAND SURVEY (JMS)
   ↓
AWARD DECLARATION (Sec 3G / 23)
   ↓
COMPENSATION ASSESSMENT (Market Value + 100% Solatium)
   ↓
COMPENSATION DISBURSEMENT (PFMS DBT)
   ↓
POSSESSION (Physical Boundary Pegging)
   ↓
REHABILITATION & RESETTLEMENT (R&R Colony Handover)
   ↓
PROJECT COMPLETION
```

---

## 📊 Predictive Acquisition Risk Score Algorithm (0–100)

A transparent rule-based algorithm evaluating live database metrics:
- **Disputed Land Parcels** (Weight: 25%)
- **Pending Compensation Disbursement** (Weight: 25%)
- **Milestone Schedule Delays** (Weight: 25%)
- **R&R & Possession Lag** (Weight: 25%)

Risk Categorization:
- **0–30:** LOW RISK (Green)
- **31–60:** MEDIUM RISK (Amber)
- **61–100:** HIGH RISK (Red)

Each project provides automated **Contributing Factors** and **Statutory Recommendations** (e.g., *"Convene Special Lok Adalat for disputed parcels in Gondia Village"*, *"Prioritize PFMS direct bank disbursement batch for 50 families"*).

---

## 📱 Field Officer Mobile Interface

Optimized responsive mobile interface for on-site revenue inspectors:
- **GPS Capture:** Live browser Geolocation API (`navigator.geolocation.getCurrentPosition`) capturing coordinates (lat, lng, accuracy radius, timestamp).
- **Field Photographs:** Camera / photo upload for boundary pillars and standing assets.
- **Inspection Remarks:** Fast on-site remark submission directly mutating parcel verification states.

---

## 🔌 Extensible Government Data Adapters

Decoupled 4-tier integration architecture:
`Frontend GIS → Backend REST API → Integration Service → Government Data Adapters`
- `/api/integrations/land-records` (State Bhulekh / Bhoomi RoR Adapter)
- `/api/integrations/cadastral` (NIC BhuNaksha WFS Cadastral Map Adapter)
- `/api/integrations/project-data` (PM Gati Shakti NMP Adapter)

Headers return `X-Integration-Mode: MVP-Simulation`, fully ready for live NIC and State portal credentials.

---

## 🏆 SIH Final Demonstration Flow (10 Steps)

1. Open landing page (`http://localhost:5173` or `http://localhost:5000`). Show dual cards: **PUBLIC USER** vs **ADMINISTRATIVE LOGIN**.
2. Click **PUBLIC USER** to explore National Dashboard, interactive GIS parcels, and project timelines. Show that owner data is masked and edit controls are absent.
3. Logout and click **ADMINISTRATIVE LOGIN**. Choose **District Authority** (`district@bhoomichitra.demo`) using the 1-Click demo switcher.
4. Open the flagship **NH-55 Corridor Expansion Project** in Odisha, Dhenkanal.
5. In **Workflow**, execute a statutory decision (`Verify` / `Forward`). Notice the status advances, notification triggers, and audit record generates.
6. In **GIS Map**, click a parcel and change its acquisition status (e.g., `AWARD_DECLARED` → `COMPENSATION_PAID` → `POSSESSION_COMPLETED`). Confirm the map polygon color updates dynamically.
7. In **Compensation**, click **Disburse Payment** for a pending family. Confirm the PFMS transaction reference is recorded and total compensation paid increases.
8. In **R&R**, update relocation progress from 106 to 118 families. Confirm the completion percentage auto-recalculates to **85.5%**.
9. In **Risk Intelligence**, inspect the transparent **Risk Score (78/100 HIGH RISK)** with its contributing factor breakdown and statutory recommendations.
10. In **National Dashboard**, verify how project updates flow into national aggregates and immutable **Audit Logs**.

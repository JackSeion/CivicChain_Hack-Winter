# 🚀 The Slingshot (Online) — System Planning & Scaling  
## Project: CivicChain

---

## 🧠 Overview

CivicChain is a **transparent civic complaint and accountability platform** designed to scale from a single city to an entire state.  
This document explains **how the full system will be built**, **how different components interact**, and **how the system handles growth and failures**.

---

## 🏗️ System Architecture & Data Flow

<img width="1536" height="1024" alt="System-high-lvl" src="https://github.com/user-attachments/assets/3dc923f0-c1f7-42bf-b4f2-16f3f03426b9" />
┌──────────────────┐

│ Citizen App │

│ (Android / Web) │

└─────────┬────────┘

│

│ 1. Submit Complaint

│ (Photo + Category + Auto Location)

▼

┌────────────────────────────┐

│ Supabase │

│ - Authentication │

│ - Complaints Database │

│ - Real-time Sync │

└─────────┬──────────────────┘

│

│ 2. Business Logic Processing

▼

┌────────────────────────────┐

│ AWS Backend Services │

│ - Duplicate Detection │

│ - Resolution Validation │

│ - Leaderboard Metrics │

│ - AI & Prediction Engine │

└─────────┬──────────────────┘

│

│ 3. Verified & Confirmed Complaints

▼

┌────────────────────────────┐

│ Blockchain Layer │

│ - Smart Contract │

│ - Admin Wallet Only │

│ - Immutable Record │

└─────────┬──────────────────┘

│

│ 4. Public Audit Proof


▼

┌────────────────────────────┐

│ Blockchain Explorer │

│ (Public Transparency) │

└────────────────────────────┘


┌────────────────────────────┐

│ Web Dashboard (AWS) │

│ - Municipal Login │

│ - Department-wise View │

│ - Hotspot Analytics │

│ - State-Level Oversight │

└─────────┬──────────────────┘

│

│ Reads / Updates Data

▼

┌────────────────────────────┐

│ Supabase │

│ (Same Shared Database) │

└────────────────────────────┘



### Explanation
- The **Citizen App** is used by the public.
- The **Web Dashboard** is hosted on **AWS** for municipal and state access.
- **Supabase** acts as a shared backend for authentication and data storage.
- Core logic runs on a **custom backend hosted on AWS**.
- Blockchain is used only for **verified and resolved complaints**.

---

## 🔁 How the System Works (End-to-End)

### 1️⃣ Complaint Submission
- Citizen submits a complaint with:
  - Photo
  - Category
  - Auto-tagged latitude & longitude
- Complaint is stored in Supabase.
- Immediately visible in the city feed.

---

### 2️⃣ Duplicate Complaint Detection
Duplicate complaints are detected automatically using **location precision**.

If:

Complaint category is the same

Integer value before decimal of latitude & longitude matches

Then:
→ Complaint is marked as duplicate
→ Linked to the original complaint

yaml
Copy code

This removes spam without requiring crowd verification.

---

### 3️⃣ Municipal Action
- Municipal staff log in to the AWS-hosted web dashboard.
- Complaints are viewed department-wise.
- Complaint status can be updated to **Resolved**.

---

### 4️⃣ Citizen Resolution Validation
Municipality marks complaint as "Resolved"
→ Reporter receives notification
→ Reporter confirms resolution
├─ Yes → Complaint closed
└─ No → Complaint remains active & public



This ensures **citizen-approved resolution**, not internal-only closure.

---

### 5️⃣ Blockchain Logging
- After reporter confirmation:
  - Complaint ID is written to blockchain
  - Transaction hash is generated
  - Hash is stored in Supabase
- Public blockchain link is shown in the app.

---

### 6️⃣ Analytics & Insights
- Hotspot maps update automatically.
- City leaderboard recalculates performance.
- AI engine analyzes trends and predicts future issues.
- State dashboard aggregates city performance.

---

## 📈 Handling Growth & Scalability

### Horizontal Scalability
- Citizen App and Web Dashboard are stateless.
- AWS backend supports horizontal scaling.
- Supabase supports high-concurrency reads/writes.

---

### Database Optimization
- Indexed fields:
  - City
  - Category
  - Status
  - Latitude & Longitude
- Ensures fast queries even with large datasets.

---

### Multi-City & Multi-State Expansion
- City and state are database attributes.
- Adding a new city requires **no redeployment**.
- State dashboard queries aggregated metrics only.

---

## 🛡️ Failure Handling & Reliability

### No Single Point of Failure
- Supabase provides managed backups and redundancy.
- If blockchain is unavailable:
  - Complaint system continues
  - Blockchain write is queued.

---

### Graceful Degradation
- If AI module fails → core complaint flow unaffected.
- If analytics fail → complaint reporting still works.
- If dashboard is down → citizen app remains usable.

---

### Abuse Prevention
- Rate limiting on complaint submission.
- Duplicate detection logic.
- Role-based access for municipal and state users.

---

## 💰 Cost & Performance Efficiency

- AWS hosting allows controlled scaling.
- Supabase free/low-cost tiers for early stages.
- Blockchain cost < ₹1 per complaint (Layer-2).
- No vendor lock-in or heavy infrastructure.
- Suitable for small cities and scalable to states.

---

## 👥 Team Contribution Breakdown

### 👤 Member 1 — App Backend + Blockchain
- Complaint logic & APIs
- Duplicate detection
- Blockchain smart contract & backend integration
- Admin wallet management

---

### 👤 Member 2 — App Frontend + Backend
- Citizen app UI
- Complaint submission flow
- City feed & hotspot map
- API integration

---

### 👤 Member 3 — Web Frontend + Backend + Supabase
- Municipal & state dashboard UI
- Supabase schema design
- Department-wise views
- Authentication & role management

---

### 👤 Member 4 — AI + Web Backend
- Hotspot analytics logic
- Trend prediction models
- City leaderboard metrics
- Performance scoring algorithms

---

## 🏁 Conclusion

CivicChain is designed as a **scalable, resilient, and cost-effective civic governance platform**.  
Its modular architecture allows easy expansion from city-level deployment to state-wide governance oversight while maintaining transparency, performance, and trust.

---

✅ **Ready for The Slingshot (Online) Submission**
✔ What this file gives you
Proper Markdown hierarchy

Clean system diagram

Clear scalability & failure handling

Correct team role mapping

AWS correctly represented

Direct copy–paste usability

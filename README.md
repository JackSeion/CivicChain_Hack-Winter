# 🏛️ CivicChain
### Transparent Civic Complaint & Accountability Platform

---

## 🧩 Problem Statement

Urban civic grievance systems today face multiple challenges:

- Duplicate and spam complaints  
- Lack of transparency in resolution  
- Complaints closed without citizen confirmation  
- No public comparison of municipal performance  
- No state-level oversight of city performance  

Existing systems are **centralized, expensive, and opaque**, resulting in low trust and inefficiency.

---

## 💡 Proposed Solution

**CivicChain** is a **location-aware, cost-effective civic complaint platform** that enables:

- Simple citizen complaint reporting  
- Automatic duplicate detection using geolocation  
- Citizen-verified complaint resolution
- Public Voting for issue priority 
- Public city performance leaderboards  
- A unified backend for app and dashboard  
- Future blockchain-based auditability  

The platform consists of **two products**:

- 📱 Citizen Mobile/Web App  
- 🖥️ Municipal & State Web Dashboard  

Both are connected using **Supabase** as a shared backend.

---

## 🏗️ System Architecture Overview

Citizen App ──┐

├── Supabase (Auth + Database)

Municipal Web ─┘

│

├── Duplicate Detection Engine

├── Resolution Validation Logic

├── Analytics & Prediction Engine (Round 2)

└── Blockchain Audit Layer (Round 2)



---

## 🔁 Core Functional Flow

### 1️⃣ Complaint Submission

Citizen submits complaint
→ Photo + Category
→ Auto location tagging (latitude & longitude)
→ Stored in Supabase
→ Visible instantly in city feed



---

### 2️⃣ Duplicate Complaint Detection

Duplicate complaints are detected automatically using location precision:

If:

Same complaint category

Same integer value before decimal of latitude & longitude

Then:
→ Mark as duplicate
→ Link to original complaint



This avoids repeated complaints without requiring manual verification.

---

### 3️⃣ Complaint Resolution Validation

Municipality marks complaint as "Resolved"
→ Notification sent to reporter
→ Reporter confirms resolution
→ If confirmed: complaint closed
→ If rejected: complaint remains active



This ensures **citizen-approved resolution**, not just internal status updates.

---

## 📱 Citizen App – Features

### 🏠 Home Screen
- Displays all complaints from the user’s city  
- Real-time updates, filtering and voting

### ➕ Report Complaint
- Upload photo  
- Auto location tagging  
- Category selection  
- Optional description  

### 🗺️ Hotspot Map
- Visual map showing complaint density  
- Helps citizens identify problem zones  

### 🏆 City Leaderboard
- Shows city-wise municipal performance  
- Encourages transparency and competition  

### 👤 Profile Page
- User details  
- Complaints submitted  
- Civic responsibility points *(Round 2)*  

---

## 🖥️ Web Dashboard – Features

### 🔐 Municipal Login
- Secure, role-based access  
- City-specific data visibility  

### 📋High priority Complaint View
- Most voted Complaints gets higher priority view  
- One place to view all priority complaint irrespective of department
- 
### 📋 Department-wise Complaint View
- Complaints grouped by department  
- Status updates and management  

### 🗺️ City Hotspot Analytics
- Area-wise issue concentration  
- Supports better resource allocation  

### 📊 Predictive Insights
- Month-wise complaint trends  
- Category-based issue forecasting  

---

## ⭐ What Makes CivicChain Different

- Automatic duplicate detection using geolocation  
- Citizen confirmation before complaint closure
- Public voting to prioritize real issues  
- Public city leaderboard for accountability  
- Unified Supabase backend (app + dashboard)  
- Blockchain used only where auditability is required   

---

## 🔗 Blockchain Integration

- Verified and resolved complaint IDs logged on-chain  
- Immutable public audit trail  
- One backend-controlled admin wallet  
- No user wallet required
- Makes data tamper proof and goernment accountable

Blockchain is used as a **trust layer**, not as a database replacement.

---

## 🏛️ State-Level Dashboard

- State government can monitor:
  - City-wise performance  
  - Resolution efficiency  
  - Underperforming municipalities  

Enables **top-down governance oversight**.

---

## 🎁 Rewarding System 

- First reporter of a complaint earns **Civic Responsibility Points**  
- Encourages proactive civic participation  
- Points visible on user profile  

---

## 💰 Cost Effectiveness

- No heavy infrastructure  
- Supabase free / low-cost tier 
- Blockchain cost < ₹1 per complaint (L2 network)  
- No vendor lock-in  
- Easily scalable across cities
- Cost 6k-8k rupees for an average city(combining supabase + blockchain + other costs)
- 90% cheaper from available solutions 

---


## 🏁 Conclusion

CivicChain transforms civic grievance redressal from a **black-box system** into a **transparent, citizen-validated, and accountable platform**, while remaining affordable, scalable, and governance-friendly.

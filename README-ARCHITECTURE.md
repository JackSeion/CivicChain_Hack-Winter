# 🏗️ CivicChain – System Architecture

---

## 🔹 Architecture Overview

CivicChain follows a **modular, scalable architecture** where both the citizen app and the web dashboard share a common backend and database.

Citizen App ──┐

├── Supabase (Auth + PostgreSQL)

Web Dashboard ─┘

│

├── Duplicate Detection Logic

├── Resolution Validation Engine

├── Analytics & Prediction Layer (Round 2)

└── Blockchain Audit Layer (Round 2)



---

## 🔹 Components Breakdown

### 📱 Citizen App
- Complaint submission
- City-wise complaint feed
- Hotspot map
- City leaderboard
- Profile & activity tracking

---

### 🖥️ Web Dashboard
- Municipal login
- Department-wise complaint management
- City hotspot analytics
- Trend & prediction views
- (Planned) State-level performance dashboard

---

### 🗄️ Backend & Database
- **Supabase** for:
  - Authentication
  - PostgreSQL database
  - Real-time data sync
- Single source of truth for app and dashboard

---

### 🔗 Blockchain Layer (Planned)
- Smart contract to store complaint IDs
- Admin-controlled wallet
- Public blockchain explorer for audit

---

## 🔹 Why This Architecture Works

- Low infrastructure cost  
- Easy city-wise scalability  
- No vendor lock-in  
- API-ready for e-governance integration  
- Clear separation of citizen and admin roles  

---

## 🔹 Technology Stack

### Frontend
- React + Vite, React Native 
- TailwindCSS  
- Google maps

### Backend & Database
- Supabase (PostgreSQL + Auth)

### Blockchain (Round 2)
- Solidity smart contracts  
- Ethereum sepolia testnet  
- Ethers.js for interaction

---

## 🔹 Scalability Considerations

- Stateless frontend applications  
- Centralized, indexed database  
- Modular services for analytics & blockchain  
- Easy onboarding of new cities and states

# 🔁 CivicChain – Functional Flows & DFDs

---

## 🔹 Flow 1: Complaint Submission

Citizen

↓

Submit Complaint

↓

Auto Location Tag (Latitude & Longitude)

↓

Store Complaint in Supabase

↓

Display in City Feed



---

## 🔹 Flow 2: Duplicate Complaint Detection

Duplicate detection is based on **geolocation precision and category**.

New Complaint

↓

Check Category Match

↓

Compare Integer Value of Lat/Lng

↓

Match Found?

├─ Yes → Mark as Duplicate

└─ No → Save as New Complaint



This avoids repeated complaints without crowd verification.

---

## 🔹 Flow 3: Complaint Resolution Validation

Municipality Marks Complaint as Resolved

↓

Notification Sent to Reporter

↓

Reporter Confirms Resolution?

├─ Yes → Complaint Closed

└─ No → Complaint Reopened & Visible



Ensures **citizen-approved closure**.

---

## 🔹 Flow 4: City Leaderboard Update

Complaint Status Updates

↓

Resolution Metrics Calculated

↓

City Performance Score Updated

↓

Leaderboard Refreshed in App



---

## 🔹 Flow 5: Data Flow Diagram (DFD)

Citizen → App → Supabase

Citizen → App → Resolution Confirmation

Municipal Admin → Web Dashboard → Supabase

Supabase → Analytics Engine

Supabase → Blockchain Layer (Round 2)

Blockchain → Public Explorer



---

## 🔹 Flow 6: Future Blockchain Logging (Round 2)

Complaint Resolved & Confirmed

↓

Complaint ID Sent to Smart Contract

↓

Transaction Hash Generated

↓

Stored Back in Database

↓

Publicly Verifiable Link


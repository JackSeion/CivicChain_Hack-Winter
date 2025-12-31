<p align="center"> <img src="https://vkpdvpfxwbhbilrhghqb.supabase.co/storage/v1/object/public/resolution/resolution_1763245533377_2fj2kl.png " alt="CivicChain Banner" /> </p>
<img width="500" height="500" alt="icon" src="https://github.com/user-attachments/assets/c9957e97-bc39-445b-90de-34b767deff09" />
CivicChain — Smart Municipal Governance Dashboard

CivicChain is a modern, data-driven municipal management system built with React + TypeScript, Supabase, TailwindCSS, and Node Functions.
It provides a unified platform for complaint handling, analytics, geospatial heatmaps, performance insights, and inter-department communication.

🚀 Features
📝 Complaint Management System

File and manage citizen complaints

Real-time status updates: Pending → Verified → Resolved

Complaint details with images

Auto-fetch and filter by categories

Resolution analytics and time tracking

📊 Advanced Dashboard

Beautiful, responsive dashboard with:

Total, Pending, Active, and Resolved complaint cards

Trend analysis (weekly % increase/decrease)

State and Department-level overviews

KPI cards with clean UI

🗺️ Interactive Heatmap

Visualize complaints on the map

Identify hotspots using density algorithms

Helps decision-makers allocate resources

📈 Performance & Analytics

Statistical breakdown by category

Monthly/Weekly complaint comparison

Resolution rate and average resolution time

Visual charts for better insights

🏛️ State-Level Dashboard

State-specific complaint overview

Category-wise and district-wise filtering

Individual state analytics page

State Communication Chat (real-time)

💬 Integrated Real-Time Chat

Floating chat widget

Department ↔ State communication

Message history stored in Supabase

🔐 Authentication

OTP-based login

Secure sessions

Role-based features (State / Department dashboards)

🛠️ Tech Stack
Frontend

React + TypeScript

Tailwind CSS (UI)

ShadCN Components

Recharts (Charts)

Leaflet / Mapbox (Heatmaps)

Backend

Supabase

Auth

Database

Storage

Edge Functions (server logic)

Other Tools

GitHub Actions (CI / Deployment)

Vite (Dev server)

📂 Project Structure
src/
 ├── components/
 │    ├── OverviewPage.tsx
 │    ├── StateOverviewPageEnhanced.tsx
 │    ├── DepartmentsPage.tsx
 │    ├── ComplaintCard.tsx
 │    ├── StateCommunicationChat.tsx
 │    ├── HeatmapCard.tsx
 │    ├── LoginPage.tsx
 │    └── ...
 ├── supabase/
 │    └── functions/
 │         └── server/index.ts
 ├── index.css
 └── main.tsx

⚙️ Installation & Setup
git clone https://github.com/kanishk001233/civicchain.git
cd civicchain

npm install
npm run dev

🔧 Environment Variables

Create a .env file:

VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

📬 API / DB Features

Complaint CRUD

Chat message logs

Category-level data aggregation

Real-time status syncing

Resolution time calculation function

🤝 Contributing

Contributions are welcome!
If you’d like to improve UI, optimize analytics, or expand features, feel free to open a PR or create an issue.

📜 License

MIT License © 2025 CivicChain

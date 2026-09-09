# ⛏️ CoalGuard – AI-Enabled Smart Governance Platform for Coal Mining

> **SIH 2026 Project** | Centralized governance, compliance monitoring & AI analytics for Indian coal mining operations.

---

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)  →  Node.js REST API  →  SQLite DB
                        →  Python AI Engine  →  Risk Scoring + Anomaly Detection
```

---

## 📁 Project Structure

```
SIH 26/
├── index.html           ← Login (role-based: Mine Official / Corporate / Regulator / Field)
├── dashboard.html       ← Main KPI dashboard with live charts
├── compliance.html      ← Statutory compliance monitoring & tracker
├── inspections.html     ← Inspection scheduling, findings & corrective actions
├── contractors.html     ← Contractor registry with compliance scoring
├── field-reports.html   ← Mobile-style geo-tagged field reporting
├── analytics.html       ← AI risk engine, anomaly detection & predictions
├── gis-map.html         ← Interactive Leaflet.js GIS mine map
├── reports.html         ← Auto-reports, PDF stubs & blockchain audit trail
├── css/
│   └── main.css         ← Full design system (dark theme, amber accents)
├── js/
│   ├── api.js           ← API client + mock data + auth utilities
│   └── main.js          ← Shared sidebar component
├── backend/             ← Node.js Express REST API
│   ├── server.js        ← Main API (8 route groups + audit trail)
│   ├── db/seed.js       ← SQLite seed with realistic mock data
│   └── package.json
└── ai-engine/           ← Python FastAPI AI service
    ├── main.py          ← REST endpoints (risk, anomalies, predictions)
    ├── risk_model.py    ← Weighted feature scoring model
    ├── anomaly.py       ← Z-score + IQR anomaly detection
    └── requirements.txt
```

---

## 🚀 Getting Started

### 1. Open Frontend (No server required)
Simply open `index.html` in a browser. All pages work with built-in mock data.

### 2. Start Backend API

```bash
cd backend
npm install
npm start
# API running at http://localhost:3001
# Auto-seeds SQLite database on first run
```

### 3. Start AI Engine

```bash
cd ai-engine
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# AI API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/dashboard/kpis` | Real-time KPI metrics |
| GET | `/api/mines` | All mine sites |
| GET | `/api/compliance` | Compliance register |
| POST | `/api/compliance` | Add compliance item |
| PATCH | `/api/compliance/:id` | Update status |
| GET | `/api/inspections` | All inspections |
| POST | `/api/inspections` | Schedule inspection |
| GET | `/api/contractors` | Contractor registry |
| GET | `/api/incidents` | Incident log |
| POST | `/api/incidents` | Report incident |
| GET | `/api/alerts` | Active alerts |
| GET | `/api/audit` | Blockchain audit trail |
| GET | `/api/ai/risk-scores` | AI risk scores |

### AI Engine Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/risk-scores` | Risk scores for all mines |
| POST | `/risk-scores/compute` | Custom mine risk scoring |
| GET | `/anomalies` | Detected anomalies |
| GET | `/predictions` | Predictive compliance alerts |
| GET | `/summary` | AI dashboard summary |

---

## 🎯 Features

- **Role-based Login**: Mine Official / Corporate Management / Regulatory Authority / Field Inspector
- **9 Full Pages**: Dashboard, Compliance, Inspections, Contractors, Field Reports, GIS Map, AI Analytics, Reports, Audit
- **AI Risk Engine**: Weighted feature scoring + Z-score/IQR anomaly detection
- **Interactive GIS Map**: Leaflet.js with color-coded risk overlays and mine popups
- **Blockchain Audit Trail**: SHA-256 hash chaining for tamper-evident records
- **Mobile Field UI**: Tabbed incident/observation/attendance reporting with geo-tagging
- **Real-time Charts**: Chart.js production trends, compliance donuts, risk radar, incident bars
- **Auto-report Generation**: 6 report types with PDF download stubs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, JavaScript (ES6+) |
| Charts | Chart.js 4.4 |
| GIS Map | Leaflet.js 1.9 |
| Fonts | Inter (Google Fonts) |
| Backend | Node.js 18+, Express 4 |
| Database | SQLite (via better-sqlite3) |
| AI Engine | Python 3.10+, FastAPI, NumPy, scikit-learn |
| Security | Helmet.js, CORS, SHA-256 audit hashing |

---

## 👥 Team

**SIH 2026 – Smart India Hackathon**  
Problem: Centralized AI-enabled Governance Platform for Coal Mining Operations

---

*CoalGuard – Powering transparent, accountable, and data-driven governance for India's coal sector.*

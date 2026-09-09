# CoalGuard: Project Context for ChatGPT

*Please copy and paste the text below directly into ChatGPT to give it the full context of what we've built, so it can help you write the perfect presentation.*

***

**System Prompt / Context Initialization for ChatGPT:**

Act as an expert technical consultant and presentation designer. I am preparing a pitch presentation (PPT) for the Smart India Hackathon (SIH) for my project called **CoalGuard**. I need you to help me structure my presentation, write the slides, and anticipate judge questions.

Before we start, read the following comprehensive technical brief about what we have actually built. Acknowledge that you understand the architecture and features by giving me a 5-slide suggested outline.

### 1. Project Overview
- **Name:** CoalGuard – Mine Intelligence & Safety Command Center
- **Target Audience:** Coal India Limited (CIL) Executives, Ministry of Coal, and SIH Technical Judges.
- **Core Value Proposition:** A "Government-Grade" unified digital twin and intelligence dashboard that monitors safety, compliance, and efficiency across 80 real Indian coal mines.
- **The "Wow" Factor:** We didn't build a basic MVP with hardcoded HTML placeholders. Our frontend is completely dynamic, driven by a real database of 80 CIL mines. The AI is 100% real (running actual Python ML models and fluid dynamics physics), while the hardware sensors are simulated via Server-Sent Events (SSE). 

### 2. Architecture Stack
- **Frontend:** Pure Vanilla HTML/JS/CSS. We avoided bloated frameworks to ensure lightning-fast performance. Features a premium, glassmorphism-inspired modern UI with dynamic dark/light modes and SVG animations.
- **AI Backend:** Python FastAPI. Handles real-time telemetry streaming and heavy mathematical inference.
- **Data Backend:** Node.js API layer.

### 3. Core Modules & Innovations

#### A. The Global Intelligence Dashboard
- Aggregates KPIs across 80 mines (total production, critical risk sites, compliance indices).
- **Dynamic Live Alerts:** An algorithm mathematically scans the database and generates continuous, localized alerts (e.g., "Strata convergence hazard at Jhanjra UG") based on the actual risk and compliance scores of the mines, not hardcoded text.

#### B. Interactive GIS Mapping
- A dynamic Leaflet-based geographic map that plots all 80 mines using their exact geo-coordinates. Clicking a mine flies to its location and reveals its localized risk profile.

#### C. AI Digital Twin & Live Telemetry
This is the technical crown jewel of the project:
- **Live SSE Streaming:** The Python backend generates realistic, fluctuating gas (CH4, CO) and temperature data using Gaussian noise and streams it to the frontend via Server-Sent Events every second.
- **SA-SVM Combustion Model:** The Python engine runs a Support Vector Machine to constantly evaluate the live gas data. If an incident is simulated, the frontend organically triggers a "Stage 3 Emergency" **only** when the Python ML model mathematically determines the threshold is breached.
- **Physics-Based Ventilation Optimizer:** During an emergency, the user clicks "Apply AI Prescription." The Python backend runs actual fluid dynamics equations (Volume / Q * ln(C1/C2)) to calculate the exact fan speed percentage and airflow (m³/s) required to dilute the gas, instantly fixing the environment.

#### D. The AI Strategy & Prescription Engine
- A dedicated module that acts as a McKinsey consultant for mine executives.
- It analyzes 80 unique mine profiles containing metrics like OMS (Output per Manshift), OBR (Stripping Ratio), GCV (Coal Grade), and Compliance scores.
- **Dynamic Output:** It automatically prescribes business strategies. E.g.:
  - *If a mine has a High Stripping Ratio (> 3.0)*: It recommends transitioning from Shovel-Dumpers to high-capacity Draglines to reduce overburden costs.
  - *If a mine is Low Risk but Low Production*: It flags the mine as "Safe to Scale" and recommends adding machinery shifts.
  - *If a mine has Critical Risk*: It halts expansion and mandates strata support.

### 4. Technical Philosophy (Crucial for Judges)
- **"The Brains are Real, the Sensors are Simulated."** We simulate the hardware (because we don't have physical access to a coal mine), but the Machine Learning, the physics equations, and the data architecture are production-ready.
- **Zero Hardcoding:** Every chart, alert, and KPI is calculated via JavaScript mapping over a vast JSON array of real Indian mines.

***

*End of Context.*

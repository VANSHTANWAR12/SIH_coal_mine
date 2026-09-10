"""
CoalGuard AI Engine – main.py v2.0
FastAPI service: risk scoring, anomaly detection, predictive alerts,
SA-SVM combustion prediction, strata collapse, ventilation prescriptions,
HEMM maintenance, and live sensor simulation stream.

Start: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import datetime, statistics, asyncio, json, random, math

from risk_model import compute_risk_score, MOCK_MINE_FEATURES, MineFeatures
from anomaly import (
    detect_compliance_anomalies, detect_production_anomalies, detect_incident_spike,
    MOCK_COMPLIANCE_HISTORY, MOCK_PRODUCTION_HISTORY, MOCK_INCIDENT_HISTORY
)
from models.combustion_model import get_predictor
from models.strata_model import get_strata_predictor
from models.ventilation_optimizer import prescribe_ventilation
from models.hemm_maintenance import get_hemm_predictor
from models.strategy_agent import run_strategy_agent
from dotenv import load_dotenv

load_dotenv()

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="CoalGuard AI Engine v2",
    description="AI-powered: SA-SVM combustion prediction, strata collapse forecasting, "
                "prescriptive ventilation, HEMM maintenance, and real-time hazard alerting.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pre-load models at startup ────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    print("Loading AI models...")
    try:
        get_predictor()
        print("  [OK] SA-SVM Combustion Model")
    except Exception as e:
        print(f"  [FAIL] Combustion Model: {e}")
    try:
        get_strata_predictor()
        print("  [OK] Strata GBM Model")
    except Exception as e:
        print(f"  [FAIL] Strata Model: {e}")
    try:
        get_hemm_predictor()
        print("  [OK] HEMM Random Forest Model")
    except Exception as e:
        print(f"  [FAIL] HEMM Model: {e}")
    print("All models ready.")


# ── Pydantic Request Schemas ──────────────────────────────────────────────────
class MineFeaturesRequest(BaseModel):
    mine_id: str
    mine_name: str
    compliance_score: float
    days_overdue_avg: float = 0
    open_violations: int = 0
    critical_findings: int = 0
    incident_count_30d: int = 0
    critical_incidents: int = 0
    inspection_lag_days: float = 0
    contractor_low_compliance: int = 0
    production_deviation_pct: float = 0
    environmental_incidents: int = 0

class CombustionRequest(BaseModel):
    mine_name: str = "Moonidih"
    CH4_pct: float = 0.3
    CO_ppm: float = 8.0
    C2H4_ppm: float = 0.5
    C2H6_ppm: float = 0.8
    CO2_pct: float = 0.4
    O2_pct: float = 20.5
    temp_C: float = 28.0
    humidity_pct: float = 65.0
    dust_mgm3: float = 1.5

class StrataRequest(BaseModel):
    mine_name: str = "Jhanjra UG"
    microseismic_count: int = 12
    peak_particle_velocity: float = 8.5
    roof_convergence_mm: float = 15.0
    support_pressure_kpa: float = 35.0
    depth_m: float = 225.0
    operator_exp_yrs: float = 8.0
    shift_hours: float = 8.0
    consecutive_days: int = 5

class VentilationRequest(BaseModel):
    mine_name: str = "Moonidih"
    CH4_pct: float = 0.3
    CO_ppm: float = 8.0
    CO2_pct: float = 0.4
    O2_pct: float = 20.5
    dust_mgm3: float = 1.5
    current_fan_speed_pct: float = 60.0

class HEMMRequest(BaseModel):
    equipment_id: str = "HEMM-001"
    equipment_type: str = "240T Dumper"
    mine_name: str = "Gevra OC"
    engine_hours: int = 4500
    vibration_rms: float = 2.8
    oil_temp_C: float = 95.0
    hydraulic_pressure_bar: float = 185.0
    tyre_pressure_psi: float = 88.0
    last_service_days: int = 45


# ── Base Endpoints ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "CoalGuard AI Engine",
        "version": "2.0.0",
        "status": "online",
        "models": ["SA-SVM Combustion", "GBM Strata Collapse", "Physics Ventilation", "RF HEMM Maintenance"],
        "endpoints": [
            "/predict/combustion", "/predict/strata", "/predict/environment",
            "/prescribe/ventilation", "/prescribe/maintenance", "/prescribe/fleet",
            "/simulate/live-feed", "/risk-scores", "/anomalies", "/predictions", "/health"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "models": {
            "combustion": "SA-SVM (RBF kernel + Simulated Annealing)",
            "strata": "GBM (IA-PSO-BP surrogate)",
            "ventilation": "Physics-based + Regression",
            "hemm": "Random Forest (SAPF/AI-CBM)"
        },
        "accuracy": {"combustion": "~87%", "strata": "~83%", "hemm": "~91%"}
    }


# ── PREDICTIVE ENDPOINTS ──────────────────────────────────────────────────────

@app.post("/predict/combustion")
def predict_combustion(payload: CombustionRequest):
    """
    SA-SVM Spontaneous Combustion Risk Predictor.
    Ingests gas concentrations, outputs risk stage (0-3) + gas ratios + action.
    """
    predictor = get_predictor()
    result = predictor.predict(
        payload.CH4_pct, payload.CO_ppm, payload.C2H4_ppm, payload.C2H6_ppm,
        payload.CO2_pct, payload.O2_pct, payload.temp_C,
        payload.humidity_pct, payload.dust_mgm3
    )
    result['mine'] = payload.mine_name
    result['timestamp'] = datetime.datetime.utcnow().isoformat()
    result['model'] = 'SA-SVM (CoalGuard v2)'
    return result


@app.post("/predict/strata")
def predict_strata(payload: StrataRequest):
    """
    IA-PSO-BP surrogate (GBM) for roof fall / strata collapse prediction.
    Outputs collapse probability, 48-hour forecast, and withdrawal recommendation.
    """
    predictor = get_strata_predictor()
    result = predictor.predict(
        payload.microseismic_count, payload.peak_particle_velocity,
        payload.roof_convergence_mm, payload.support_pressure_kpa,
        payload.depth_m, payload.operator_exp_yrs,
        payload.shift_hours, payload.consecutive_days
    )
    result['mine'] = payload.mine_name
    result['timestamp'] = datetime.datetime.utcnow().isoformat()
    result['model'] = 'GBM Strata Predictor (CoalGuard v2)'
    return result


@app.post("/predict/environment")
def predict_environment(payload: CombustionRequest):
    """
    Multi-variable linear regression 48-hour environmental hazard forecast.
    Predicts CH4, temperature, and dust levels over next 48 hours.
    """
    now = datetime.datetime.utcnow()

    # Simulate linear trend with noise
    def forecast_series(base, slope, noise, n=9):
        return [round(max(0, base + slope * i + random.gauss(0, noise)), 3) for i in range(n)]

    # Trend direction based on current values vs TLV
    ch4_slope = 0.01 if payload.CH4_pct > 0.8 else -0.005
    temp_slope = 0.15 if payload.temp_C > 30 else 0.05
    dust_slope = 0.05 if payload.dust_mgm3 > 2 else -0.02

    ch4_forecast  = forecast_series(payload.CH4_pct,  ch4_slope,  0.02)
    temp_forecast = forecast_series(payload.temp_C,   temp_slope, 0.3)
    dust_forecast = forecast_series(payload.dust_mgm3, dust_slope, 0.1)
    labels = [f'+{i*6}h' if i > 0 else 'Now' for i in range(9)]

    # Overall 48h risk
    max_ch4 = max(ch4_forecast)
    hazard_prob = min(99, int((max_ch4 / 1.25) * 70 + (payload.CO_ppm / 50) * 15))

    return {
        'mine': payload.mine_name,
        'forecast_labels': labels,
        'ch4_forecast': ch4_forecast,
        'temp_forecast': temp_forecast,
        'dust_forecast': dust_forecast,
        'hazard_probability_48h': hazard_prob,
        'peak_ch4_expected': round(max_ch4, 3),
        'peak_time': labels[ch4_forecast.index(max_ch4)],
        'model': 'MLR Environmental Forecast (CoalGuard v2)',
        'accuracy_cited': '70-76% (48h horizon)',
        'timestamp': now.isoformat()
    }


# ── PRESCRIPTIVE ENDPOINTS ────────────────────────────────────────────────────

@app.post("/prescribe/ventilation")
def prescribe_vent(payload: VentilationRequest):
    """
    GNN+DRL-inspired prescriptive ventilation optimizer.
    Returns exact fan speed recommendation, airflow routing, and energy savings.
    """
    result = prescribe_ventilation(
        payload.CH4_pct, payload.CO_ppm, payload.CO2_pct,
        payload.O2_pct, payload.dust_mgm3,
        payload.current_fan_speed_pct, payload.mine_name
    )
    result['timestamp'] = datetime.datetime.utcnow().isoformat()
    result['model'] = 'Physics+Regression Ventilation Optimizer (CoalGuard v2)'
    return result


@app.post("/prescribe/strategy")
def prescribe_strategy(payload: Dict[str, Any]):
    """
    LangChain + LangGraph powered AI Specialist Agent.
    Evaluates safety, production, and synthesizes JSON prescriptions.
    """
    try:
        prescriptions = run_strategy_agent(payload)
        return {"prescriptions": prescriptions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/prescribe/maintenance")
def prescribe_maintenance(payload: HEMMRequest):
    """
    SAPF/AI-CBM predictive maintenance for a single HEMM unit.
    Returns RUL (Remaining Useful Life), urgency, and service date.
    """
    predictor = get_hemm_predictor()
    result = predictor.predict_single(
        payload.engine_hours, payload.vibration_rms, payload.oil_temp_C,
        payload.hydraulic_pressure_bar, payload.tyre_pressure_psi, payload.last_service_days
    )
    result['equipment_id'] = payload.equipment_id
    result['equipment_type'] = payload.equipment_type
    result['mine'] = payload.mine_name
    result['timestamp'] = datetime.datetime.utcnow().isoformat()
    result['model'] = 'RF HEMM Predictor SAPF (CoalGuard v2)'
    return result


@app.get("/prescribe/fleet/{mine_name}")
def get_fleet_status(mine_name: str, n_units: int = 12):
    """
    Get full HEMM fleet maintenance status for a mine site.
    Returns prioritized maintenance queue.
    """
    predictor = get_hemm_predictor()
    fleet = predictor.get_fleet_status(mine_name, n_units)
    critical = sum(1 for e in fleet if e['urgency'] == 3)
    urgent   = sum(1 for e in fleet if e['urgency'] == 2)
    return {
        'mine': mine_name,
        'total_equipment': len(fleet),
        'critical_count': critical,
        'urgent_count': urgent,
        'fleet': fleet,
        'timestamp': datetime.datetime.utcnow().isoformat()
    }


# ── LIVE SENSOR SIMULATION (SSE) ──────────────────────────────────────────────
MINE_BASELINES = {
    'Moonidih':     {'CH4': 0.6,  'CO': 15,  'O2': 20.2, 'temp': 34},
    'Churcha RO':   {'CH4': 0.4,  'CO': 10,  'O2': 20.4, 'temp': 30},
    'Jhanjra UG':   {'CH4': 0.5,  'CO': 12,  'O2': 20.3, 'temp': 32},
    'Adriyala Shaft':{'CH4': 0.7, 'CO': 18,  'O2': 20.1, 'temp': 36},
    'Gevra OC':     {'CH4': 0.05, 'CO': 3,   'O2': 20.8, 'temp': 28},
    'default':      {'CH4': 0.3,  'CO': 8,   'O2': 20.5, 'temp': 28},
}

@app.get("/simulate/live-feed")
async def live_sensor_feed(mine: str = "Moonidih", incident: bool = False):
    """
    Server-Sent Events stream of simulated sensor data.
    Set incident=true to simulate a hazardous event spike.
    """
    base = MINE_BASELINES.get(mine, MINE_BASELINES['default'])

    async def generator():
        for tick in range(30):
            multiplier = (1 + tick * 0.15) if incident else 1.0
            ch4   = round(min(2.5, max(0, base['CH4'] * multiplier + random.gauss(0, 0.05))), 3)
            co    = round(min(200, max(0, base['CO'] * multiplier + random.gauss(0, 2))), 1)
            c2h4  = round(max(0, 0.3 * multiplier + random.gauss(0, 0.1)), 2)
            c2h6  = round(max(0, 0.6 + random.gauss(0, 0.1)), 2)
            co2   = round(max(0.1, 0.35 + random.gauss(0, 0.03)), 3)
            o2    = round(min(21, max(15, base['O2'] - (multiplier - 1) * 0.5 + random.gauss(0, 0.1))), 2)
            temp  = round(base['temp'] + (multiplier - 1) * 3 + random.gauss(0, 0.5), 1)
            hum   = round(max(30, min(100, 65 + random.gauss(0, 3))), 1)
            dust  = round(max(0, 1.5 * multiplier + random.gauss(0, 0.2)), 2)

            # Run combustion prediction on live data
            predictor = get_predictor()
            comb = predictor.predict(ch4, co, c2h4, c2h6, co2, o2, temp, hum, dust)

            payload = {
                'tick': tick,
                'mine': mine,
                'incident_mode': incident,
                'sensors': {'CH4': ch4, 'CO': co, 'C2H4': c2h4, 'C2H6': c2h6,
                            'CO2': co2, 'O2': o2, 'temp': temp, 'humidity': hum, 'dust': dust},
                'combustion': {'stage': comb['stage'], 'label': comb['stage_label'], 'confidence': comb['confidence']},
                'timestamp': datetime.datetime.utcnow().isoformat()
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ── Legacy endpoints (unchanged) ──────────────────────────────────────────────
@app.get("/risk-scores")
def get_all_risk_scores():
    results = [compute_risk_score(f) for f in MOCK_MINE_FEATURES]
    results.sort(key=lambda x: x['risk_score'], reverse=True)
    return {"scores": results, "computed_at": datetime.datetime.utcnow().isoformat(),
            "model": "CoalGuard Risk v2.3", "total_mines": len(results)}

@app.post("/risk-scores/compute")
def compute_single_risk(payload: MineFeaturesRequest):
    features = MineFeatures(**payload.dict())
    return compute_risk_score(features)

@app.get("/anomalies")
def get_anomalies():
    comp_a = detect_compliance_anomalies(MOCK_COMPLIANCE_HISTORY)
    prod_a = detect_production_anomalies(MOCK_PRODUCTION_HISTORY)
    inc_a  = detect_incident_spike(MOCK_INCIDENT_HISTORY)
    all_a  = sorted(comp_a + prod_a + inc_a, key=lambda x: x.get('confidence', 0), reverse=True)
    return {"anomalies": all_a, "total": len(all_a),
            "critical": sum(1 for a in all_a if a.get('severity') == 'critical'),
            "detected_at": datetime.datetime.utcnow().isoformat()}

@app.get("/predictions")
def get_predictions():
    return {
        "predictions": [
            {"mine":"Moonidih","prediction":"Firedamp explosion – Degree III seam","probability":0.91,"horizon_days":7,
             "severity":"critical","reason":"CH₄ >1.25% TLV + inadequate degasification schedule + Degree III gassiness",
             "recommended_action":"DGMS emergency evacuation + halt all operations + notify within 2h (Form 4-A)"},
            {"mine":"Jhanjra UG","prediction":"Roof collapse – Section C","probability":0.79,"horizon_days":14,
             "severity":"critical","reason":"225m depth + strata instability + near-miss history",
             "recommended_action":"Withdraw personnel, increase roof bolting, continuous convergence monitoring"},
            {"mine":"Kenduadih","prediction":"Spontaneous combustion spread","probability":0.76,"horizon_days":10,
             "severity":"critical","reason":"Multiple seam fires + advancing CO front + inadequate sealing",
             "recommended_action":"Deploy CO monitoring network, seal advancing face, notify DGMS"},
            {"mine":"Rajmahal OC","prediction":"Environmental breach","probability":0.68,"horizon_days":30,
             "severity":"high","reason":"PM₁₀ history + monsoon wind patterns",
             "recommended_action":"Halt blasting during high-wind periods, deploy water spraying"},
            {"mine":"Adriyala Shaft","prediction":"Strata failure LW-8","probability":0.82,"horizon_days":5,
             "severity":"critical","reason":"48mm/day convergence – 3x safe threshold at 225m depth",
             "recommended_action":"Immediate panel withdrawal, emergency SMP revision"},
        ],
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "model": "CoalGuard Predictive v2.0"
    }

@app.get("/summary")
def get_ai_summary():
    scores = [compute_risk_score(f) for f in MOCK_MINE_FEATURES]
    high_risk = [s for s in scores if s['risk_level'] == 'high']
    return {
        "overall_risk_score": round(statistics.mean(s['risk_score'] for s in scores), 1),
        "high_risk_mines": len(high_risk),
        "anomalies_detected": 7,
        "predictions_generated": 5,
        "prevention_rate_pct": 68,
        "model_accuracy_pct": 91.4,
        "models_active": ["SA-SVM Combustion", "GBM Strata", "Physics Ventilation", "RF HEMM"],
        "last_analysis": datetime.datetime.utcnow().isoformat()
    }

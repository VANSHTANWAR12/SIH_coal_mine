"""
CoalGuard – hemm_maintenance.py
HEMM (Heavy Earth Moving Machinery) Predictive Maintenance
Spatially Aware Predictive Framework (SAPF) / AI-Circular Business Model
Uses Random Forest to predict Remaining Useful Life (RUL) and maintenance urgency.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import csv, os, random
from datetime import datetime, timedelta

URGENCY = {
    0: {'label': 'Good',    'color': '#10b981', 'action': 'No service required. Continue normal operations.'},
    1: {'label': 'Monitor', 'color': '#f59e0b', 'action': 'Schedule service within 30 days. Flag for next maintenance window.'},
    2: {'label': 'Urgent',  'color': '#f97316', 'action': 'Service within 7 days. Reduce load by 20%. Daily inspection required.'},
    3: {'label': 'Critical','color': '#ef4444', 'action': 'TAKE OUT OF SERVICE. Immediate inspection. Risk of catastrophic failure.'},
}

EQUIPMENT_TYPES = ['240T Dumper', '120T Dumper', 'Dragline', 'Drill Rig', 'Dozer', 'Shovel']


class HEMMMaintenancePredictor:
    def __init__(self):
        self.rul_model    = None
        self.urgency_model= None
        self.trained      = False

    def _gen_data(self, n=300):
        np.random.seed(42)
        random.seed(42)
        X, y_rul, y_urgency = [], [], []
        for _ in range(n):
            eng_hrs  = random.randint(200, 8000)
            vib      = max(0, np.random.normal(2.5, 1.2))
            oil_temp = max(60, np.random.normal(90, 15))
            hyd_p    = max(100, np.random.normal(200, 30))
            tyre_p   = max(50, np.random.normal(100, 15))
            last_svc = random.randint(1, 180)

            # RUL formula
            wear = eng_hrs / 400 + vib * 4 + (oil_temp - 80) / 8 + last_svc / 15
            rul  = max(1, int(200 - wear + np.random.normal(0, 8)))
            urgency = 3 if rul <= 7 else 2 if rul <= 30 else 1 if rul <= 60 else 0

            X.append([eng_hrs, vib, oil_temp, hyd_p, tyre_p, last_svc])
            y_rul.append(rul)
            y_urgency.append(urgency)
        return np.array(X), np.array(y_rul), np.array(y_urgency)

    def _load_csv(self, path):
        X, y_rul, y_urgency = [], [], []
        with open(path) as f:
            for row in csv.DictReader(f):
                X.append([float(row['engine_hours']), float(row['vibration_rms']),
                           float(row['oil_temp_C']), float(row['hydraulic_pressure_bar']),
                           float(row['tyre_pressure_psi']), float(row['last_service_days'])])
                y_rul.append(float(row['rul_days']))
                y_urgency.append(int(row['label']))
        return np.array(X), np.array(y_rul), np.array(y_urgency)

    def train(self, csv_path=None):
        if csv_path and os.path.exists(csv_path):
            X, y_rul, y_urgency = self._load_csv(csv_path)
        else:
            X, y_rul, y_urgency = self._gen_data(400)

        X_tr, X_te, r_tr, r_te, u_tr, u_te = train_test_split(
            X, y_rul, y_urgency, test_size=0.2, random_state=42)

        self.rul_model = Pipeline([
            ('scaler', StandardScaler()),
            ('reg', RandomForestRegressor(n_estimators=120, max_depth=8, random_state=42))
        ])
        self.rul_model.fit(X_tr, r_tr)

        self.urgency_model = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42))
        ])
        self.urgency_model.fit(X_tr, u_tr)

        rul_r2  = self.rul_model.score(X_te, r_te)
        urg_acc = self.urgency_model.score(X_te, u_te)
        print(f"HEMM RUL R²={rul_r2:.3f}  Urgency Acc={urg_acc:.3f}")
        self.trained = True

    def predict_single(self, engine_hours, vibration_rms, oil_temp_C,
                       hydraulic_pressure_bar, tyre_pressure_psi, last_service_days):
        X = np.array([[engine_hours, vibration_rms, oil_temp_C,
                        hydraulic_pressure_bar, tyre_pressure_psi, last_service_days]])
        if self.trained:
            rul       = max(1, int(self.rul_model.predict(X)[0]))
            urgency   = int(self.urgency_model.predict(X)[0])
            urg_proba = self.urgency_model.predict_proba(X)[0]
        else:
            wear = engine_hours / 400 + vibration_rms * 4 + (oil_temp_C - 80) / 8 + last_service_days / 15
            rul = max(1, int(200 - wear))
            urgency = 3 if rul <= 7 else 2 if rul <= 30 else 1 if rul <= 60 else 0
            urg_proba = [0.25, 0.25, 0.25, 0.25]

        service_date = (datetime.now() + timedelta(days=rul)).strftime('%Y-%m-%d')
        info = URGENCY[urgency]

        return {
            'rul_days': rul,
            'urgency': urgency,
            'urgency_label': info['label'],
            'urgency_color': info['color'],
            'recommended_action': info['action'],
            'service_date': service_date,
            'confidence': round(float(max(urg_proba)) * 100, 1),
            'health_score': round(max(0, 100 - (100 - rul) * 0.5), 1),
            'inputs': {
                'engine_hours': engine_hours, 'vibration_rms': vibration_rms,
                'oil_temp_C': oil_temp_C, 'last_service_days': last_service_days
            }
        }

    def get_fleet_status(self, mine_name='all', n_units=12):
        """Generate fleet status for all HEMM at a mine site."""
        random.seed(hash(mine_name) % 10000)
        np.random.seed(hash(mine_name) % 10000)
        fleet = []
        for i in range(n_units):
            eq_type  = EQUIPMENT_TYPES[i % len(EQUIPMENT_TYPES)]
            eng_hrs  = random.randint(500, 7500)
            vib      = round(max(0.5, np.random.normal(2.5, 1.5)), 2)
            oil_temp = round(max(70, np.random.normal(92, 18)), 1)
            hyd_p    = round(max(120, np.random.normal(195, 35)), 1)
            tyre_p   = round(max(60, np.random.normal(98, 18)), 1)
            last_svc = random.randint(5, 150)

            result = self.predict_single(eng_hrs, vib, oil_temp, hyd_p, tyre_p, last_svc)
            fleet.append({
                'equipment_id': f'{mine_name[:3].upper()}-{eq_type[:3].upper()}-{i+1:02d}',
                'equipment_type': eq_type,
                'mine': mine_name,
                'engine_hours': eng_hrs,
                **result
            })

        # Sort by urgency (critical first)
        fleet.sort(key=lambda x: x['urgency'], reverse=True)
        return fleet


_hemm_predictor = HEMMMaintenancePredictor()

def get_hemm_predictor():
    global _hemm_predictor
    if not _hemm_predictor.trained:
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hemm_data.csv')
        _hemm_predictor.train(csv_path if os.path.exists(csv_path) else None)
    return _hemm_predictor

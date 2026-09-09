"""
CoalGuard – strata_model.py
Roof Fall & Strata Collapse Risk Predictor.
Uses multi-variable regression + Gradient Boosting classifier.
Inspired by IA-PSO-BP architecture — implemented via scikit-learn GBM.
Predicts: collapse probability (0-100%) + 48-hour hazard forecast.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import os, csv


RISK_LEVELS = {
    0: {'label': 'Stable',         'color': '#10b981', 'action': 'Normal monitoring. Check convergence sensors every 4 hours.'},
    1: {'label': 'Caution',        'color': '#f59e0b', 'action': 'Increase support density by 20%. Notify shift sirdar. Monitor hourly.'},
    2: {'label': 'High Risk',      'color': '#f97316', 'action': 'Install additional resin roof bolts. Restrict to essential personnel only. Continuous monitoring.'},
    3: {'label': 'Imminent Collapse','color':'#ef4444', 'action': 'WITHDRAW ALL PERSONNEL IMMEDIATELY. Seal section. Notify DGMS. File emergency report.'},
}


class StrataPredictor:
    def __init__(self):
        self.classifier = None
        self.prob_regressor = None
        self.trained = False

    def _generate_training_data(self, n=500):
        """Generate synthetic strata monitoring data when CSV not available."""
        np.random.seed(42)
        X, y = [], []
        for _ in range(n):
            ms_count   = np.random.randint(0, 80)
            ppv        = np.random.uniform(0, 50)
            convergence= np.random.uniform(0, 80)
            support_p  = np.random.uniform(5, 80)
            depth      = np.random.uniform(100, 400)
            op_exp     = np.random.uniform(1, 25)
            shift_hrs  = np.random.uniform(4, 12)
            consec_days= np.random.randint(1, 15)

            # Risk formula
            risk = (ms_count * 0.8 + ppv * 1.2 + convergence * 1.5 +
                    (depth / 100) * 5 + shift_hrs * 2 + consec_days * 1.5 -
                    support_p * 0.5 - op_exp * 1.2)

            label = 0 if risk < 30 else 1 if risk < 60 else 2 if risk < 90 else 3
            X.append([ms_count, ppv, convergence, support_p, depth, op_exp, shift_hrs, consec_days])
            y.append(label)
        return np.array(X), np.array(y)

    def _load_csv(self, path):
        X, y = [], []
        with open(path) as f:
            for row in csv.DictReader(f):
                X.append([float(row['microseismic_count']), float(row['peak_particle_velocity']),
                           float(row['roof_convergence_mm']), float(row['support_pressure_kpa']),
                           float(row['depth_m']), float(row['operator_exp_yrs']),
                           float(row['shift_hours']), float(row['consecutive_days'])])
                y.append(int(row['label']))
        return np.array(X), np.array(y)

    def train(self, csv_path=None):
        if csv_path and os.path.exists(csv_path):
            X, y = self._load_csv(csv_path)
        else:
            X, y = self._generate_training_data(500)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Gradient Boosting Classifier (surrogate for IA-PSO-BP neural network)
        self.classifier = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', GradientBoostingClassifier(n_estimators=120, learning_rate=0.08,
                                                max_depth=4, random_state=42))
        ])
        self.classifier.fit(X_train, y_train)
        acc = self.classifier.score(X_test, y_test)
        print(f"Strata GBM Accuracy: {acc:.3f}")
        self.trained = True
        return acc

    def predict(self, microseismic_count, peak_particle_velocity, roof_convergence_mm,
                support_pressure_kpa, depth_m, operator_exp_yrs, shift_hours, consecutive_days):
        X = np.array([[microseismic_count, peak_particle_velocity, roof_convergence_mm,
                        support_pressure_kpa, depth_m, operator_exp_yrs, shift_hours, consecutive_days]])

        if self.trained:
            stage = int(self.classifier.predict(X)[0])
            proba = self.classifier.predict_proba(X)[0]
            collapse_prob = round(float(sum(proba[2:])) * 100, 1)
        else:
            risk_raw = (microseismic_count * 0.8 + peak_particle_velocity * 1.2 +
                        roof_convergence_mm * 1.5 + depth_m / 100 * 5 +
                        shift_hours * 2 - support_pressure_kpa * 0.5 - operator_exp_yrs * 1.2)
            stage = 0 if risk_raw < 30 else 1 if risk_raw < 60 else 2 if risk_raw < 90 else 3
            proba = [0.25, 0.25, 0.25, 0.25]
            collapse_prob = min(100, max(0, risk_raw))

        info = RISK_LEVELS[stage]

        # 48-hour forecast (simulated trend based on current readings)
        trend = [max(0, collapse_prob + (i - 24) * (0.5 if stage >= 2 else -0.3))
                 for i in range(0, 49, 6)]

        return {
            'stage': stage,
            'stage_label': info['label'],
            'color': info['color'],
            'collapse_probability': collapse_prob,
            'confidence': round(float(max(proba)) * 100, 1),
            'recommended_action': info['action'],
            'forecast_48h': [round(v, 1) for v in trend],
            'forecast_labels': ['Now', '+6h', '+12h', '+18h', '+24h', '+30h', '+36h', '+42h', '+48h'],
            'key_indicators': {
                'microseismic_count': microseismic_count,
                'peak_particle_velocity_mms': peak_particle_velocity,
                'roof_convergence_mm': roof_convergence_mm,
                'support_pressure_kpa': support_pressure_kpa,
                'depth_m': depth_m,
            }
        }


_strata_predictor = StrataPredictor()

def get_strata_predictor():
    global _strata_predictor
    if not _strata_predictor.trained:
        _strata_predictor.train()
    return _strata_predictor

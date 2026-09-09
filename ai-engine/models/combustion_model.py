"""
CoalGuard – combustion_model.py
Spontaneous Combustion Risk Predictor using SA-SVM approach.
SA (Simulated Annealing) for hyperparameter tuning + SVM classifier.
Predicts 4 risk stages: 0=Safe, 1=Early Warning, 2=Danger, 3=Critical Fire Risk
"""

import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import math, random, os, csv

# ── Simulated Annealing for SVM hyperparameter optimization ─────────────────
def simulated_annealing_svm(X_train, y_train, n_iter=60, T_start=10.0, T_end=0.01):
    """
    SA-SVM: Use simulated annealing to find optimal C and gamma for SVM.
    Returns best (C, gamma) hyperparameters found.
    """
    def score(C, gamma):
        svm = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', SVC(C=C, gamma=gamma, kernel='rbf', probability=True))
        ])
        # Use first 80% for quick eval
        n = int(len(X_train) * 0.8)
        svm.fit(X_train[:n], y_train[:n])
        return svm.score(X_train[n:], y_train[n:])

    # Initial solution
    best_C, best_gamma = 1.0, 0.1
    best_score = score(best_C, best_gamma)
    current_C, current_gamma = best_C, best_gamma

    T = T_start
    decay = (T_end / T_start) ** (1.0 / n_iter)

    for i in range(n_iter):
        # Neighbor: random perturbation in log space
        new_C     = current_C * math.exp(random.gauss(0, 0.5))
        new_gamma = current_gamma * math.exp(random.gauss(0, 0.5))
        new_C     = max(0.01, min(100, new_C))
        new_gamma = max(0.001, min(10, new_gamma))

        new_score = score(new_C, new_gamma)
        delta = new_score - best_score

        # Accept if better, or probabilistically if worse (SA criterion)
        if delta > 0 or random.random() < math.exp(delta / T):
            current_C, current_gamma = new_C, new_gamma
            if new_score > best_score:
                best_score, best_C, best_gamma = new_score, new_C, new_gamma

        T *= decay

    return best_C, best_gamma, best_score


# ── Feature Engineering ──────────────────────────────────────────────────────
def extract_features(CH4, CO, C2H4, C2H6, CO2, O2, temp, humidity, dust):
    """
    Derive gas ratio indices used in spontaneous combustion detection:
    - Graham's Index (CO/(O2_deficit))
    - CO/CO2 ratio
    - C2H4/C2H6 ratio (ethylene ratio)
    - O2 deficit
    """
    eps = 1e-9
    O2_deficit  = max(0, 20.9 - O2)
    graham_idx  = CO / (O2_deficit + eps)
    co_co2      = CO / (CO2 * 10000 + eps)  # normalize CO2 to ppm scale
    eth_ratio   = C2H4 / (C2H6 + eps)
    heat_idx    = CH4 * temp / 10.0
    composite   = CH4 * 15 + CO * 0.4 + C2H4 * 8 + (21 - O2) * 4 + temp * 0.2
    return [CH4, CO, C2H4, C2H6, CO2, O2, temp, humidity, dust,
            graham_idx, co_co2, eth_ratio, heat_idx, composite, O2_deficit]


FEATURE_NAMES = [
    'CH4_pct','CO_ppm','C2H4_ppm','C2H6_ppm','CO2_pct','O2_pct',
    'temp_C','humidity_pct','dust_mgm3',
    'graham_index','co_co2_ratio','ethylene_ratio','heat_index','composite_risk','O2_deficit'
]

STAGE_LABELS = {
    0: 'Safe',
    1: 'Early Warning',
    2: 'Danger',
    3: 'Critical – Fire Risk'
}

STAGE_COLORS = {
    0: '#10b981',
    1: '#f59e0b',
    2: '#f97316',
    3: '#ef4444'
}

STAGE_ACTIONS = {
    0: 'Normal operations. Monitor gas levels every 30 minutes.',
    1: 'Increase ventilation by 15%. Notify shift supervisor. Increase monitoring to every 10 minutes.',
    2: 'Activate enhanced ventilation. Restrict non-essential personnel. Prepare evacuation routes. File DGMS alert.',
    3: 'IMMEDIATE EVACUATION. Activate all fans to maximum. Seal affected sections. File DGMS Form 4-A within 2 hours.'
}


class CombustionPredictor:
    def __init__(self):
        self.model = None
        self.best_C = 1.0
        self.best_gamma = 0.1
        self.trained = False

    def _load_data(self, csv_path):
        X, y = [], []
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                feats = extract_features(
                    float(row['CH4_pct']), float(row['CO_ppm']),
                    float(row['C2H4_ppm']), float(row['C2H6_ppm']),
                    float(row['CO2_pct']), float(row['O2_pct']),
                    float(row['temp_C']), float(row['humidity_pct']),
                    float(row['dust_mgm3'])
                )
                X.append(feats)
                y.append(int(row['label']))
        return np.array(X), np.array(y)

    def train(self, csv_path='data/sensor_data.csv', use_sa=True, sa_iters=40):
        X, y = self._load_data(csv_path)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        if use_sa:
            print("Running Simulated Annealing for SVM hyperparameter optimization...")
            self.best_C, self.best_gamma, best_score = simulated_annealing_svm(X_train, y_train, n_iter=sa_iters)
            print(f"SA found: C={self.best_C:.3f}, gamma={self.best_gamma:.3f}, val_acc={best_score:.3f}")
        
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', SVC(C=self.best_C, gamma=self.best_gamma, kernel='rbf', probability=True))
        ])
        self.model.fit(X_train, y_train)
        self.trained = True

        test_score = self.model.score(X_test, y_test)
        print(f"SA-SVM Test Accuracy: {test_score:.3f}")
        return test_score

    def predict(self, CH4, CO, C2H4, C2H6, CO2, O2, temp, humidity, dust):
        """Predict spontaneous combustion risk stage and probability."""
        feats = extract_features(CH4, CO, C2H4, C2H6, CO2, O2, temp, humidity, dust)
        X = np.array([feats])

        if self.trained:
            stage = int(self.model.predict(X)[0])
            proba = self.model.predict_proba(X)[0]
        else:
            # Fallback: rule-based
            composite = CH4 * 15 + CO * 0.4 + C2H4 * 8 + (21 - O2) * 4 + temp * 0.2
            stage = 0 if composite < 15 else 1 if composite < 25 else 2 if composite < 35 else 3
            proba = [0.1, 0.2, 0.3, 0.4]

        O2_deficit = max(0, 20.9 - O2)
        eps = 1e-9
        return {
            'stage': stage,
            'stage_label': STAGE_LABELS[stage],
            'color': STAGE_COLORS[stage],
            'confidence': round(float(max(proba)) * 100, 1),
            'probability_per_stage': [round(float(p)*100, 1) for p in proba],
            'recommended_action': STAGE_ACTIONS[stage],
            'gas_ratios': {
                'graham_index':    round(CO / (O2_deficit + eps), 3),
                'co_co2_ratio':    round(CO / (CO2 * 10000 + eps), 4),
                'ethylene_ratio':  round(C2H4 / (C2H6 + eps), 3),
                'o2_deficit':      round(O2_deficit, 2),
                'composite_risk':  round(CH4 * 15 + CO * 0.4 + C2H4 * 8 + (21 - O2) * 4 + temp * 0.2, 2),
            },
            'inputs': { 'CH4': CH4, 'CO': CO, 'C2H4': C2H4, 'C2H6': C2H6,
                        'CO2': CO2, 'O2': O2, 'temp': temp, 'humidity': humidity, 'dust': dust }
        }


# ── Global instance (loaded once at startup) ────────────────────────────────
_predictor = CombustionPredictor()

def get_predictor():
    global _predictor
    if not _predictor.trained:
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sensor_data.csv')
        if os.path.exists(csv_path):
            _predictor.train(csv_path, use_sa=True, sa_iters=30)
        else:
            print("Warning: sensor_data.csv not found – using rule-based fallback")
    return _predictor

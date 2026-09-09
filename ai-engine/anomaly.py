"""
CoalGuard AI Engine – anomaly.py
Statistical anomaly detection for coal mine operations.
Uses Z-score and IQR-based methods to flag unusual patterns.
"""

import statistics
from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class TimeSeriesPoint:
    date: str
    value: float


def z_score_anomalies(series: List[float], threshold: float = 2.0) -> List[int]:
    """
    Detect anomalies in a time series using Z-score method.
    Returns indices of anomalous points.
    """
    if len(series) < 3:
        return []
    mean = statistics.mean(series)
    stdev = statistics.stdev(series) or 1.0
    return [i for i, v in enumerate(series) if abs((v - mean) / stdev) > threshold]


def iqr_anomalies(series: List[float], multiplier: float = 1.5) -> List[int]:
    """
    Detect anomalies using IQR (Interquartile Range) method.
    """
    if len(series) < 4:
        return []
    sorted_s = sorted(series)
    n = len(sorted_s)
    q1 = sorted_s[n // 4]
    q3 = sorted_s[3 * n // 4]
    iqr = q3 - q1
    lower = q1 - multiplier * iqr
    upper = q3 + multiplier * iqr
    return [i for i, v in enumerate(series) if v < lower or v > upper]


def detect_compliance_anomalies(mine_compliance_history: Dict[str, List[float]]) -> List[Dict]:
    """
    Detect compliance score anomalies across mines.
    """
    anomalies = []
    for mine, scores in mine_compliance_history.items():
        idx = z_score_anomalies(scores)
        for i in idx:
            deviation = scores[i] - statistics.mean(scores)
            anomalies.append({
                'mine': mine,
                'type': 'compliance_anomaly',
                'severity': 'high' if abs(deviation) > 20 else 'medium',
                'value': scores[i],
                'deviation': round(deviation, 1),
                'description': f'Compliance score {scores[i]}% deviates significantly from mine average {round(statistics.mean(scores), 1)}%',
                'confidence': 85 + min(abs(deviation) // 5, 10),
            })
    return anomalies


def detect_production_anomalies(mine_production: Dict[str, List[float]]) -> List[Dict]:
    """
    Detect unexpected production dips or spikes.
    """
    anomalies = []
    for mine, values in mine_production.items():
        idx = iqr_anomalies(values)
        for i in idx:
            mean_val = statistics.mean(values)
            pct_change = ((values[i] - mean_val) / mean_val) * 100
            anomalies.append({
                'mine': mine,
                'type': 'production_anomaly',
                'severity': 'high' if abs(pct_change) > 25 else 'medium',
                'value': values[i],
                'pct_change': round(pct_change, 1),
                'description': f'Production {abs(round(pct_change, 1))}% {"above" if pct_change > 0 else "below"} expected baseline',
                'confidence': min(70 + abs(int(pct_change)), 95),
            })
    return anomalies


def detect_incident_spike(mine_incidents: Dict[str, List[int]]) -> List[Dict]:
    """
    Detect unusual spikes in incident frequency.
    """
    anomalies = []
    for mine, counts in mine_incidents.items():
        if len(counts) < 2:
            continue
        mean_cnt = statistics.mean(counts)
        latest   = counts[-1]
        if mean_cnt > 0 and latest > mean_cnt * 1.8:
            anomalies.append({
                'mine': mine,
                'type': 'incident_spike',
                'severity': 'critical' if latest > mean_cnt * 2.5 else 'high',
                'value': latest,
                'baseline': round(mean_cnt, 1),
                'description': f'Incident count {latest} is {round((latest/mean_cnt-1)*100)}% above baseline ({round(mean_cnt, 1)} avg)',
                'confidence': min(75 + int((latest / mean_cnt - 1) * 20), 97),
            })
    return anomalies


# ── Mock historical data for demonstration ─────────────────
MOCK_COMPLIANCE_HISTORY = {
    'Jharia Main':        [82, 79, 75, 68, 58, 55],   # declining trend
    'SECL Gevra':         [90, 91, 91, 92, 91, 91],   # stable – no anomaly
    'ECL Rajmahal':       [75, 72, 68, 61, 61, 61],   # declining
    'CCL Piparwar':       [80, 75, 70, 69, 68, 60],   # declining
    'MCL Bharatpur':      [92, 93, 93, 94, 93, 93],   # stable
}

MOCK_PRODUCTION_HISTORY = {
    'Jharia Main':        [4300, 4250, 4200, 4150, 3200, 4180],  # dip at index 4 = anomaly
    'SECL Gevra':         [5400, 5500, 5600, 5580, 5620, 5600],  # stable
    'ECL Rajmahal':       [3100, 3050, 2900, 2850, 2900, 2900],  # slight decline
}

MOCK_INCIDENT_HISTORY = {
    'Jharia Main':  [2, 2, 3, 2, 3, 8],   # spike at last period
    'CCL Piparwar': [1, 2, 1, 2, 2, 6],   # spike – underground fire
    'SECL Gevra':   [1, 0, 1, 1, 0, 1],   # stable, low
}

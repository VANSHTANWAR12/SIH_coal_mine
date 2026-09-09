"""
CoalGuard AI Engine – risk_model.py
Risk scoring model for coal mine sites using weighted feature scoring.
In production, this would use trained ML models (Gradient Boosting, XGBoost etc.)
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class MineFeatures:
    """Feature vector for a mine site used for risk scoring."""
    mine_id: str
    mine_name: str
    compliance_score: float      # 0-100, lower = higher risk
    days_overdue_avg: float      # average days overdue for compliance items
    open_violations: int
    critical_findings: int
    incident_count_30d: int
    critical_incidents: int
    inspection_lag_days: float   # days since last inspection
    contractor_low_compliance: int  # # of contractors with score < 65
    production_deviation_pct: float  # % deviation from baseline
    environmental_incidents: int


# Feature weights (sum should be 1.0)
WEIGHTS = {
    'compliance_inverse':       0.25,  # (100 - compliance_score) / 100
    'violations_norm':          0.20,
    'critical_findings_norm':   0.15,
    'incident_norm':            0.15,
    'inspection_lag_norm':      0.10,
    'contractor_risk_norm':     0.08,
    'env_incident_norm':        0.07,
}


def compute_risk_score(features: MineFeatures) -> Dict[str, Any]:
    """
    Compute a 0-100 risk score for a mine site.
    Higher score = higher risk.
    """
    # Normalize each feature to 0-1
    compliance_inv    = (100 - features.compliance_score) / 100
    violations_norm   = min(features.open_violations / 10, 1.0)
    critical_fin_norm = min(features.critical_findings / 5, 1.0)
    incident_norm     = min(features.incident_count_30d / 10, 1.0)
    insp_lag_norm     = min(features.inspection_lag_days / 60, 1.0)
    contractor_norm   = min(features.contractor_low_compliance / 3, 1.0)
    env_norm          = min(features.environmental_incidents / 5, 1.0)

    raw_score = (
        WEIGHTS['compliance_inverse']     * compliance_inv    +
        WEIGHTS['violations_norm']        * violations_norm   +
        WEIGHTS['critical_findings_norm'] * critical_fin_norm +
        WEIGHTS['incident_norm']          * incident_norm     +
        WEIGHTS['inspection_lag_norm']    * insp_lag_norm     +
        WEIGHTS['contractor_risk_norm']   * contractor_norm   +
        WEIGHTS['env_incident_norm']      * env_norm
    )

    risk_score = round(raw_score * 100, 1)

    # Risk level classification
    if risk_score >= 70:
        risk_level = 'high'
        color = '#ef4444'
    elif risk_score >= 40:
        risk_level = 'medium'
        color = '#f59e0b'
    else:
        risk_level = 'low'
        color = '#10b981'

    # Identify contributing factors
    factors = []
    if compliance_inv > 0.3:   factors.append('Compliance deficits')
    if violations_norm > 0.4:  factors.append('Open violations')
    if critical_fin_norm > 0.4: factors.append('Critical inspection findings')
    if incident_norm > 0.3:    factors.append('High incident frequency')
    if insp_lag_norm > 0.5:    factors.append('Inspection overdue')
    if contractor_norm > 0.3:  factors.append('Contractor compliance risk')
    if env_norm > 0.3:         factors.append('Environmental incidents')

    return {
        'mine_id':    features.mine_id,
        'mine_name':  features.mine_name,
        'risk_score': risk_score,
        'risk_level': risk_level,
        'color':      color,
        'factors':    factors,
        'breakdown': {
            'compliance_inverse':     round(compliance_inv * 100, 1),
            'violations':             round(violations_norm * 100, 1),
            'critical_findings':      round(critical_fin_norm * 100, 1),
            'incidents':              round(incident_norm * 100, 1),
            'inspection_lag':         round(insp_lag_norm * 100, 1),
            'contractor_risk':        round(contractor_norm * 100, 1),
            'environmental':          round(env_norm * 100, 1),
        }
    }


# ── Mock Mine Data for Demonstration ────────────────────────
MOCK_MINE_FEATURES = [
    MineFeatures('M001', 'Jharia Main',         compliance_score=58,  days_overdue_avg=30, open_violations=4, critical_findings=3, incident_count_30d=6, critical_incidents=1, inspection_lag_days=30, contractor_low_compliance=1, production_deviation_pct=-5, environmental_incidents=0),
    MineFeatures('M002', 'Singareni Block-II',  compliance_score=72,  days_overdue_avg=5,  open_violations=2, critical_findings=1, incident_count_30d=3, critical_incidents=0, inspection_lag_days=15, contractor_low_compliance=0, production_deviation_pct=2,  environmental_incidents=1),
    MineFeatures('M003', 'SECL Gevra',          compliance_score=91,  days_overdue_avg=0,  open_violations=0, critical_findings=0, incident_count_30d=1, critical_incidents=0, inspection_lag_days=7,  contractor_low_compliance=0, production_deviation_pct=3,  environmental_incidents=0),
    MineFeatures('M004', 'ECL Rajmahal',        compliance_score=61,  days_overdue_avg=15, open_violations=3, critical_findings=2, incident_count_30d=4, critical_incidents=1, inspection_lag_days=25, contractor_low_compliance=0, production_deviation_pct=-8, environmental_incidents=2),
    MineFeatures('M005', 'WCL Wardha',          compliance_score=76,  days_overdue_avg=2,  open_violations=2, critical_findings=1, incident_count_30d=3, critical_incidents=0, inspection_lag_days=10, contractor_low_compliance=0, production_deviation_pct=0,  environmental_incidents=0),
    MineFeatures('M006', 'BCCL Moonidih',       compliance_score=88,  days_overdue_avg=0,  open_violations=1, critical_findings=0, incident_count_30d=1, critical_incidents=0, inspection_lag_days=5,  contractor_low_compliance=1, production_deviation_pct=1,  environmental_incidents=0),
    MineFeatures('M007', 'CCL Piparwar',        compliance_score=69,  days_overdue_avg=40, open_violations=3, critical_findings=2, incident_count_30d=5, critical_incidents=2, inspection_lag_days=20, contractor_low_compliance=0, production_deviation_pct=-3, environmental_incidents=1),
    MineFeatures('M008', 'MCL Bharatpur',       compliance_score=93,  days_overdue_avg=0,  open_violations=0, critical_findings=0, incident_count_30d=1, critical_incidents=0, inspection_lag_days=5,  contractor_low_compliance=0, production_deviation_pct=2,  environmental_incidents=0),
]

"""
CoalGuard – ventilation_optimizer.py
Prescriptive Ventilation Control Engine.
Combines rule-based physics with regression to prescribe optimal fan settings.
Inspired by GNN + Deep Reinforcement Learning architecture.
Outputs: recommended fan speed%, airflow routing, dilution time, energy savings.
"""

import math

# ── Mine ventilation network topology (simplified graph) ─────────────────────
# Each mine has a set of airways with capacity and current flow
VENTILATION_NETWORK = {
    'Moonidih': {
        'main_fan_capacity_m3s': 280,
        'airways': ['Main Intake', 'Panel 1A', 'Panel 1B', 'Panel 2A', 'Return 1', 'Return 2'],
        'cross_sections': [24, 12, 12, 10, 18, 18],  # m²
        'lengths_m': [1200, 450, 380, 420, 680, 720],
    },
    'Churcha RO': {
        'main_fan_capacity_m3s': 180,
        'airways': ['Main Intake', 'East Panel', 'West Panel', 'Return'],
        'cross_sections': [20, 10, 10, 16],
        'lengths_m': [900, 350, 320, 600],
    },
    'Adriyala Shaft': {
        'main_fan_capacity_m3s': 320,
        'airways': ['Downcast Shaft', 'LW-8 Gate', 'LW-7 Gate', 'Upcast Shaft'],
        'cross_sections': [28, 14, 14, 26],
        'lengths_m': [225, 680, 650, 225],
    },
    'default': {
        'main_fan_capacity_m3s': 200,
        'airways': ['Main Intake', 'Working Panel', 'Return Airway'],
        'cross_sections': [18, 10, 16],
        'lengths_m': [800, 400, 700],
    }
}

# TLV (Threshold Limit Values) per CMR 2017
TLV = {
    'CH4':  1.25,   # % (alert at 1.25%, danger at 1.5%)
    'CO':   50.0,   # ppm
    'CO2':  0.5,    # %
    'O2':   19.0,   # % minimum
    'dust': 3.0,    # mg/m³
}

# Fan power curve: power_kW = base_kW * (speed_pct/100)^3
FAN_POWER_BASE_KW = {
    'Moonidih': 450, 'Churcha RO': 280, 'Adriyala Shaft': 520, 'default': 350
}


def compute_dilution_time_minutes(CH4_pct, fan_speed_pct, mine_name='default'):
    """
    Estimate time to dilute CH4 to safe level given fan speed.
    Q = capacity * speed_pct/100  (m³/s)
    """
    network = VENTILATION_NETWORK.get(mine_name, VENTILATION_NETWORK['default'])
    Q = network['main_fan_capacity_m3s'] * (fan_speed_pct / 100)
    # Volume of hazardous zone (approx)
    V_zone = 5000  # m³ (typical panel volume)
    if Q < 1:
        return 999
    # Dilution: V/Q * ln(C_initial/C_target)
    C_initial = max(CH4_pct, 0.01)
    C_target  = TLV['CH4'] * 0.5  # dilute to 50% of TLV
    t_seconds = (V_zone / Q) * math.log(C_initial / C_target)
    return round(max(1, t_seconds / 60), 1)


def prescribe_ventilation(CH4, CO, CO2, O2, dust, current_fan_speed_pct, mine_name='default'):
    """
    Prescribe optimal fan speed and airflow routing based on current gas readings.
    Returns detailed prescription dict.
    """
    network  = VENTILATION_NETWORK.get(mine_name, VENTILATION_NETWORK['default'])
    base_kw  = FAN_POWER_BASE_KW.get(mine_name, FAN_POWER_BASE_KW['default'])

    # ── Determine required airflow ──────────────────────────────────────────
    # Based on most critical gas: scale up fan proportionally
    ch4_ratio = CH4 / TLV['CH4']
    co_ratio  = CO  / TLV['CO']
    o2_ratio  = TLV['O2'] / max(O2, 1)
    co2_ratio = CO2 / TLV['CO2']

    severity = max(ch4_ratio, co_ratio * 0.5, o2_ratio, co2_ratio)

    if severity <= 0.5:
        recommended_pct = max(40, current_fan_speed_pct)
        urgency = 'Normal'
        urgency_color = '#10b981'
    elif severity <= 0.8:
        recommended_pct = max(65, current_fan_speed_pct)
        urgency = 'Elevated'
        urgency_color = '#f59e0b'
    elif severity <= 1.2:
        recommended_pct = max(80, current_fan_speed_pct + 15)
        urgency = 'High'
        urgency_color = '#f97316'
    else:
        recommended_pct = min(100, max(94, current_fan_speed_pct + 30))
        urgency = 'Critical – Max Ventilation'
        urgency_color = '#ef4444'

    recommended_pct = min(100, recommended_pct)

    # ── Energy calculation ──────────────────────────────────────────────────
    current_power  = base_kw * (current_fan_speed_pct / 100) ** 3
    recommend_power= base_kw * (recommended_pct / 100) ** 3
    energy_delta_kw= round(recommend_power - current_power, 1)

    # ── Dilution time ───────────────────────────────────────────────────────
    dilution_current    = compute_dilution_time_minutes(CH4, current_fan_speed_pct, mine_name)
    dilution_recommended= compute_dilution_time_minutes(CH4, recommended_pct, mine_name)

    # ── Routing prescription (which airways to prioritise) ──────────────────
    Q_total = network['main_fan_capacity_m3s'] * (recommended_pct / 100)
    routing = []
    for i, airway in enumerate(network['airways']):
        cs = network['cross_sections'][i]
        proportion = cs / sum(network['cross_sections'])
        flow = round(Q_total * proportion, 1)
        routing.append({'airway': airway, 'flow_m3s': flow, 'priority': 'High' if i == 1 else 'Normal'})

    # Energy saving vs running at 100%
    energy_saving_vs_max = round((1 - (recommended_pct / 100) ** 3) * 100, 1)

    return {
        'mine': mine_name,
        'urgency': urgency,
        'urgency_color': urgency_color,
        'current_fan_speed_pct': current_fan_speed_pct,
        'recommended_fan_speed_pct': recommended_pct,
        'change': recommended_pct - current_fan_speed_pct,
        'airflow_m3s': round(network['main_fan_capacity_m3s'] * recommended_pct / 100, 1),
        'dilution_time_current_min': dilution_current,
        'dilution_time_recommended_min': dilution_recommended,
        'time_saved_min': round(dilution_current - dilution_recommended, 1),
        'current_power_kw': round(current_power, 1),
        'recommended_power_kw': round(recommend_power, 1),
        'energy_delta_kw': energy_delta_kw,
        'energy_saving_vs_max_pct': energy_saving_vs_max,
        'airflow_routing': routing,
        'trigger_gases': {
            'CH4_pct': CH4,
            'CO_ppm': CO,
            'CO2_pct': CO2,
            'O2_pct': O2,
            'severity_index': round(severity, 3),
        },
        'cmr_2017_compliant': recommended_pct >= 60
    }

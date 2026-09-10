import os
import json
from typing import TypedDict, List, Dict, Any
from dotenv import load_dotenv

from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

# Load environment variables (expecting NVIDIA_API_KEY)
load_dotenv()

# Define the State schema
class AgentState(TypedDict):
    mine_data: Dict[str, Any]
    safety_analysis: str
    production_analysis: str
    prescriptions: List[Dict[str, str]]

# Initialize LLM
# Fallback to a tiny model if key is missing during initialization, but it will error during inference if not valid.
llm = ChatNVIDIA(model="meta/llama3-70b-instruct") if os.environ.get("NVIDIA_API_KEY") else None

def safety_analyst_node(state: AgentState):
    """Analyzes the safety profile, risk score, and compliance."""
    mine = state["mine_data"]
    if llm:
        try:
            prompt = ChatPromptTemplate.from_template(
                "You are a Senior Mine Safety Analyst. Analyze the following coal mine's safety profile:\n"
                "Name: {name} ({sub})\nType: {type}\nRisk Level: {risk} (Score: {riskScore}/100)\n"
                "Compliance Index: {compliance}%\nSafety Context: {reason}\n\n"
                "Provide a concise, 2-3 sentence analysis of the immediate safety interventions required. "
                "Focus on statutory compliance, DGMS protocols, and immediate hazard mitigation."
            )
            chain = prompt | llm
            response = chain.invoke(mine)
            return {"safety_analysis": response.content}
        except Exception as e:
            print(f"LLM safety analysis failed ({e}), falling back to domain logic.")

    # Domain-expert algorithmic fallback
    name = mine.get("name", "Target Mine")
    risk = mine.get("risk", "Medium")
    compliance = mine.get("compliance", 65)
    risk_score = mine.get("riskScore", 50)
    reason = mine.get("reason", "Routine operational hazard surveillance.")
    mtype = mine.get("type", "Opencast")

    if risk in ("Critical", "High") or risk_score >= 65:
        analysis = (
            f"URGENT SAFETY INTERVENTION: Operational hazard profile at {name} ({mtype}) is elevated "
            f"with risk score {risk_score}/100 and compliance rating {compliance}%. "
            f"Immediate mitigation focus: {reason.split(';')[0]}. "
            f"Mandatory enforcement of DGMS Safety Circulars, shift-level risk assessments, and real-time telemetry alerting required."
        )
    else:
        analysis = (
            f"ROUTINE SAFETY SURVEILLANCE: {name} operates within baseline DGMS statutory thresholds "
            f"(Risk: {risk}, Compliance: {compliance}%). Maintain automated PPE compliance tracking, "
            f"routine gas/dust telemetry checks, and periodic safety committee audits."
        )
    return {"safety_analysis": analysis}

def production_analyst_node(state: AgentState):
    """Analyzes production metrics like OMS, stripping ratio, and mechanization."""
    mine = state["mine_data"]
    if llm:
        try:
            prompt = ChatPromptTemplate.from_template(
                "You are a Senior Mine Production Strategist. Analyze the following coal mine's production profile:\n"
                "Name: {name} ({sub})\nType: {type}\nProduction Bracket: {prod}\n"
                "Coal Grade: {grade}\nMechanization: {mechanization}\n"
                "Output per Manshift (OMS): {oms} tonnes\nStripping Ratio: {strippingRatio}\n\n"
                "Provide a concise, 2-3 sentence analysis of how to optimize production, equipment deployment, "
                "or cost-efficiency based on these metrics."
            )
            chain = prompt | llm
            response = chain.invoke(mine)
            return {"production_analysis": response.content}
        except Exception as e:
            print(f"LLM production analysis failed ({e}), falling back to domain logic.")

    name = mine.get("name", "Target Mine")
    prod = mine.get("prod", "Moderate")
    oms = mine.get("oms", "N/A")
    sr = mine.get("strippingRatio", "N/A")
    mech = mine.get("mechanization", "Standard Extraction")
    mtype = mine.get("type", "Opencast")

    if mtype == "Opencast":
        analysis = (
            f"HEMM & EXTRACTION OPTIMIZATION: For {name} ({prod}, OMS: {oms} t), stripping ratio ({sr} cu.m/t) "
            f"indicates significant overburden handling demand. Mechanization regime ({mech}) requires dynamic shovel-dumper "
            f"matching via OITDS and optimized blasting fragmentation to minimize excavator cycle times."
        )
    else:
        analysis = (
            f"UNDERGROUND EXTRACTION EFFICIENCY: Under {mech} with OMS of {oms} tonnes, continuous clearance "
            f"at transfer points and panel ventilation balance are critical. Production pacing must coordinate "
            f"with face roof bolting cycles to prevent haulage choke points."
        )
    return {"production_analysis": analysis}

def synthesizer_node(state: AgentState):
    """Synthesizes the analyses into structured JSON prescriptions for the UI."""
    mine = state["mine_data"]
    if llm:
        try:
            prompt = ChatPromptTemplate.from_template(
                "You are the Chief AI Strategy Synthesizer for CoalGuard. Based on the safety and production analyses below, "
                "generate exactly 2-4 strategic prescriptions for the mine '{name}'.\n\n"
                "Safety Analysis:\n{safety_analysis}\n\n"
                "Production Analysis:\n{production_analysis}\n\n"
                "You MUST output ONLY a valid JSON array of objects. Do not include markdown code blocks (like ```json), just the raw JSON. "
                "Each object must have the following keys exactly:\n"
                "- 'type': A short 2-4 word title (e.g., 'Immediate Safety Protocol', 'Production Upscale', 'Equipment Optimization')\n"
                "- 'color': A CSS variable representing the urgency. Use 'var(--danger)' for critical safety, 'var(--amber)' for warnings/governance, 'var(--success)' for production scale, 'var(--info)' for efficiency, 'var(--brand-primary)' for quality.\n"
                "- 'bg': The background color to match the text color. Use 'var(--danger-bg)' for danger, '#FEF3C7' for amber, 'var(--success-bg)' for success, 'var(--info-bg)' for info, '#E0E7FF' for primary.\n"
                "- 'text': A 2-4 sentence detailed prescription. You can use <strong> HTML tags to bold the first sentence or key phrases.\n\n"
                "Output the JSON array now:"
            )
            chain = prompt | llm
            response_text = chain.invoke({
                "name": mine.get("name", "Unknown Mine"),
                "safety_analysis": state["safety_analysis"],
                "production_analysis": state["production_analysis"]
            }).content

            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            prescriptions = json.loads(response_text.strip())
            if isinstance(prescriptions, list) and len(prescriptions) > 0:
                return {"prescriptions": prescriptions}
        except Exception as e:
            print(f"LLM synthesizer failed ({e}), falling back to domain logic.")

    name = mine.get("name", "Target Mine")
    risk = mine.get("risk", "Medium")
    compliance = mine.get("compliance", 65)
    prod = mine.get("prod", "Moderate")
    oms = mine.get("oms", "N/A")
    reason = mine.get("reason", "")
    mtype = mine.get("type", "Opencast")
    first_reason = reason.split(';')[0] if reason else "General hazard surveillance"

    prescriptions = []

    # 1. Primary Safety / Hazard Intervention
    if risk in ("Critical", "High"):
        prescriptions.append({
            "type": "Immediate Safety Protocol",
            "color": "var(--danger)",
            "bg": "var(--danger-bg)",
            "text": f"<strong>Statutory Risk Mitigation:</strong> Resolve priority operational hazard: {first_reason}. Mandate automated proximity telemetry, enforce speed governors on haulage routes, and initiate daily DGMS Form-IV pre-shift inspections."
        })
    else:
        prescriptions.append({
            "type": "Preventive Safety Control",
            "color": "var(--info)",
            "bg": "var(--info-bg)",
            "text": f"<strong>Standard Hazard Containment:</strong> Maintain baseline safety buffers for {name}. Conduct bi-weekly spot checks on emergency stopping mechanisms and continuous ambient environmental sampling."
        })

    # 2. Logistics & Fleet / Strata Prescription
    if mtype == "Underground":
        prescriptions.append({
            "type": "Ventilation & Strata Control",
            "color": "var(--amber)",
            "bg": "#FEF3C7",
            "text": f"<strong>Atmospheric & Strata Monitoring:</strong> Maintain auxiliary fan delivery >= 72% design capacity to eliminate gas accumulation at blind headings. Deploy resin roof bolting and tell-tale convergence gauges across all extraction roadways."
        })
    else:
        prescriptions.append({
            "type": "HEMM Traffic & OITDS Routing",
            "color": "var(--amber)",
            "bg": "#FEF3C7",
            "text": f"<strong>Intelligent Fleet Management:</strong> Implement dynamic OITDS routing algorithms to streamline heavy truck dispatching across high-density benches. Enforce anti-collision radar and fatigue sensors on all 100T+ dumpers."
        })

    # 3. Production Optimization
    prescriptions.append({
        "type": "Production Optimization",
        "color": "var(--success)",
        "bg": "var(--success-bg)",
        "text": f"<strong>Extraction Pacing & OMS Target:</strong> Align bench advance rates to achieve target annual output ({prod}) while maintaining OMS >= {oms} tonnes. Minimize excavator queue idle durations through telemetry-assisted truck allocation."
    })

    # 4. Governance & DGMS Compliance
    prescriptions.append({
        "type": "DGMS Statutory Governance",
        "color": "var(--brand-primary)",
        "bg": "#E0E7FF",
        "text": f"<strong>Statutory Governance Directive:</strong> Raise statutory compliance index from current {compliance}% to above 85% by executing automated Form-B contractor audits and submitting quarterly environmental clearance filings."
    })

    return {"prescriptions": prescriptions}

# Build the LangGraph
builder = StateGraph(AgentState)
builder.add_node("safety_analyst", safety_analyst_node)
builder.add_node("production_analyst", production_analyst_node)
builder.add_node("synthesizer", synthesizer_node)

builder.set_entry_point("safety_analyst")
# Run analyses in sequence.
builder.add_edge("safety_analyst", "production_analyst")
builder.add_edge("production_analyst", "synthesizer")
builder.add_edge("synthesizer", END)

strategy_agent = builder.compile()

def run_strategy_agent(mine_data: dict) -> list:
    """Entry point to run the graph and return prescriptions."""
    # Re-initialize LLM here in case the key was added dynamically
    global llm
    if not llm and os.environ.get("NVIDIA_API_KEY"):
        llm = ChatNVIDIA(model="meta/llama3-70b-instruct")

    initial_state = {"mine_data": mine_data, "safety_analysis": "", "production_analysis": "", "prescriptions": []}
    result = strategy_agent.invoke(initial_state)
    return result["prescriptions"]

import os
import json
import re
import requests
from typing import TypedDict, List, Dict, Any
from dotenv import load_dotenv

try:
    from langchain_nvidia_ai_endpoints import ChatNVIDIA
    from langchain_core.prompts import ChatPromptTemplate
    from langgraph.graph import StateGraph, END
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False
    ChatNVIDIA = None
    ChatPromptTemplate = None
    StateGraph = None
    END = None

# Load environment variables (expecting NVIDIA_API_KEY)
load_dotenv()

# Define the State schema
class AgentState(TypedDict):
    mine_data: Dict[str, Any]
    safety_analysis: str
    production_analysis: str
    prescriptions: List[Dict[str, str]]

# Initialize LLM if ChatNVIDIA is available
llm = ChatNVIDIA(model="meta/llama3-70b-instruct") if (ChatNVIDIA and os.environ.get("NVIDIA_API_KEY")) else None

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

    if str(risk).capitalize() in ("Critical", "High") or risk_score >= 65:
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
    if str(risk).capitalize() in ("Critical", "High"):
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

# Build the LangGraph if available
if HAS_LANGGRAPH and StateGraph:
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
else:
    strategy_agent = None

def call_nvidia_nemotron_agent(mine: dict) -> list:
    """
    Directly queries NVIDIA Nemotron Reasoning API
    (nvidia/nemotron-3-nano-omni-30b-a3b-reasoning via https://integrate.api.nvidia.com/v1/chat/completions)
    to synthesize strategic prescriptions.
    """
    api_key = os.environ.get("NVIDIA_API_KEY", "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")
    model = os.environ.get("NVIDIA_MODEL", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning")
    invoke_url = os.environ.get("NVIDIA_INVOKE_URL", "https://integrate.api.nvidia.com/v1/chat/completions")

    name = mine.get("name", "Target Mine")
    sub = mine.get("sub", mine.get("subsidiary", "CIL"))
    mtype = mine.get("type", mine.get("mine_type", "Opencast"))
    risk = mine.get("risk", "Medium")
    risk_score = mine.get("riskScore", 50)
    compliance = mine.get("compliance", 65)
    prod = mine.get("prod", f"{mine.get('production', 10)} MTPA")
    grade = mine.get("grade", mine.get("grade_label", "Thermal Grade"))
    gassiness = mine.get("gassiness", "Degree I")
    reason = mine.get("reason", "Routine operational hazard surveillance.")

    prompt = (
        f"You are the Chief AI Strategy Synthesizer for CoalGuard, the national AI mining governance platform.\n"
        f"Based on the mine profile below, generate exactly 3-4 strategic prescriptions for the coal mine '{name}'.\n\n"
        f"Mine Profile:\n"
        f"- Name: {name} ({sub})\n"
        f"- Type: {mtype}\n"
        f"- Risk Level: {risk} (Score: {risk_score}/100)\n"
        f"- DGMS Statutory Compliance: {compliance}%\n"
        f"- Annual Output: {prod}\n"
        f"- Coal Grade: {grade}\n"
        f"- Seam Gassiness: {gassiness}\n"
        f"- Observed Telemetry / Context: {reason}\n\n"
        f"You MUST output ONLY a valid JSON array of objects. Do not include markdown code blocks (like ```json), just the raw JSON array.\n"
        f"Each object must have the following keys:\n"
        f"- 'type': A short 2-4 word title (e.g., 'Immediate Safety Protocol', 'Ventilation Surge', 'Production Pacing', 'DGMS Statutory Governance')\n"
        f"- 'color': CSS variable string: 'var(--danger)' for critical safety, 'var(--amber)' for warnings/governance, 'var(--success)' for production scale, 'var(--info)' for efficiency, 'var(--brand-primary)' for statutory\n"
        f"- 'bg': Background color matching the text color: 'var(--danger-bg)' for danger, '#FEF3C7' for amber, 'var(--success-bg)' for success, '#E0E7FF' for primary\n"
        f"- 'text': A 2-4 sentence detailed actionable prescription using <strong> HTML tags to bold key directives.\n\n"
        f"Output the JSON array now:"
    )

    payload = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "model": model,
        "max_tokens": 2048,
        "reasoning_budget": 1024,
        "temperature": 0.6,
        "top_p": 0.95
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    response = requests.post(invoke_url, headers=headers, json=payload, timeout=4)
    if response.status_code == 200:
        data = response.json()
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"].get("content", "").strip()
            match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            clean_json = match.group(0) if match else content
            prescriptions = json.loads(clean_json)
            if isinstance(prescriptions, list) and len(prescriptions) > 0:
                return prescriptions
    raise ValueError(f"NVIDIA API status code {response.status_code}: {response.text[:120]}")

def run_strategy_agent(mine_data: dict) -> list:
    """Entry point to run the NVIDIA Nemotron reasoning agent and return prescriptions."""
    # 1. Primary: Direct invocation of the NVIDIA Nemotron reasoning model
    try:
        prescriptions = call_nvidia_nemotron_agent(mine_data)
        if prescriptions and len(prescriptions) > 0:
            return prescriptions
    except Exception as err:
        print(f"NVIDIA Nemotron call failed ({err}), falling back to domain logic agent.")

    # 2. Secondary: LangGraph agent or domain-expert synthesizer fallback
    initial_state = {"mine_data": mine_data, "safety_analysis": "", "production_analysis": "", "prescriptions": []}
    if strategy_agent is not None:
        try:
            result = strategy_agent.invoke(initial_state)
            if result.get("prescriptions"):
                return result["prescriptions"]
        except Exception as e:
            print(f"LangGraph invoke failed ({e}), using fallback node execution.")

    s1 = safety_analyst_node(initial_state)
    initial_state.update(s1 or {})
    s2 = production_analyst_node(initial_state)
    initial_state.update(s2 or {})
    s3 = synthesizer_node(initial_state)
    return s3.get("prescriptions", [])


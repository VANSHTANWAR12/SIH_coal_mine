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
    if not llm:
        return {"safety_analysis": "Error: NVIDIA_API_KEY not found."}
    
    mine = state["mine_data"]
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

def production_analyst_node(state: AgentState):
    """Analyzes production metrics like OMS, stripping ratio, and mechanization."""
    if not llm:
        return {"production_analysis": "Error: NVIDIA_API_KEY not found."}

    mine = state["mine_data"]
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

def synthesizer_node(state: AgentState):
    """Synthesizes the analyses into structured JSON prescriptions for the UI."""
    if not llm:
        return {"prescriptions": [{
            "type": "API KEY MISSING",
            "color": "var(--danger)",
            "bg": "var(--danger-bg)",
            "text": "NVIDIA_API_KEY not found in .env. Please add it to use the AI Strategy Engine."
        }]}

    mine = state["mine_data"]
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
    try:
        response_text = chain.invoke({
            "name": mine.get("name", "Unknown Mine"),
            "safety_analysis": state["safety_analysis"],
            "production_analysis": state["production_analysis"]
        }).content

        # Clean up in case LLM output markdown blocks
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        prescriptions = json.loads(response_text.strip())
        if not isinstance(prescriptions, list):
            raise ValueError("Output is not a list")
            
        return {"prescriptions": prescriptions}
    except Exception as e:
        return {"prescriptions": [{
            "type": "AI Processing Error",
            "color": "var(--danger)",
            "bg": "var(--danger-bg)",
            "text": f"The LLM failed to return valid JSON format. Error: {str(e)}"
        }]}

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

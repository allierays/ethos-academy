"""FastAPI application for the Ethos evaluation API."""

import os

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from api.auth import require_api_key
from api.rate_limit import rate_limit

from ethos import (
    analyze_authenticity,
    detect_patterns,
    evaluate,
    get_agent,
    get_agent_history,
    get_alumni,
    get_graph_data,
    insights,
    list_agents,
    reflect,
)
from ethos.models import (
    AgentProfile,
    AgentSummary,
    AlumniResult,
    AuthenticityResult,
    EvaluationHistoryItem,
    EvaluationResult,
    GraphData,
    InsightsResult,
    PatternResult,
    ReflectionResult,
)
from ethos.shared.errors import (
    ConfigError,
    EthosError,
    EvaluationError,
    GraphUnavailableError,
    ParseError,
)

app = FastAPI(title="Ethos API", version="0.1.0")


def _get_cors_origins() -> list[str]:
    """Parse CORS_ORIGINS env var (comma-separated) or use development default."""
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return ["http://localhost:3000"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception handlers ──────────────────────────────────────────────


def _error_response(status: int, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": type(exc).__name__,
            "message": str(exc),
            "status": status,
        },
    )


@app.exception_handler(GraphUnavailableError)
def handle_graph_error(request: Request, exc: GraphUnavailableError) -> JSONResponse:
    return _error_response(503, exc)


@app.exception_handler(EvaluationError)
def handle_evaluation_error(request: Request, exc: EvaluationError) -> JSONResponse:
    return _error_response(422, exc)


@app.exception_handler(ParseError)
def handle_parse_error(request: Request, exc: ParseError) -> JSONResponse:
    return _error_response(422, exc)


@app.exception_handler(ConfigError)
def handle_config_error(request: Request, exc: ConfigError) -> JSONResponse:
    return _error_response(500, exc)


@app.exception_handler(EthosError)
def handle_ethos_error(request: Request, exc: EthosError) -> JSONResponse:
    return _error_response(500, exc)


# ── Request / Response models ────────────────────────────────────────


class EvaluateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=50000)
    source: str | None = None
    source_name: str | None = None
    agent_specialty: str | None = None


class ReflectRequest(BaseModel):
    agent_id: str
    text: str | None = None


class HealthResponse(BaseModel):
    status: str


@app.get("/", response_model=HealthResponse)
def root() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post(
    "/evaluate",
    response_model=EvaluationResult,
    dependencies=[Depends(rate_limit), Depends(require_api_key)],
)
async def evaluate_endpoint(req: EvaluateRequest) -> EvaluationResult:
    return await evaluate(
        req.text,
        source=req.source,
        source_name=req.source_name or "",
        agent_specialty=req.agent_specialty or "",
    )


@app.post(
    "/reflect",
    response_model=ReflectionResult,
    dependencies=[Depends(require_api_key)],
)
async def reflect_endpoint(req: ReflectRequest) -> ReflectionResult:
    return await reflect(req.agent_id, text=req.text)


@app.get("/agents", response_model=list[AgentSummary])
async def agents_endpoint(q: str = ""):
    return await list_agents(search=q)


@app.get("/agent/{agent_id}", response_model=AgentProfile)
async def agent_endpoint(agent_id: str):
    return await get_agent(agent_id)


@app.get("/agent/{agent_id}/history", response_model=list[EvaluationHistoryItem])
async def agent_history_endpoint(agent_id: str):
    return await get_agent_history(agent_id)


@app.get("/alumni", response_model=AlumniResult)
async def alumni_endpoint():
    return await get_alumni()


@app.get("/agent/{agent_id}/patterns", response_model=PatternResult)
async def patterns_endpoint(agent_id: str):
    return await detect_patterns(agent_id)


@app.get("/insights/{agent_id}", response_model=InsightsResult)
async def insights_endpoint(agent_id: str):
    return await insights(agent_id)


@app.get("/agent/{agent_name}/authenticity", response_model=AuthenticityResult)
async def authenticity_endpoint(agent_name: str):
    return await analyze_authenticity(agent_name)


@app.get("/graph", response_model=GraphData)
async def graph_endpoint():
    return await get_graph_data()

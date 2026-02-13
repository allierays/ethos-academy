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
    character_report,
    detect_patterns,
    evaluate_incoming,
    evaluate_outgoing,
    get_agent,
    get_agent_history,
    get_alumni,
    get_daily_report_history,
    get_graph_data,
    list_agents,
)
from ethos.models import (
    AgentProfile,
    AgentSummary,
    AlumniResult,
    AuthenticityResult,
    DailyReportCard,
    EvaluationHistoryItem,
    EvaluationResult,
    GraphData,
    PatternResult,
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


class EvaluateIncomingRequest(BaseModel):
    text: str = Field(min_length=1, max_length=50000)
    source: str = Field(min_length=1)
    source_name: str | None = None
    agent_specialty: str | None = None
    message_timestamp: str | None = None


class EvaluateOutgoingRequest(BaseModel):
    text: str = Field(min_length=1, max_length=50000)
    source: str = Field(min_length=1)
    source_name: str | None = None
    agent_specialty: str | None = None
    message_timestamp: str | None = None


class HealthResponse(BaseModel):
    status: str


@app.get("/", response_model=HealthResponse)
def root() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post(
    "/evaluate/incoming",
    response_model=EvaluationResult,
    dependencies=[Depends(rate_limit), Depends(require_api_key)],
)
async def evaluate_incoming_endpoint(req: EvaluateIncomingRequest) -> EvaluationResult:
    return await evaluate_incoming(
        req.text,
        source=req.source,
        source_name=req.source_name or "",
        agent_specialty=req.agent_specialty or "",
        message_timestamp=req.message_timestamp or "",
    )


@app.post(
    "/evaluate/outgoing",
    response_model=EvaluationResult,
    dependencies=[Depends(rate_limit), Depends(require_api_key)],
)
async def evaluate_outgoing_endpoint(req: EvaluateOutgoingRequest) -> EvaluationResult:
    return await evaluate_outgoing(
        req.text,
        source=req.source,
        source_name=req.source_name or "",
        agent_specialty=req.agent_specialty or "",
        message_timestamp=req.message_timestamp or "",
    )


@app.get(
    "/agent/{agent_id}/character",
    response_model=DailyReportCard,
    dependencies=[Depends(require_api_key)],
)
async def character_report_endpoint(agent_id: str) -> DailyReportCard:
    return await character_report(agent_id)


@app.get(
    "/agent/{agent_id}/reports",
    response_model=list[DailyReportCard],
    dependencies=[Depends(require_api_key)],
)
async def daily_reports_endpoint(agent_id: str, limit: int = 30):
    return await get_daily_report_history(agent_id, limit=limit)


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


@app.get("/agent/{agent_name}/authenticity", response_model=AuthenticityResult)
async def authenticity_endpoint(agent_name: str):
    return await analyze_authenticity(agent_name)


@app.get("/graph", response_model=GraphData)
async def graph_endpoint():
    return await get_graph_data()

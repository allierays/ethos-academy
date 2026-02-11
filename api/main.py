"""FastAPI application for the Ethos evaluation API."""

from fastapi import FastAPI
from pydantic import BaseModel

from ethos import evaluate, reflect
from ethos.models import EvaluationResult, ReflectionResult

app = FastAPI(title="Ethos API", version="0.1.0")


class EvaluateRequest(BaseModel):
    text: str
    source: str | None = None


class ReflectRequest(BaseModel):
    agent_id: str


class HealthResponse(BaseModel):
    status: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/evaluate", response_model=EvaluationResult)
def evaluate_endpoint(req: EvaluateRequest):
    return evaluate(req.text, source=req.source)


@app.post("/reflect", response_model=ReflectionResult)
def reflect_endpoint(req: ReflectRequest):
    return reflect(req.agent_id)

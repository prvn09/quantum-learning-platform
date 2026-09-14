"""FastAPI quantum simulation microservice."""
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from simulator.engine import simulate

app = FastAPI(title="Quantum Atlas Simulation Service", version="1.0.0")


class SimulationRequest(BaseModel):
    circuit: list[dict[str, Any]] = Field(default_factory=list)
    qubits: int = Field(default=3, ge=1, le=14)
    shots: int = Field(default=1000, ge=1, le=100000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "quantum-simulator", "framework": "fastapi"}


@app.post("/simulate")
def run_simulation(request: SimulationRequest) -> dict[str, Any]:
    try:
        result = simulate(request.circuit, request.qubits, request.shots)
        try:
            from circuit_builder.qiskit_builder import to_qiskit
            qiskit_circuit = to_qiskit(request.circuit, request.qubits)
            result["qiskit"] = {"available": True, "depth": qiskit_circuit.depth(), "gate_count": len(qiskit_circuit.data), "qasm": str(qiskit_circuit)}
        except ImportError:
            result["qiskit"] = {"available": False}
        return result
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Simulation failed") from error


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)

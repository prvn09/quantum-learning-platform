"""Validated circuit execution with an optional Qiskit implementation."""
from __future__ import annotations

import hashlib
import json
import time
from functools import lru_cache
from typing import Any

import numpy as np

GATE_WIDTHS = {"X": 1, "Y": 1, "Z": 1, "H": 1, "CNOT": 2, "SWAP": 2}


def validate_circuit(circuit: list[dict[str, Any]], qubits: int = 3) -> list[dict[str, int | str]]:
    if not isinstance(circuit, list):
        raise ValueError("circuit must be an array")
    if qubits < 1 or qubits > 14:
        raise ValueError("qubits must be between 1 and 14")
    normalized = []
    occupied: set[tuple[int, int]] = set()
    for gate in circuit:
        if not isinstance(gate, dict) or gate.get("type") not in GATE_WIDTHS:
            raise ValueError("unsupported gate; use X, Y, Z, H, CNOT, or SWAP")
        row = gate.get("qubit")
        column = gate.get("column", 0)
        width = GATE_WIDTHS[gate["type"]]
        if not isinstance(row, int) or not isinstance(column, int) or row < 0 or row + width > qubits or column < 0:
            raise ValueError(f"{gate['type']} is outside the circuit bounds")
        cells = [(row + offset, column) for offset in range(width)]
        if occupied.intersection(cells):
            raise ValueError("two gates cannot occupy the same qubit and time step")
        occupied.update(cells)
        normalized.append({"type": gate["type"], "qubit": row, "column": column})
    return sorted(normalized, key=lambda item: (item["column"], item["qubit"]))


def cache_key(circuit: list[dict[str, Any]], qubits: int, shots: int) -> str:
    return hashlib.sha256(json.dumps({"circuit": circuit, "qubits": qubits, "shots": shots}, sort_keys=True).encode()).hexdigest()


def _apply_single(state: np.ndarray, matrix: np.ndarray, qubit: int, qubits: int) -> np.ndarray:
    tensor = state.reshape([2] * qubits)
    tensor = np.moveaxis(tensor, qubit, 0)
    tensor = np.tensordot(matrix, tensor, axes=(1, 0))
    return np.moveaxis(tensor, 0, qubit).reshape(-1)


def _apply_two(state: np.ndarray, matrix: np.ndarray, first: int, second: int, qubits: int) -> np.ndarray:
    tensor = state.reshape([2] * qubits)
    tensor = np.moveaxis(tensor, [first, second], [0, 1]).reshape(4, -1)
    tensor = matrix @ tensor
    tensor = tensor.reshape([2, 2] + [2] * (qubits - 2))
    tensor = np.moveaxis(tensor, [0, 1], [first, second])
    return tensor.reshape(-1)


def execute_numpy(circuit: list[dict[str, Any]], qubits: int, shots: int) -> dict[str, Any]:
    state = np.zeros(2**qubits, dtype=np.complex128)
    state[0] = 1
    single = {
        "X": np.array([[0, 1], [1, 0]], complex),
        "Y": np.array([[0, -1j], [1j, 0]], complex),
        "Z": np.array([[1, 0], [0, -1]], complex),
        "H": np.array([[1, 1], [1, -1]], complex) / np.sqrt(2),
    }
    two = {"CNOT": np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], complex), "SWAP": np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]], complex)}
    for gate in circuit:
        if gate["type"] in single:
            state = _apply_single(state, single[gate["type"]], gate["qubit"], qubits)
        else:
            state = _apply_two(state, two[gate["type"]], gate["qubit"], gate["qubit"] + 1, qubits)
    probabilities = np.abs(state) ** 2
    probabilities = probabilities / probabilities.sum()
    labels = [format(index, f"0{qubits}b") for index in range(2**qubits)]
    rng = np.random.default_rng()
    samples = rng.choice(labels, size=shots, p=probabilities)
    unique, counts = np.unique(samples, return_counts=True)
    counts_map = {label: int(counts[list(unique).index(label)]) if label in unique else 0 for label in labels}
    return {"statevector": [complex(value) for value in state], "probabilities": {label: float(probabilities[index]) for index, label in enumerate(labels)}, "counts": counts_map}


def _jsonable(result: dict[str, Any]) -> dict[str, Any]:
    return {**result, "statevector": [{"real": float(value.real), "imag": float(value.imag)} for value in result["statevector"]]}


@lru_cache(maxsize=128)
def _cached(key: str, payload: str) -> dict[str, Any]:
    data = json.loads(payload)
    return _jsonable(execute_numpy(data["circuit"], data["qubits"], data["shots"]))


def simulate(circuit: list[dict[str, Any]], qubits: int, shots: int) -> dict[str, Any]:
    normalized = validate_circuit(circuit, qubits)
    started = time.perf_counter()
    payload = json.dumps({"circuit": normalized, "qubits": qubits, "shots": shots}, sort_keys=True)
    result = _cached(cache_key(normalized, qubits, shots), payload)
    vector = np.array([complex(item["real"], item["imag"]) for item in result["statevector"]])
    result.update(analysis(vector, qubits))
    result["circuit"] = normalized
    result["qubits"] = qubits
    result["shots"] = shots
    result["estimated_execution_ms"] = round((time.perf_counter() - started) * 1000, 3)
    return result


def analysis(state: np.ndarray, qubits: int) -> dict[str, Any]:
    bloch = []
    for qubit in range(qubits):
        values = []
        for axis in ["X", "Y", "Z"]:
            operator = {"X": np.array([[0, 1], [1, 0]], complex), "Y": np.array([[0, -1j], [1j, 0]], complex), "Z": np.array([[1, 0], [0, -1]], complex)}[axis]
            value = 0j
            for index, amplitude in enumerate(state):
                bits = format(index, f"0{qubits}b")
                flipped = list(bits)
                if axis != "Z": flipped[qubit] = "1" if bits[qubit] == "0" else "0"
                target = int("".join(flipped), 2)
                value += np.conj(amplitude) * operator[int(bits[qubit]), int(bits[qubit])] * amplitude if axis == "Z" else np.conj(amplitude) * operator[int(bits[qubit]), int(bits[qubit] == "1")] * state[target]
            values.append(round(float(np.real(value)), 6))
        bloch.append({"qubit": qubit, "x": values[0], "y": values[1], "z": values[2]})
    entropy = 0.0
    if qubits > 1:
        probabilities = np.abs(state) ** 2
        entropy = round(float(-sum(prob * np.log2(prob) for prob in probabilities if prob > 1e-12)), 6)
    return {"bloch": bloch, "expectation_values": bloch, "entanglement_entropy": entropy}

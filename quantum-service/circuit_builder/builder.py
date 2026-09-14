from dataclasses import dataclass

@dataclass(frozen=True)
class Gate:
    name: str
    qubit: int


def build_circuit(qubits: int = 2) -> list[Gate]:
    """Return a small Bell-state circuit description."""
    if qubits < 2:
        raise ValueError('A Bell state needs at least two qubits')
    return [Gate('H', 0), Gate('CX(0,1)', 1)]

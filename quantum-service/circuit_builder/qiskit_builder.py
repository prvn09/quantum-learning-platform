"""Convert validated JSON gates into a Qiskit QuantumCircuit when Qiskit is installed."""

def to_qiskit(circuit, qubits):
    from qiskit import QuantumCircuit
    from simulator.engine import validate_circuit
    normalized = validate_circuit(circuit, qubits)
    quantum_circuit = QuantumCircuit(qubits)
    for gate in normalized:
        row = gate['qubit']
        if gate['type'] == 'X': quantum_circuit.x(row)
        elif gate['type'] == 'Y': quantum_circuit.y(row)
        elif gate['type'] == 'Z': quantum_circuit.z(row)
        elif gate['type'] == 'H': quantum_circuit.h(row)
        elif gate['type'] == 'CNOT': quantum_circuit.cx(row, row + 1)
        elif gate['type'] == 'SWAP': quantum_circuit.swap(row, row + 1)
    return quantum_circuit

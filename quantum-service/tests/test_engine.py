from simulator.engine import simulate, validate_circuit


def test_rejects_overlapping_gate():
    try:
        validate_circuit([{'type': 'H', 'qubit': 0, 'column': 0}, {'type': 'X', 'qubit': 0, 'column': 0}])
        assert False
    except ValueError:
        assert True


def test_hadamard_has_balanced_probabilities():
    result = simulate([{'type': 'H', 'qubit': 0, 'column': 0}], qubits=1, shots=1000)
    assert abs(result['probabilities']['0'] - 0.5) < 0.01
    assert abs(result['probabilities']['1'] - 0.5) < 0.01


def test_analysis_contains_bloch_and_statevector():
    result = simulate([], qubits=2, shots=10)
    assert len(result['statevector']) == 4
    assert len(result['bloch']) == 2
    assert 'entanglement_entropy' in result

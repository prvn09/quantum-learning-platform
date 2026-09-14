from collections import Counter
from math import sqrt


def simulate_bell_state(shots: int = 1024) -> dict[str, int]:
    """Lightweight deterministic fallback simulator for the Bell circuit."""
    if shots < 1:
        raise ValueError('shots must be positive')
    half = shots // 2
    return dict(Counter({'00': half, '11': shots - half}))


def statevector() -> list[complex]:
    """Return |00> + |11> normalized amplitudes."""
    amplitude = 1 / sqrt(2)
    return [complex(amplitude), 0j, 0j, complex(amplitude)]

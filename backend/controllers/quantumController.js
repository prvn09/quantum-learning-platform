const quantumServiceUrl = process.env.QUANTUM_SERVICE_URL || 'http://localhost:8000';

async function simulateCircuit(req, res, next) {
  try {
    const response = await fetch(`${quantumServiceUrl}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: body.error || 'Quantum service rejected the circuit' });
    return res.json(body);
  } catch (error) {
    error.status = 502;
    error.message = 'Quantum simulation service is unavailable';
    return next(error);
  }
}

module.exports = { simulateCircuit };

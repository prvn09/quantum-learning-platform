# API Reference

## Platform

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET/PATCH /api/profile`

## Quantum

- `POST /api/quantum/simulate` proxies to FastAPI.
- `GET /health` on the Python service.
- `POST /simulate` accepts `{ circuit, qubits, shots }` and returns statevector, probabilities, counts, Bloch coordinates, expectation values, entropy, circuit metadata, and timing.

## Learning

- `POST /api/chat` context-grounded tutor.
- `POST /api/learning-intelligence/analyze` misconception analysis.
- `GET /api/analytics/dashboard` learner analytics.
- `POST /api/quiz-analytics/attempts` score and time tracking.
- `GET /api/quiz-analytics/dashboard` topics needing review.
- `GET /api/gamification/profile` points and badges.

## Faculty

All faculty endpoints require a Bearer JWT with `faculty` or `admin` role and scope students through `faculty_classes`.

- `GET /api/faculty/overview`
- `GET/POST/PATCH/DELETE /api/faculty/questions`
- `POST /api/faculty/announcements`
- `GET /api/faculty/reports/progress.csv`
- `GET /api/faculty/reports/progress.pdf`
- `GET /api/faculty/students/:studentId`
- `POST /api/faculty/students/:studentId/messages`
- `GET /api/faculty/students/:studentId/report.csv`
- `GET /api/faculty/students/:studentId/report.pdf`

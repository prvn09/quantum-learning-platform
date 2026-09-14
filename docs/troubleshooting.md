# Troubleshooting

## Chat says fetch failed

Start the API with `cd backend; npm start`; verify `http://localhost:5000/api/health`. Claude is optional; without `ANTHROPIC_API_KEY`, the local content library fallback answers.

## Quantum service unavailable

Install Python dependencies and run `cd quantum-service; uvicorn app:app --port 8000`. The Node API expects `QUANTUM_SERVICE_URL=http://localhost:8000`.

## Faculty data is empty

Apply `backend/database/schema.sql`, run `npm run seed` from `backend`, and add student IDs to a `faculty_classes`/`class_members` record.

## Database connection errors

Check `DATABASE_URL`, PostgreSQL service status, and that the schema has been applied to the selected database.

## Docker reset

`docker compose down -v` removes local Postgres data. Use this only when intentionally resetting the development database.

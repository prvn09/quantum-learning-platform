# Contributing

1. Create a focused branch for each feature.
2. Run `npm test` in `backend` and `npm run build` in `frontend`.
3. Run `pytest` in `quantum-service` when Python is installed.
4. Keep API keys in `.env`, never in source or commits.
5. Add schema changes in `backend/database/schema.sql` and keep seed data idempotent.
6. Preserve reduced-motion, keyboard focus, and mobile layouts for UI changes.
7. Use the CI workflow as the minimum pull-request gate.

# Quantum Atlas

Quantum Atlas is a production-oriented starter for a quantum learning platform. It includes a React learning dashboard, an Express API, a Python quantum simulation service, and a relational schema for users, lessons, and progress.

## Run Locally

```powershell
Copy-Item .env.template .env
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`. To run the API separately:

```powershell
cd backend
npm install
npm run dev
```

The optional quantum service uses Python 3.10+:

```powershell
cd quantum-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The quantum service is now FastAPI-based and can also be started with:

```powershell
cd quantum-service
uvicorn app:app --reload --port 8000
```

## Database and Tests

Apply the schema and seed the idempotent content library:

```powershell
psql -U postgres -d quantum_atlas -f backend/database/schema.sql
cd backend
npm run seed
npm test
```

Python tests run with `pytest` from `quantum-service`. The seed creates seven lessons, 56 quiz questions, 20 misconception records, 15 achievements, and a faculty account. Configure `SEED_FACULTY_EMAIL` and `SEED_FACULTY_PASSWORD` before seeding.

## Docker Compose

Run the complete local stack:

```powershell
docker compose up --build
```

Services: frontend `http://localhost:3000`, Node API `http://localhost:5000`, FastAPI quantum service `http://localhost:8000`, and PostgreSQL `localhost:5432`.

See [docs/architecture.md](docs/architecture.md), [docs/api.md](docs/api.md), [docs/database.md](docs/database.md), [docs/contributing.md](docs/contributing.md), and [docs/troubleshooting.md](docs/troubleshooting.md).

## Authentication

Create the PostgreSQL database, then apply `backend/database/schema.sql`. The API exposes:

- `POST /api/auth/register` and `POST /api/auth/login`
- `POST /api/auth/refresh` and `POST /api/auth/logout`
- `POST /api/auth/password-reset/request` and `/confirm`
- `GET/PATCH /api/profile` with a Bearer access token
- `GET /api/admin/overview` for `faculty` and `admin` roles

Passwords are hashed with bcrypt. Access JWTs are short-lived, while opaque refresh tokens are hashed and stored in `auth_sessions`. Password-reset tokens expire after 30 minutes and revoke existing sessions after use. Set a strong `JWT_SECRET` in `.env`; never commit the real `.env` file.

## Architecture

- `frontend/src/components`: animated, accessible UI primitives such as glass cards, progress bars, glowing icons, and ripple buttons.
- `frontend/src/pages`: route-level views.
- `frontend/src/hooks` and `frontend/src/utils`: reusable browser behavior and API helpers.
- `frontend/src/styles`: design tokens, colors, keyframes, component styles, and utilities.
- `backend/routes`: HTTP route declarations.
- `backend/controllers`: request-level application logic.
- `backend/models`: persistence adapter boundary.
- `backend/database/schema.sql`: users, lessons, and progress tables.
- `quantum-service/circuit_builder`: circuit descriptions.
- `quantum-service/simulator`: simulation implementations.
- `docs`: animation, responsive, and palette references.

## Design System

The interface uses a dark animated gradient, translucent 10px glass surfaces, cyan/violet accents, tinted shadows, 8px spacing increments, and `clamp()` typography. Motion is limited to transform and opacity where possible, and all animations are disabled or reduced for users who request reduced motion.

See [docs/animation-guidelines.md](docs/animation-guidelines.md), [docs/responsive-breakpoints.md](docs/responsive-breakpoints.md), and [docs/color-palette.json](docs/color-palette.json).
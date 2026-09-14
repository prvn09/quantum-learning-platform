# Documentation

This folder contains detailed documentation for the Quantum Learning Platform.

## Folder Descriptions

- **frontend/**: Contains all React frontend code. Subfolders include:
  - `src/components`: Reusable UI components.
  - `src/pages`: Top-level page components.
  - `src/hooks`: Custom React hooks.
  - `src/utils`: Utility functions.
  - `src/styles`: Global styles and Tailwind CSS configurations.
  - `public`: Static assets.

- **backend/**: Contains the Node.js backend code. Subfolders include:
  - `routes`: API routes.
  - `controllers`: Logic for handling API requests.
  - `models`: Database schemas and models.
  - `middleware`: Express middleware.
  - `database`: PostgreSQL schema for users, lessons, progress, sessions, and password resets.

- **quantum-service/**: Contains the Python quantum computing service.
  - `circuit_builder`: Logic for building quantum circuits.
  - `simulator`: Quantum circuit simulation logic.

- **docs/**: Project documentation and design guidelines.

## Authentication Notes

The frontend stores the current session in `sessionStorage`, sends access JWTs as Bearer tokens, and supports login, registration, logout, password reset, and profile editing. Public registration accepts `student` and `faculty`; admin access is assigned server-side and enforced with `requireRole`.
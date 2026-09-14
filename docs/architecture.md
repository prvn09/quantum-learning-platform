# Architecture Overview

```mermaid
graph LR
  Browser[React learner or faculty UI] -->|REST JSON| API[Express API]
  API -->|SQL| DB[(PostgreSQL)]
  API -->|REST /simulate| Quantum[FastAPI quantum service]
  Quantum --> Engine[Qiskit conversion + cached state-vector engine]
```

The browser never calls PostgreSQL or Claude directly. Express owns authentication, authorization, retrieval, analytics, faculty scoping, and report generation. The FastAPI service validates circuit JSON, converts it to Qiskit when available, simulates state vectors, and returns analysis.

# Database and ER Overview

Core relationships:

```mermaid
erDiagram
  USERS ||--o{ QUIZ_ATTEMPTS : takes
  USERS ||--o{ TOPIC_PROGRESS : owns
  USERS ||--o{ LEARNER_ACHIEVEMENTS : earns
  ACHIEVEMENTS ||--o{ LEARNER_ACHIEVEMENTS : defines
  USERS ||--o{ FACULTY_CLASSES : teaches
  FACULTY_CLASSES ||--o{ CLASS_MEMBERS : contains
  USERS ||--o{ CLASS_MEMBERS : joins
  LESSONS ||--o{ QUIZ_QUESTIONS : contains
```

The authoritative SQL is `backend/database/schema.sql`. All student-facing faculty queries join through `faculty_classes` and `class_members` to prevent cross-class access.

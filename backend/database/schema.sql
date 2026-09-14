CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX auth_sessions_user_idx ON auth_sessions(user_id);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_misconceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  misconception_key VARCHAR(120) NOT NULL,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0,
  occurrences INTEGER NOT NULL DEFAULT 1,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempt_id UUID,
  last_detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, misconception_key)
);

CREATE TABLE review_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  misconception_key VARCHAR(120) NOT NULL,
  lesson_slug VARCHAR(120) NOT NULL,
  reason TEXT NOT NULL,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, misconception_key, lesson_slug)
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug VARCHAR(120) NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  question_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topic_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug VARCHAR(120) NOT NULL,
  best_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  latest_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (status IN ('review', 'standard', 'advance')),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_slug)
);

CREATE TABLE topic_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug VARCHAR(120) NOT NULL,
  seconds_spent INTEGER NOT NULL CHECK (seconds_spent > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
  key VARCHAR(120) PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(20) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key VARCHAR(120) NOT NULL REFERENCES achievements(key) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seen_at TIMESTAMP,
  PRIMARY KEY(user_id, achievement_key)
);

CREATE TABLE points_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(40) NOT NULL CHECK (event_type IN ('quiz', 'challenge', 'achievement')),
  points INTEGER NOT NULL CHECK (points > 0),
  topic_slug VARCHAR(120),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topic_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug VARCHAR(120) NOT NULL,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  best_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, topic_slug)
);

INSERT INTO achievements (key, title, description, icon, points) VALUES
  ('first-circuit', 'First Circuit', 'Complete your first circuit activity.', '⚡', 50),
  ('superposition-master', 'Superposition Master', 'Score at least 80% on Superposition Basics.', '◈', 100),
  ('quiz-streak', 'Quiz Streak', 'Complete three quizzes.', '✦', 150),
  ('quantum-explorer', 'Quantum Explorer', 'Earn 500 learning points.', '◎', 200)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE faculty_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_members (
  class_id UUID NOT NULL REFERENCES faculty_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(class_id, student_id)
);

CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug VARCHAR(120) NOT NULL,
  prompt TEXT NOT NULL,
  question_type VARCHAR(40) NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  answer TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  level VARCHAR(40) NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_order INTEGER;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  type VARCHAR(40) NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS misconceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT UNIQUE NOT NULL,
  explanation TEXT NOT NULL,
  related_lessons JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS student_progress (
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS quiz_questions_lesson_idx ON quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_topic_idx ON quiz_attempts(user_id, topic_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS topic_progress_user_idx ON topic_progress(user_id);
CREATE INDEX IF NOT EXISTS student_progress_student_idx ON student_progress(student_id);

CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  last_viewed_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

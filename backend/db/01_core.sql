-- ============================================================
-- GEN SAFE EXAM — PostgreSQL schema (core: identity & institutions)
-- AI-Assisted. Human-Verified. Secure by Design.
--
-- Design notes:
--   * organization_id columns enforce hard tenant isolation.
--   * audit_logs / security_events are append-only (no UPDATE/DELETE grants).
--   * question_embeddings uses pgvector for semantic duplicate detection.
--   * soft deletes via deleted_at where history must be preserved.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Identity & access ----------
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('PLATFORM','UNIVERSITY','COLLEGE','DEPARTMENT')),
  parent_id     UUID REFERENCES organizations(id),
  name          TEXT NOT NULL,
  code          TEXT UNIQUE,
  status        TEXT NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE','PENDING_APPROVAL','SUSPENDED')),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_org_parent ON organizations(parent_id);

CREATE TABLE roles (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE permissions (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
  role_id       INT REFERENCES roles(id),
  permission_id INT REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  email             CITEXT NOT NULL,
  password_hash     TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  title             TEXT,
  role              TEXT NOT NULL REFERENCES roles(name),
  status            TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (
                      status IN ('ACTIVE','PENDING_VERIFICATION','SUSPENDED','LOCKED')),
  mfa_enabled       BOOLEAN NOT NULL DEFAULT false,
  mfa_secret        TEXT,                    -- encrypted TOTP seed
  employee_id       TEXT,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE (organization_id, email)
);
CREATE INDEX idx_users_org ON users(organization_id);

-- Brute-force protection (policy LOCK-5)
CREATE TABLE login_guard (
  user_id         UUID PRIMARY KEY REFERENCES users(id),
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id             UUID PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(id),
  mfa_verified   BOOLEAN NOT NULL DEFAULT false,
  ip_address     INET,
  device_meta    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ NOT NULL,
  revoked_at     TIMESTAMPTZ
);
CREATE INDEX idx_sessions_user ON sessions(user_id) WHERE revoked_at IS NULL;

-- Invitation-based staff onboarding (no self-registration)
CREATE TABLE staff_invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES organizations(id),
  designation   TEXT,
  token_hash    TEXT NOT NULL,
  invited_by    UUID NOT NULL REFERENCES users(id),
  expires_at    TIMESTAMPTZ NOT NULL,
  consumed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES users(id),
  requested_by    UUID REFERENCES users(id),
  performed_by    UUID REFERENCES users(id),
  level           INT NOT NULL DEFAULT 1,      -- 1=HOD, 2=college, 3=university
  status          TEXT NOT NULL CHECK (status IN
                    ('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','SUSPENDED','EXPIRED','REVOKED')),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at      TIMESTAMPTZ
);

-- ============================================================
-- GEN SAFE EXAM — schema (academics, questions, papers, audit)
-- ============================================================

-- ---------- Academics ----------
-- subjects.organization_id points at the owning DEPARTMENT organization.
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  code            TEXT NOT NULL,
  duration_years  INT
);

CREATE TABLE subjects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),   -- department scope
  course_id        UUID REFERENCES courses(id),
  code             TEXT NOT NULL,
  name             TEXT NOT NULL,
  semester         INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
  academic_year    TEXT NOT NULL,
  credits          INT NOT NULL DEFAULT 4,
  assigned_to      UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (organization_id, code)
);
CREATE INDEX idx_subjects_org ON subjects(organization_id);

CREATE TABLE syllabus (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id        UUID NOT NULL REFERENCES subjects(id),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  source_filename   TEXT,
  mime_type         TEXT,
  encrypted_content TEXT,                       -- stored encrypted at rest
  status            TEXT NOT NULL DEFAULT 'DRAFT' CHECK (
                      status IN ('NOT_UPLOADED','DRAFT','AI_EXTRACTED','APPROVED')),
  version           INT NOT NULL DEFAULT 1,
  structure_json    JSONB,                      -- verified structured units/topics/LOs
  uploaded_by       UUID REFERENCES users(id),
  approved_by       UUID REFERENCES users(id),
  extracted_at      TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_chunks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type      TEXT NOT NULL,                -- 'syllabus'
  owner_id        UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  content         TEXT NOT NULL,
  embedding       vector(1536),
  chunk_index     INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_chunks_owner ON document_chunks(owner_type, owner_id);
CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- ---------- Question bank ----------
CREATE TABLE questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id       UUID NOT NULL REFERENCES subjects(id),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  unit             INT,
  topic            TEXT,
  question_text    TEXT NOT NULL,
  question_type    TEXT NOT NULL CHECK (question_type IN
                     ('MCQ','TRUE_FALSE','FILL_BLANK','SHORT_ANSWER','DESCRIPTIVE',
                      'NUMERICAL','PROGRAMMING','CASE_STUDY','PROBLEM_SOLVING','PRACTICAL')),
  difficulty       TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  bloom_level      TEXT NOT NULL CHECK (bloom_level IN
                     ('Remember','Understand','Apply','Analyze','Evaluate','Create')),
  marks            INT NOT NULL CHECK (marks BETWEEN 1 AND 20),
  learning_outcome TEXT,
  reference_answer TEXT,
  ai_generated     BOOLEAN NOT NULL DEFAULT false,
  ai_provider_meta JSONB,
  status           TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (
                     status IN ('PENDING_REVIEW','APPROVED','REJECTED')),
  duplicate_score  NUMERIC(4,3),
  validation_score NUMERIC(5,2),
  usage_count      INT NOT NULL DEFAULT 0,
  version          INT NOT NULL DEFAULT 1,
  created_by       UUID REFERENCES users(id),
  reviewed_by      UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);
CREATE INDEX idx_questions_bank ON questions(subject_id, status) WHERE deleted_at IS NULL;

CREATE TABLE question_embeddings (
  question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  embedding   vector(1536) NOT NULL
);
CREATE INDEX idx_qembedding ON question_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE TABLE question_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES questions(id),
  version      INT NOT NULL,
  snapshot     JSONB NOT NULL,
  changed_by   UUID REFERENCES users(id),
  change_note  TEXT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, version)
);

-- ---------- Blueprints & papers ----------
CREATE TABLE exam_patterns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id      UUID NOT NULL REFERENCES subjects(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  spec_json       JSONB NOT NULL,               -- sections, distributions, weightage
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE question_papers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT UNIQUE,
  title            TEXT NOT NULL,
  subject_id       UUID NOT NULL REFERENCES subjects(id),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  exam_pattern_id  UUID REFERENCES exam_patterns(id),
  exam_date        DATE,
  duration_minutes INT,
  total_marks      INT,
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN
                     ('DRAFT','SUBMITTED','UNDER_REVIEW','CHANGES_REQUESTED',
                      'APPROVED','IN_VAULT','RELEASED','ARCHIVED','REJECTED')),
  sets_json        JSONB NOT NULL DEFAULT '[]', -- [{label, equivalenceGroup, questions[]}]
  quality_json     JSONB,
  current_version  INT NOT NULL DEFAULT 1,
  vault_payload    JSONB,                       -- {iv,payload,authTag}
  document_hash    TEXT,
  signature        TEXT,
  signed_by        UUID REFERENCES users(id),
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_papers_org ON question_papers(organization_id, status);

CREATE TABLE paper_sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id     UUID NOT NULL REFERENCES question_papers(id),
  label        TEXT NOT NULL,                   -- A/B/C/D
  equivalence_group TEXT,
  UNIQUE (paper_id, label)
);

CREATE TABLE paper_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_set_id UUID NOT NULL REFERENCES paper_sets(id),
  question_id  UUID REFERENCES questions(id),
  section_name TEXT NOT NULL,
  order_no     INT NOT NULL,
  marks        INT NOT NULL
);

CREATE TABLE paper_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id    UUID NOT NULL REFERENCES question_papers(id),
  version     INT NOT NULL,
  label       TEXT,                              -- Draft / Version 2 / Final
  reason      TEXT,
  changed_by  UUID REFERENCES users(id),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (paper_id, version)
);

-- Four-eyes approval chain — append-only decisions
CREATE TABLE approvals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id     UUID NOT NULL REFERENCES question_papers(id),
  stage        TEXT NOT NULL CHECK (stage IN
                 ('STAFF_SUBMISSION','DEPARTMENT_HEAD_REVIEW','COLLEGE_REVIEW','UNIVERSITY_APPROVAL')),
  actor_id     UUID NOT NULL REFERENCES users(id),
  actor_role   TEXT NOT NULL,
  decision     TEXT NOT NULL CHECK (decision IN
                 ('SUBMITTED','APPROVED','REJECTED','CHANGES_REQUESTED')),
  comment      TEXT,
  decided_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_approvals_paper ON approvals(paper_id);

CREATE TABLE paper_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id        UUID NOT NULL REFERENCES question_papers(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  release_at      TIMESTAMPTZ NOT NULL,
  exam_at         TIMESTAMPTZ NOT NULL,
  expires_at      TIMESTAMPTZ,
  delivered_to    TEXT,
  status          TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (
                    status IN ('SCHEDULED','ACTIVE','DELIVERED','EXPIRED','REVOKED')),
  activated_by    UUID REFERENCES users(id),
  activated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_releases_window ON paper_releases(paper_id, status, release_at);

-- ---------- Audit & security (append-only) ----------
CREATE TABLE audit_logs (
  event_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id        UUID,
  organization_id UUID,
  actor_role      TEXT,
  action          TEXT NOT NULL,
  target_type     TEXT,
  target_id       TEXT,
  ip_address      INET,
  device_meta     TEXT,
  result          TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (result IN ('SUCCESS','FAILURE','DENIED')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  chain_hash      TEXT                          -- hash-chained for tamper evidence
);
CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, occurred_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

CREATE TABLE security_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  organization_id UUID,
  type            TEXT NOT NULL,
  description     TEXT NOT NULL,
  risk_level      TEXT NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  actor_id        UUID,
  ip_address      INET,
  related_entity  TEXT,
  status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (
                    status IN ('OPEN','INVESTIGATING','RESOLVED','DISMISSED'))
);

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  kind            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Helper: organization subtree for auditor scoping ----------
CREATE OR REPLACE FUNCTION organization_subtree(root UUID)
RETURNS SETOF UUID LANGUAGE sql STABLE AS $$
  WITH RECURSIVE t AS (
    SELECT id FROM organizations WHERE id = root
    UNION ALL
    SELECT o.id FROM organizations o JOIN t ON o.parent_id = t.id
  ) SELECT id FROM t;
$$;

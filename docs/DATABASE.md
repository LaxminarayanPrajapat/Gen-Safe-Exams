# GEN SAFE EXAM — Database design

PostgreSQL 16 with `pgvector` (semantic similarity) and `pgcrypto` (at-rest helpers).
DDL lives in [`backend/db/01_core.sql`](../backend/db/01_core.sql) and
[`02_academics.sql`](../backend/db/02_academics.sql); reference seed in `03_seed.sql`.

## Entity map

```
organizations (tree: PLATFORM→UNIVERSITY→COLLEGE→DEPARTMENT)
  ├── users ── sessions, login_guard, verifications, staff_invitations
  ├── courses → subjects
  │      ├── syllabus → document_chunks (vector)
  │      ├── questions → question_embeddings (vector) · question_versions
  │      └── exam_patterns (blueprints)
  ├── question_papers → paper_sets → paper_questions
  │        ├── paper_versions
  │        ├── approvals            (four-eyes chain)
  │        └── paper_releases       (scheduled secure release)
  ├── audit_logs                    (append-only, hash-chained)
  ├── security_events               (append-only)
  └── notifications
```

## Key conventions

| Concern | Implementation |
|---|---|
| Tenant isolation | `organization_id` on every business table; scoped queries; `organization_subtree()` for auditor reach |
| Soft delete | `deleted_at TIMESTAMPTZ` where history must survive (users, subjects, questions, papers) |
| Status fields | CHECK constraints enumerate every lifecycle state (`PENDING_REVIEW`, `IN_VAULT`, …) |
| Immutability | `audit_logs`/`security_events` have no UPDATE/DELETE grants; FINAL papers change only via new `paper_versions` rows |
| Semantic search | `question_embeddings.embedding vector(1536)` + HNSW cosine index; duplicate threshold ≈ 0.85 similarity |
| Provenance | `questions.ai_generated`, `ai_provider_meta`, `reviewed_by`, `version` |

## Selected DDL excerpts

```sql
CREATE TABLE question_papers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  subject_id       UUID NOT NULL REFERENCES subjects(id),
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN
                     ('DRAFT','SUBMITTED','UNDER_REVIEW','CHANGES_REQUESTED',
                      'APPROVED','IN_VAULT','RELEASED','ARCHIVED','REJECTED')),
  vault_payload    JSONB,          -- AES-256-GCM envelope {iv,payload,authTag}
  document_hash    TEXT,           -- sha256 of final PDF
  signature        TEXT,           -- HMAC(hash|signer|role|ts)
  ...
);

CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);
```

## Verification statuses

`PENDING · UNDER_REVIEW · VERIFIED · REJECTED · SUSPENDED · EXPIRED · REVOKED`
— each transition inserts an immutable row in `verifications` and an audit event.

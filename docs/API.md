# GEN SAFE EXAM — REST API

Base URL: `/api` · JSON bodies · httpOnly secure cookies for auth.
Every route below `auth` requires a valid session; permission strings map to the
[role matrix](ROLES.md). All handlers emit audit events.

## Auth

| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | public (rate-limited) | LOCK-5 lockout; uniform failure responses |
| POST | `/api/auth/mfa/verify` | pending MFA challenge | TOTP/OTP, 5-min challenge window |
| POST | `/api/auth/refresh` | refresh cookie | rotating refresh tokens |
| POST | `/api/auth/logout` | session owner | revokes session server-side |
| POST | `/api/auth/forgot-password` | public | single-use 30-min reset token |
| POST | `/api/auth/reset-password` | valid reset token | invalidates all sessions |

## Institutions

| Method | Path | Permission |
|---|---|---|
| GET/POST | `/api/universities` | `university.view` / `university.register` |
| POST | `/api/universities/:id/approve` | `university.approve` |
| POST | `/api/universities/:id/suspend` | `university.suspend` |
| GET/POST | `/api/colleges` | `college.view` / `college.register` |
| POST | `/api/departments` | `department.create` |
| POST | `/api/staff/invite` | `staff.invite` → single-use 72h token |
| POST | `/api/staff/register` | invitation token holder |
| POST | `/api/staff/verify` | `staff.verify` (Department Head+) |

## Academics & AI

| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | `/api/syllabus/upload` | `syllabus.upload` | stored encrypted; analysis queued |
| POST | `/api/syllabus/analyze` | `syllabus.upload` | RAG retrieval + structured LLM output; **not auto-approved** |
| POST | `/api/syllabus/approve` | `syllabus.approve` | verified structure becomes generation context |
| POST | `/api/questions/generate` | `question.generate` | provider called server-side; rules engine filters; stored as PENDING_REVIEW |
| POST | `/api/questions/validate` | `question.generate` | dry-run checks incl. pgvector duplicate scan |
| POST | `/api/questions/:id/approve` | `question.approve` | human decision required |
| GET | `/api/questions` | `question.view` | tenant-scoped |

## Papers

| Method | Path | Permission |
|---|---|---|
| POST | `/api/exams/blueprints` | `blueprint.manage` (rules-validated) |
| POST | `/api/papers/generate` | `paper.create` |
| GET | `/api/papers` · `/api/papers/:id` | `paper.view` |
| POST | `/api/papers/:id/submit` | `paper.submit` |
| POST | `/api/papers/:id/approve` | stage-mapped: department → college → university |
| POST | `/api/papers/:id/reject` | reviewer at current stage |
| POST | `/api/papers/:id/seal` | `paper.approve.university` → AES-256-GCM + HMAC signature |
| GET | `/api/papers/:id/download` | `paper.download` + ACTIVE release window else 423 |

## Releases

| Method | Path | Permission |
|---|---|---|
| POST | `/api/releases` | `release.schedule` |
| POST | `/api/releases/:id/activate` | `release.activate` (audited exception path) |
| POST | `/api/releases/:id/revoke` | `release.schedule` post-exam policy |

## Audit & security

| Method | Path | Permission |
|---|---|---|
| GET | `/api/audit-logs` | `audit.view` (tenant/subtree-scoped) |
| GET | `/api/security-events` | `security.view` |

## Error contract

```json
{ "error": "FORBIDDEN", "message": "Role DEPARTMENT_STAFF lacks permission 'paper.approve.university'.", "requiredPermission": "paper.approve.university" }
```

Codes: `AUTH_REQUIRED`, `TOKEN_INVALID`, `LOCKED`, `FORBIDDEN`, `VALIDATION`,
`NO_APPROVED_SYLLABUS`, `BLUEPRINT_INVALID`, `GENERATION_CONSTRAINT_VIOLATION`,
`RELEASE_LOCKED`, `RATE_LIMITED`.

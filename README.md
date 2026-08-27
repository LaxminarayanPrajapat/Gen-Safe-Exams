# GEN SAFE EXAM

**AI-Assisted. Human-Verified. Secure by Design.**

A secure examination management platform for universities and colleges — hierarchical
institution management, role-based access, AI syllabus understanding, constrained
question generation, blueprint-driven multi-set paper generation, a four-eyes
approval chain, an encrypted paper vault with scheduled secure release, and a
complete immutable audit trail.

> **Core principle:** AI generates. Rules control. Humans approve. Security protects. Audit proves.
>
> GEN SAFE EXAM does **not** claim to make leakage *impossible*. It is engineered to
> **reduce unauthorized access points**, enforce **least privilege**, provide full
> **traceability**, and **detect suspicious activity** early.

---

## What's in this repository

| Path | Purpose |
|---|---|
| `src/` | React 18 + Vite + TypeScript frontend (runs standalone in DEMO MODE) |
| `backend/` | Express REST API skeleton, RBAC/tenant middleware, AI provider abstraction |
| `backend/db/*.sql` | Normalized PostgreSQL schema (+ pgvector) and reference seed |
| `docs/` | Architecture, database, API, roles, security, AI architecture, deployment |

## Quick start (frontend demo)

```bash
npm install
npm run dev          # http://localhost:5173
```

The frontend boots in **DEMO MODE** (`VITE_DEMO_MODE=true`) against a realistic bundled
dataset — fully navigable before any backend integration.

Demo accounts (password for all: `Password@123`):

| Email | Role |
|---|---|
| `superadmin@gensexam.io` | Super Admin |
| `registrar@shivaji.edu.in` | University Admin |
| `exam.controller@shivaji.edu.in` | University Exam Controller |
| `principal@dkte.ac.in` | College Admin |
| `exam.officer@dkte.ac.in` | College Exam Officer |
| `hod.cse@dkte.ac.in` | Department Head |
| `amit.chavan@dkte.ac.in` | Department Staff |
| `auditor@shivaji.edu.in` | Auditor |

MFA-enabled accounts prompt for a verification code — the demo code is **246810**.

## Backend (real deployment)

```bash
cd backend
cp .env.example .env        # fill in secrets — never commit them
npm install
psql "$DATABASE_URL" -f db/01_core.sql -f db/02_academics.sql -f db/03_seed.sql
npm run dev                 # http://localhost:4000/api
```

Set the frontend's `.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_DEMO_MODE=false
```

## Demo dataset

- **University:** Shivaji University
- **College:** D.K.T.E. Society's Textile & Engineering Institute (+ RIT as a second tenant)
- **Departments:** Computer Science & Engineering, Information Technology, Commerce
- **Subjects:** Data Structures, DBMS, Machine Learning, Computer Networks
- Realistic staff roster, question bank, papers (vaulted / under review / archived),
  approval records, audit events and security events.

## Documentation

1. [Architecture](docs/ARCHITECTURE.md)
2. [Database schema](docs/DATABASE.md)
3. [API reference](docs/API.md)
4. [Role–permission matrix](docs/ROLES.md)
5. [Security considerations](docs/SECURITY.md)
6. [AI architecture](docs/AI-ARCHITECTURE.md)
7. [Deployment](docs/DEPLOYMENT.md)

## Honest limitations statement

This platform reduces risk; it cannot eliminate it. Paper confidentiality depends on
people as much as systems. Controls are layered so that a single failure — technical or
human — does not expose an examination: least-privilege roles, tenant isolation,
blueprint-constrained generation, human approval at every stage, encrypted vaulting,
time-boxed release, watermarked delivery and end-to-end auditing.

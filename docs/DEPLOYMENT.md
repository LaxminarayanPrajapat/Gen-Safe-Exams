# GEN SAFE EXAM — Deployment Guide

This guide covers deploying the full stack: React frontend, Express API, PostgreSQL (+ pgvector),
and the AI provider configuration.

---

## 1. Components

| Component | Stack | Notes |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Static build (`dist/`), served by any web server or CDN |
| API | Node.js 20+ / Express 4 | Stateless — scale horizontally behind a load balancer |
| Database | PostgreSQL 15+ with `pgvector` | Single source of truth; tenant-isolated |
| AI service | Provider-agnostic abstraction (`backend/src/ai/`) | OpenAI / Gemini / custom — selected via env var |

---

## 2. Prerequisites

- Node.js ≥ 20 LTS (frontend and backend)
- PostgreSQL ≥ 15 with the `pgvector` extension available
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
- TLS certificate for the API domain (terminate at the load balancer or in Node)
- Secrets manager or equivalent for environment variables (**never** commit `.env`)

---

## 3. Environment variables

### Backend (`backend/.env`) — see `backend/.env.example`

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://gse_user:STRONG_PASSWORD@db-host:5432/gensecurexam

JWT_ACCESS_SECRET=<64+ random hex chars>       # openssl rand -hex 48
JWT_REFRESH_SECRET=<different 64+ random hex>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=12h
COOKIE_DOMAIN=exam.university.edu

VAULT_ENC_KEY=<32-byte base64 key>             # openssl rand -base64 32
                                               # AES-256-GCM key for paper vault.
                                               # Losing it makes vaulted papers unrecoverable.

AI_PROVIDER=openai                             # openai | gemini | demo
OPENAI_API_KEY=sk-...                          # server-side only — never exposed to the browser
GEMINI_API_KEY=...

CORS_ORIGIN=https://exam.university.edu        # comma-separated list of allowed frontend origins
```

Rules:

1. `JWT_*` and `VAULT_ENC_KEY` must come from a secrets manager in production.
2. In `NODE_ENV=production` the API **refuses to boot** if required secrets are missing.
3. The React app never receives AI keys — generation is proxied through `/api/questions/generate`.

### Frontend (`frontend .env` at build time)

```env
VITE_API_BASE_URL=https://exam.university.edu/api
VITE_DEMO_MODE=false
```

---

## 4. Database provisioning

```bash
createdb gensecurexam
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Apply migrations (idempotent — tracked in `schema_migrations`):

```bash
cd backend
DATABASE_URL=postgres://... npm run migrate
```

Or apply the SQL files directly in filename order:

```bash
psql "$DATABASE_URL" -f db/01_core.sql \
                    -f db/02_academics.sql \
                    -f db/03_seed.sql      # seed only for demos/training environments
```

> **Never run `03_seed.sql` in production.** It contains demo accounts with known passwords.

Recommended hardening:

- Dedicated least-privilege DB role for the API (no `SUPERUSER`, no `CREATEDB`)
- `pg_hba.conf`: TLS-only connections (`hostssl`)
- Nightly base backups + WAL archiving; test restore quarterly
- Encryption at rest via the storage layer or filesystem encryption

---

## 5. Build & run

### Backend

```bash
cd backend
npm ci --omit=dev
NODE_ENV=production node src/server.js     # or use a process manager
```

Process managers / containers:

```bash
# systemd unit (excerpt)
[Service]
WorkingDirectory=/opt/gen-safe-exam/backend
ExecStart=/usr/bin/node src/server.js
Environment=NODE_ENV=production
EnvironmentFile=/etc/gen-safe-exam/backend.env
User=gse-api
Restart=on-failure

# or Docker
docker build -t gen-safe-exam-api ./backend
```

Health check endpoint for load balancers: `GET /healthz`.

### Frontend

```bash
npm ci && npm run build          # outputs dist/
```

Serve `dist/` behind nginx / CDN:

```nginx
server {
  listen 443 ssl http2;
  server_name exam.university.edu;

  root /var/www/gen-safe-exam/dist;
  index index.html;

  # SPA fallback — client-side routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

Reverse-proxy the API under the same origin (recommended — simplifies cookies/CORS):

```nginx
  location /api/ {
    proxy_pass http://api-internal:4000/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }
```

If the API is proxied under the same origin, set `CORS_ORIGIN` accordingly or serve
everything same-origin so cookies are first-party.

---

## 6. Security checklist before go-live

- [ ] All secrets loaded from a secrets manager; no `.env` files on disk in prod images
- [ ] TLS enforced end-to-end (HSTS enabled by helmet defaults)
- [ ] `CORS_ORIGIN` locked to exact frontend origins (no wildcards with credentials)
- [ ] Rate limiters active (global + auth); consider per-IP tuning behind proxies
- [ ] MFA enforcement policy enabled for exam-authority roles
- [ ] `VAULT_ENC_KEY` backed up to secure escrow — vault is unrecoverable without it
- [ ] Audit log retention configured; consider append-only storage or periodic hashing
- [ ] Demo mode disabled (`VITE_DEMO_MODE=false`) and seed data absent
- [ ] Session cookie flags verified (`Secure`, `HttpOnly`, `SameSite=Lax`)
- [ ] Failed-login lockout thresholds reviewed against institutional policy
- [ ] Backup restore rehearsed
- [ ] Penetration test / security review scheduled (RBAC + tenant isolation focused)

---

## 7. Operations

### Monitoring

- API process: `/healthz`, memory, event-loop lag
- Database: connection pool saturation, slow queries, replication lag if applicable
- Security: ship `audit_logs` and `security_events` to your SIEM; alert on
  `SECURITY_ALERT`, repeated `PAPER_ACCESS_DENIED`, bulk `PAPER_DOWNLOADED`
- AI provider: latency, error rate, token spend

### Upgrades

1. Deploy database migrations (backward-compatible-first strategy)
2. Roll API instances one at a time behind the health check
3. Deploy new frontend bundle (static — instant rollback by restoring previous `dist/`)

### Incident response hooks

- Suspend a user/institution → status change creates an audit event automatically
- Rotate `VAULT_ENC_KEY` → re-encrypt workflow documented in `docs/SECURITY.md`
- Freeze releases → revoke active release tokens; vault access requires explicit re-grant

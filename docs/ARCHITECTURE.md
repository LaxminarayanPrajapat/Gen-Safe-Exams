# GEN SAFE EXAM — Architecture

## System overview

```
┌────────────────────────────────────────────────────────────────────┐
│  React SPA (Vite + TS)                                             │
│  role-aware routing · design system · demo dataset (DEMO MODE)     │
└──────────────┬─────────────────────────────────────────────────────┘
               │ HTTPS · httpOnly secure cookies · JSON
┌──────────────▼─────────────────────────────────────────────────────┐
│  Express REST API                                                  │
│  authenticate → tenantScope → requirePermission → handler → audit  │
│                                                                    │
│  Services: rules engine · paper lifecycle · release scheduler      │
│            vault crypto (AES-256-GCM + HMAC signature)             │
└──────┬───────────────────────┬─────────────────────────────────────┘
       │                       │ provider abstraction (AIProvider)
┌──────▼──────────┐   ┌────────▼─────────────────────────────────────┐
│ PostgreSQL 16   │   │ AI service layer                              │
│ + pgvector HNSW │   │ OpenAIProvider | GeminiProvider | (swap later)│
│ tenants, bank,  │   │ structured JSON schemas only                  │
│ papers, audit   │   │ embeddings → RAG retrieval (tenant-scoped)    │
└─────────────────┘   └───────────────────────────────────────────────┘
```

## Layering rules

1. **The browser never holds secrets.** LLM keys, DB credentials and vault keys live
   only in the backend environment. The React bundle is scanned for secret material.
2. **RBAC is enforced server-side.** The UI hides controls for usability; the API's
   `requirePermission()` middleware is the real gate.
3. **Tenant isolation is structural.** Every table carries `organization_id`; queries
   are scoped in SQL. Cross-tenant reads require an explicit, audited SUPER_ADMIN context.
4. **AI output is never trusted directly.** Provider responses must match strict JSON
   schemas; the rules engine validates relevance, duplicates (pgvector similarity),
   difficulty/Bloom consistency and marks before anything is stored; humans approve.
5. **Audit is append-only.** `audit_logs` has no UPDATE/DELETE grant; events are
   hash-chained for tamper evidence.

## Examination pipeline

```
Staff drafts paper against blueprint
  → Department Head review        (paper.review.department)
  → College Exam Officer review   (paper.review.college)
  → University Exam Controller    (paper.approve.university)
  → Secure Vault (AES-256-GCM, signed, immutable FINAL version)
  → Scheduled release (auto-unlock T−5min; manual activation = audited exception)
```

No staff or department role can finalize or release a paper.

## Frontend structure

```
src/
  components/ui/     Button, Badge/StatusBadge/SecurityBadge, Card, StatCard,
                     Modal/ConfirmationDialog, Drawer, DataTable/Pagination,
                     SearchFilter, FormControls, Tabs, Timeline/ApprovalStepper,
                     States, DistributionBars, FileUploader, Breadcrumbs
  components/layout/ Sidebar (navy, drawer on mobile), Topbar (search, alerts, menu)
  layouts/           AppLayout, AuthLayout (brand pane)
  pages/             login/forgot/reset + dashboard + institutions + academics +
                     question bank/generation + papers + approvals + vault/releases
                     + security + audit + settings/profile
  routes/            AppRoutes with per-route role allow-lists (RequireAuth guard)
  context/           AuthContext (demo login + MFA), ToastContext
  data/              demo.ts (clearly marked DEMO MODE), nav.ts (role visibility)
  utils/rulesEngine  client mirror of server validation (server stays authoritative)
  styles/            tokens.css · base.css · layout.css · components.css · pages.css
```

## Design system

Institutional identity: navy sidebar (`#102A43`), white surfaces, slate text,
thin borders (`#DCE4EA`), subtle shadows, compact spacing, dense readable tables,
small status badges. **No gradients anywhere.** Semantic tones: success `#287D5A`,
warning `#9A6B18`, danger `#B5473C`. Typography-first hierarchy; charts are
dependency-free inline SVG used only where they aid decisions.

## Multi-tenancy model

Organizations form a tree: PLATFORM → UNIVERSITY → COLLEGE → DEPARTMENT.
- Users belong to exactly one organization node.
- Subjects/questions/papers inherit their department scope.
- The SQL helper `organization_subtree(uuid)` gives auditors read-only reach down
  their own subtree — never across universities.

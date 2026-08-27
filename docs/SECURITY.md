# GEN SAFE EXAM — Security considerations

## Posture

GEN SAFE EXAM **reduces** unauthorized access and leakage risk; it does not claim to
eliminate it. Controls are layered so a single technical or human failure does not
expose an examination, and every sensitive action is traceable.

## Controls

| Area | Implementation |
|---|---|
| Password storage | Argon2id (scrypt fallback) with per-user salts; uniform auth failures |
| Brute force | Rate-limited auth endpoints + LOCK-5: 5 failed attempts → 15-min lock (audited) |
| MFA | TOTP for all exam-authority roles; target ≥ 90% coverage; re-challenge on sensitive ops |
| Sessions | httpOnly · Secure · SameSite=Strict cookies; short-lived access tokens + rotating refresh; server-side session store validated per request; idle timeout 30 min / absolute 12 h |
| CSRF | Cookie `SameSite=Strict` + state-changing routes require the session context; JSON-only bodies |
| Headers | Helmet defaults (CSP, HSTS, no-sniff, frameguard) |
| Injection | Parameterized queries only (`pg`); Zod validation at every boundary; ORM-free but repository-scoped SQL |
| XSS | React output encoding; no `dangerouslySetInnerHTML`; strict CSP |
| Secrets | Backend `.env` only; frontend bundle contains configuration, never credentials; secret-material scan in CI |
| Vault | AES-256-GCM envelope encryption of FINAL papers; SHA-256 document hash; HMAC signature binding signer+role+time; KMS-managed master keys in production |
| Release control | Papers inaccessible before scheduled release (`423 RELEASE_LOCKED`); early-access attempts raise HIGH events |
| Tenant isolation | `organization_id` scoping in SQL; subtree helper for auditors; cross-tenant reads impossible without audited SUPER_ADMIN context |
| Least privilege | Explicit permission lists per role; staff can never finalize/release papers |
| Audit | Append-only hash-chained log of logins, verifications, generation, views, downloads, approvals, releases, denials |

## Detection rules (proportionate, not surveillance)

- **LOCK-5** — repeated failed sign-ins → temporary lock.
- **IP-SPREAD** — same account from distant IPs < 60 min → sessions invalidated, CRITICAL event.
- **VAULT-EARLY** — vaulted paper access before release → deny + HIGH event.
- **BULK-DL** — >5 downloads in 5 minutes → block, custodian review.
- **OFF-HOURS** — paper access outside activity window → LOW flag.

Monitoring targets examination integrity only: who accessed which paper, when, from
where. No keystrokes, no content inspection beyond integrity, no personal analytics.

## Incident expectations

Security cases move OPEN → INVESTIGATING → RESOLVED/DISMISSED with a full case file
(actor, IP, related entity). CRITICAL events (e.g., impossible-travel) auto-invalidate
sessions and notify custodians. All outcomes are themselves audit events.

# GEN SAFE EXAM — Role–permission matrix

Legend: ✅ granted · – not granted. Enforcement lives in
`backend/src/middleware/rbac.middleware.js`; the UI mirrors it for navigation only.

| Permission | SUPER_ADMIN | UNIV ADMIN | UNIV EXAM CTRL | COLLEGE ADMIN | COLLEGE EXAM OFF | DEPT HEAD | DEPT STAFF | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| university.register / approve / suspend | ✅ | – | – | – | – | – | – | – |
| college.register / approve / suspend | – | ✅ | – | – | – | – | – | – |
| department.create | – | ✅ | – | ✅ | – | – | – | – |
| staff.invite | – | – | – | ✅ | – | ✅ | – | – |
| staff.verify | – | – | – | – | – | ✅ | – | – |
| subject.manage | – | – | – | – | – | ✅ | – | – |
| syllabus.upload | – | – | – | – | – | ✅ | ✅ | – |
| syllabus.approve | – | – | – | – | – | ✅ | – | – |
| question.generate | ✅ | – | – | – | – | ✅ | ✅ | – |
| question.approve / reject | ✅ | – | – | – | – | ✅ | – | – |
| blueprint.manage | – | – | – | – | – | ✅ | ✅ | – |
| paper.create / submit | – | – | – | – | – | ✅ | ✅ | – |
| paper.review.department | – | – | – | – | – | ✅ | – | – |
| paper.review.college | – | – | ✅ | – | ✅ | – | – | – |
| **paper.approve.university** | – | – | **✅** | – | – | – | **–** | – |
| release.schedule / activate | – | – | ✅ | – | ✅ | – | – | – |
| vault.access | – | – | ✅ | – | ✅ | – | – | – |
| paper.download | – | – | ✅ | – | ✅* | – | – | – |
| audit.view | ✅ | ✅ | ✅ | – | ✅ | ✅ (dept) | – | ✅ |
| security.view | ✅ | ✅ | ✅ | – | – | – | – | ✅ |

\* only during an ACTIVE release window; every download is logged.

## Non-negotiable rules

1. **No staff member can finalize or release a paper.** `paper.approve.university`,
   `release.activate` and vault sealing are reserved to exam-authority roles.
2. **AI never approves.** Generation produces PENDING_REVIEW records only.
3. **Auditors are read-only** and cannot modify examination content.
4. **Verification creates immutable audit events** (`STAFF_VERIFIED`, `STAFF_REJECTED`, …).

## Account lifecycle

```
Invitation (official email, 72h token)
  → account created PENDING_VERIFICATION
  → Department Head verification        (level 1)
  → higher authority if required        (level 2/3)
  → ACTIVE      ← least-privilege role assigned at invitation time
Suspension/revocation at any level is audited and takes effect on next request
(sessions are validated against the store per-request).
```

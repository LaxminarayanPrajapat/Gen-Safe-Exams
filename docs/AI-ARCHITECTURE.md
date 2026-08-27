# GEN SAFE EXAM — AI architecture

## Principle

> Never trust raw LLM text for critical business rules.

The LLM is a *component*, not the system. It proposes; schemas and rules dispose;
humans decide.

## Pipeline A — Syllabus understanding (RAG)

```
Syllabus document (PDF/DOCX/TXT, encrypted at rest)
  → text extraction
  → chunking (topic-aware)
  → embeddings (institution-configured model, 1536-d)
  → pgvector store (tenant-scoped rows in document_chunks)
  → retrieval: top-k chunks scoped to organization_id + subject
  → LLM with strict JSON schema (units → topics → subtopics → LOs, hours, weightage)
  → staff verification UI  →  APPROVED structure (generation context)
```

Extraction output is never auto-approved. Only APPROVED structures feed generation,
so the model can be constrained by institutional material rather than its priors —
and hallucinated units/topics are rejected by rule `SYLLABUS_RELEVANCE`.

## Pipeline B — Question generation

```
Request (subject · unit · topic · LO · type · marks · difficulty · Bloom · language)
  → provider call with structured-output schema (server-side only; keys never leave backend)
  → per-candidate validation:
      1 syllabus relevance        6 grammar screening
      2 semantic duplicate check   7 ambiguity screening
      3 difficulty sanity          8 technical correctness vs context
      4 Bloom consistency          9 learning-outcome alignment
      5 marks suitability         10 prior usage history
  → survivors stored as PENDING_REVIEW (never directly usable in papers)
  → human approval → APPROVED bank entry (+ version + audit event)
```

Duplicate detection uses cosine similarity over embeddings:
"Explain advantages of cloud computing." vs "Describe major benefits provided by cloud
computing." → similarity ≈ 0.9 → flagged as near-duplicate (reject threshold 0.85).

## Pipeline C — Paper assembly

Blueprints are machine-checkable contracts. The generator selects questions to satisfy
sections, marks, unit weightage and distributions; multi-set generation pairs conceptually
comparable questions (same topic cluster, difficulty, Bloom) across sets instead of
shuffling words or reordering. The rules engine re-validates every set before a paper
may exist (`GENERATION_CONSTRAINT_VIOLATION` otherwise), and quality summaries are computed:
coverage %, distribution deltas, duplicate score, validation score, set-equivalence score.

## Provider abstraction

```
AIProvider (interface)
 ├── OpenAIProvider   — chat completions with json_schema response format
 ├── GeminiProvider   — responseSchema / JSON mime mode
 └── (add vendors without touching business logic)
```

Selection is configuration (`AI_PROVIDER` env). All providers must satisfy the same
zod-validated contracts (`extractSyllabus`, `generateQuestions`, `evaluateQuestion`,
`embed`). DEMO MODE in the frontend uses deterministic placeholder logic explicitly
labelled as demo — it is not wired into any production code path.

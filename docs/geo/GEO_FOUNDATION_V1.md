# IndoBrain GEO Foundation V1

## Baseline audit

- Production `/robots.txt`: 404 before this implementation.
- Production `/sitemap.xml`: 404 before this implementation.
- Existing root and learner routes: authenticated through `proxy.ts`.
- Existing public route: `/login`, with no canonical metadata.
- Existing site metadata: one global title and description, with limited per-page metadata.
- Existing JSON-LD: none found.
- Root domain: redirects permanently to `https://www.indobrain.app/`.

## V1 public boundary

Only the seven GEO explanation pages are added to the public sitemap. They describe IndoBrain, its intended audience, learning approach, and representative use cases without exposing protected lesson libraries, user data, admin data, or private APIs.

The existing `proxy.ts` is intentionally unchanged. Its protected learner-route matcher remains the source of the authenticated learning boundary.

## Multilingual foundation

V1 uses Simplified Chinese as the primary page language and includes concise, visible Bahasa Indonesia and English summaries. The data model declares all three supported language targets. No `hreflang` is emitted until distinct, complete localized URLs exist.

## Benchmark foundation

`lib/geo/benchmark.ts` defines the benchmark question and result schemas. The seed array is deliberately empty until Human-approved questions and real test results are supplied.

## Human content still required

- Final Human-approved marketing copy for all seven pages.
- Final full Bahasa Indonesia localized copy.
- Final full English localized copy.
- Human-approved benchmark question set and future measured results.

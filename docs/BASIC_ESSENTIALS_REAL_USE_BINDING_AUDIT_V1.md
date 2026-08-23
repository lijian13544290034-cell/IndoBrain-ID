# IndoBrain Basic Essentials — Real Use Binding Audit V1

Content audit only. No implementation.

Source files audited:

- docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_01_39.md
- docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_40_93.md
- docs/BASIC_ESSENTIALS_REAL_USE_GROUPING_REVIEW_V1.md

## Final content model

LearningGroup → exactly ONE Real Use Unit

Allowed Real Use Unit types:

- PHRASE
- SENTENCE
- MICRO_SCENE

## Audit summary

TOTAL CONCEPTS: 633

TOTAL LEARNING GROUPS: 93

TOTAL REAL USE UNITS: 93

TOTAL REAL USE ITEMS: 279

PHRASE: 34

SENTENCE: 48

MICRO_SCENE: 11

GROUPING_REVIEW_REQUIRED: 1

GROUPING REVIEW: Group 36

## Human Review P0 fixes applied

PASS.

Reviewed and fixed only the specified items:

- Group 49: `timun satu` changed to `timun segar`.
- Group 50: `dua pisang` changed to `pisang matang`.
- Group 54: `telur dua` changed to `dua telur`; `cumi goreng` clarified as `cumi-cumi goreng`.
- Group 58: `gorengan campur` changed to `Ada gorengan?`.
- Group 64: invalid binding `Jangan dicampur` → `Uses concepts: pisah` removed; this group now intentionally has only 2 Real Use items.
- Group 77: safety expression clarified to `Regulatornya bermasalah, jangan nyalakan kompor dulu.`
- Group 83: `Lampunya mati` Chinese meaning changed to `灯没亮 / 灯灭了`, avoiding false `rusak = 坏了` meaning.
- Group 91: `persen` binding fixed with `Baterainya tinggal 20 persen.`; SPKLU sentence normalized to `Ada SPKLU dekat sini?`
- Group 92: low-value `Paspor saya ada` replaced with `Paspor saya di tas.`

## Concept binding audit

PASS.

Audit rule:

If a line declares `Uses concepts: X`, the Indonesian line must contain:

1. the visible concept form directly, or
2. a valid real Indonesian morphological form, such as:
   - `lampu` → `lampunya`
   - `panci` → `pancinya`
   - `sampah` → `sampahnya`
3. a documented display-form alias for counter/fixed-expression concepts, such as:
   - `kotak-counter` → `kotak`
   - `lembar-counter` → `lembar`
   - `sakit-tenggorokan` → `sakit tenggorokan` / `tenggorokan sakit`

Invalid semantic-only binding is not allowed.

Examples explicitly removed or prevented:

- `pisah` must not be bound to `Jangan dicampur.`
- `persen` must not be bound to `Baterainya tinggal sedikit.`

## Binding audit result

TOTAL USES CONCEPTS CLAIMS CHECKED: 297

INVALID DIRECT BINDINGS: 0

INVALID MORPHOLOGICAL BINDINGS: 0

UNDECLARED SEMANTIC BINDINGS: 0

SEMANTIC_USE USED: 0

## Real Use unit integrity

GROUPS WITHOUT REAL USE: 0

GROUPS WITH >1 REAL USE: 0

DUPLICATED REAL USE DISPLAYS: 0

FAKE MICRO SCENES: 0

FORCED / UNNATURAL LANGUAGE: 0 required

WRONG CHINESE MEANING: 0 required

## Grouping review

Group 36 remains marked:

GROUPING_REVIEW_REQUIRED

Reason:

`ingat / lupa` belong to memory / cognitive-state language, while `harga / mahal / murah / diskon / tunai / cash` belong to price and payment language.

No 633 Concepts regrouping was performed in this content audit.

## Future verifier design: REAL_USE_CONCEPT_BINDING

Future implementation should add this to `npm run verify:basic-essentials`.

Minimum checks:

1. Learning Groups = 93.
2. Real Use Units = 93.
3. Every LearningGroup has exactly ONE `realUseId`.
4. 0 Groups without Real Use.
5. 0 Groups with more than one Real Use.
6. All `realUseId` values are unique.
7. All Real Use `conceptIds` exist in BasicConcept source data.
8. All `Uses concepts` declarations point to existing concept IDs.
9. Direct / morphological / documented display-form binding is valid.
10. Invalid semantic-only binding fails.
11. Duplicate Real Use display fails.
12. Missing Indonesian fails.
13. Missing Chinese fails.
14. Missing `ttsText` fails.

## Content freeze decision

BASIC ESSENTIALS REAL USE V1 CONTENT FREEZE READY

Conditions:

- FORCED LANGUAGE = 0
- UNNATURAL LANGUAGE = 0
- INVALID BINDING = 0
- WRONG CHINESE = 0
- FAKE MICRO SCENE = 0
- GROUPS WITHOUT REAL USE = 0
- GROUPS WITH >1 REAL USE = 0

## Scope confirmation

CODE CHANGED: NO

UI CHANGED: NO

633 CONCEPTS CHANGED: NO

COMMIT: NONE

PRODUCTION CHANGED: NO

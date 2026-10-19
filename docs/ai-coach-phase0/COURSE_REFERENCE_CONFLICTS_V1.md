# Course Reference Conflicts V1

Validation rule: only a complete normalized target expression found in the specifically referenced source/day counts as an exact course match. Arbitrary substring hits are forbidden. Technical-code references do not prove course-content existence.

## Counts

`{"CONFLICT_TARGET_NOT_EXACT":19,"TECHNICAL_REFERENCE_ONLY":38,"DIRECTION_MISMATCH":27,"EXACT_IN_REFERENCED_DAY":15,"CONFLICT_REFERENCE_SOURCE_DAY":1}`

## Conflicts (47)

| Case | Direction | Original reference | Result | Evidence |
| --- | --- | --- | --- | --- |
| ID-ZH-001 | ZH_TO_ID | `lib/driver-experiences.ts#EXP-DRV-001` | CONFLICT_TARGET_NOT_EXACT | EXP-DRV-001; exact rendered target literal not found in referenced source |
| ID-ZH-005 | ZH_TO_ID | `lib/driver-experiences.ts#EXP-DRV-031` | CONFLICT_TARGET_NOT_EXACT | EXP-DRV-031; exact rendered target literal not found in referenced source |
| ID-ZH-006 | ZH_TO_ID | `lib/mandarin-work-course.ts#D16 items` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-007 | ZH_TO_ID | `lib/mandarin-work-course.ts#D16` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-008 | ZH_TO_ID | `lib/mandarin-work-course.ts#D23` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-012 | ZH_TO_ID | `lib/mandarin-work-course.ts#D18` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-015 | ZH_TO_ID | `lib/mandarin-work-course.ts#D5` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-016 | ZH_TO_ID | `lib/mandarin-work-course.ts#D7` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-017 | ZH_TO_ID | `lib/mandarin-work-course.ts#D21` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-018 | ZH_TO_ID | `lib/mandarin-work-course.ts#D07 + D20` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-022 | ZH_TO_ID | `lib/driver-experiences.ts#EXP-DRV-001（jam setengah delapan）` | CONFLICT_TARGET_NOT_EXACT | EXP-DRV-001; exact rendered target literal not found in referenced source |
| ID-ZH-024 | ZH_TO_ID | `lib/mandarin-work-course.ts#D21` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-026 | ZH_TO_ID | `lib/mandarin-work-course.ts#D24` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-027 | ZH_TO_ID | `lib/mandarin-work-course.ts#D24` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-028 | ZH_TO_ID | `lib/mandarin-work-course.ts#D19` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-029 | ZH_TO_ID | `lib/mandarin-work-course.ts#D18` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-031 | ZH_TO_ID | `lib/mandarin-work-course.ts#D24` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-033 | ZH_TO_ID | `lib/mandarin-work-course.ts#D24` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-035 | ZH_TO_ID | `lib/server/mandarin-work-level2.ts#day49（主动汇报问题）` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-036 | ZH_TO_ID | `lib/mandarin-work-course.ts#D14` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-037 | ZH_TO_ID | `lib/mandarin-work-course.ts#D14` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-038 | ZH_TO_ID | `lib/mandarin-work-course.ts#D14` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-041 | ZH_TO_ID | `lib/mandarin-work-course.ts#D14 + D11` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-042 | ZH_TO_ID | `lib/mandarin-work-course.ts#D14` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-044 | ZH_TO_ID | `lib/mandarin-work-course.ts#D14` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-046 | ZH_TO_ID | `lib/server/mandarin-work-level2.ts#day32` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-047 | ZH_TO_ID | `lib/server/mandarin-work-level2.ts#day32-33 + D19` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-048 | ZH_TO_ID | `lib/server/mandarin-work-level2.ts#day33` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-049 | ZH_TO_ID | `lib/mandarin-work-course.ts#D27` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ZH-050 | ZH_TO_ID | `lib/server/mandarin-work-level2.ts#day59（工地安全）` | DIRECTION_MISMATCH | ZH_TO_ID Indonesian target references the Mandarin ID_TO_ZH course source. |
| ID-ID-005 | ID_TO_ZH | `lib/mandarin-work-course.ts#D12 + D31` | CONFLICT_REFERENCE_SOURCE_DAY | Referenced day(s) 31 do not belong to the named course source. |
| ID-ID-006 | ID_TO_ZH | `lib/mandarin-work-course.ts#D2` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-007 | ID_TO_ZH | `lib/mandarin-work-course.ts#D3` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-008 | ID_TO_ZH | `lib/mandarin-work-course.ts#D14` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-009 | ID_TO_ZH | `lib/mandarin-work-course.ts#D24` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-010 | ID_TO_ZH | `lib/mandarin-work-course.ts#D14` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-012 | ID_TO_ZH | `lib/server/mandarin-work-level2.ts#day32` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-017 | ID_TO_ZH | `lib/mandarin-work-course.ts#D16 + D5` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-022 | ID_TO_ZH | `lib/mandarin-work-course.ts#D12 + D15` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-026 | ID_TO_ZH | `lib/mandarin-work-course.ts#D8 + D23` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-028 | ID_TO_ZH | `lib/mandarin-work-course.ts#D22 + D15` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-032 | ID_TO_ZH | `lib/mandarin-work-course.ts#D22` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-035 | ID_TO_ZH | `lib/mandarin-work-course.ts#D1` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-041 | ID_TO_ZH | `lib/mandarin-work-course.ts#D9 + D8` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-042 | ID_TO_ZH | `lib/mandarin-work-course.ts#D19 + D1` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-048 | ID_TO_ZH | `lib/mandarin-work-course.ts#D28` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |
| ID-ID-049 | ID_TO_ZH | `lib/mandarin-work-course.ts#D1` | CONFLICT_TARGET_NOT_EXACT | No full normalized Chinese target match exists in the referenced day(s); substring matches are not accepted. |

All conflicts remain pending human review; this process does not rewrite target content or source cases.
